/**
 * Route Stop Intelligence
 * -----------------------
 * Produces the "Why visit / Who to ask for / Talking points" payload shown
 * on each Daily Route stop card.
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const CONTACT_TABLE = "facility_contacts"; // <-- adjust if your table is named differently
const STALE_DAYS = 30;

const ROLE_PRIORITY = [
  "Administrator",
  "Executive Director",
  "Admissions Director",
  "DON",
  "Director of Nursing",
  "Marketing Director",
  "Social Worker",
];

export interface FacilityForIntelligence {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  score?: number | null;
  score_reasons?: string[] | null;
  last_visit_at?: string | null;
  open_referrals_count?: number | null;
}

export interface RouteStopIntelligence {
  facilityId: string;
  whyVisit: string;
  whyVisitReasons: string[];
  recommendedContact: {
    role: string | null;
    name: string | null;
    phone: string | null;
    email: string | null;
    label: string;
  };
  talkingPoints: string[];
  generatedAt: string;
  fromCache: boolean;
}

function daysSince(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function buildWhyVisit(facility: FacilityForIntelligence): {
  summary: string;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (typeof facility.score === "number") {
    const tier =
      facility.score >= 80 ? "high" : facility.score >= 55 ? "medium" : "low";
    reasons.push(`Score ${facility.score} (${tier} priority)`);
  }

  const daysSinceVisit = daysSince(facility.last_visit_at);
  if (daysSinceVisit === null) {
    reasons.push("Never visited");
  } else if (daysSinceVisit > 30) {
    reasons.push(`No visit in ${daysSinceVisit} days`);
  }

  if (facility.open_referrals_count && facility.open_referrals_count > 0) {
    reasons.push(
      `${facility.open_referrals_count} open referral${
        facility.open_referrals_count > 1 ? "s" : ""
      }`
    );
  }

  if (facility.score_reasons?.length) {
    reasons.push(...facility.score_reasons.slice(0, 2));
  }

  if (reasons.length === 0) {
    reasons.push("Nearby on today's route");
  }

  const summary =
    reasons.length > 0
      ? reasons.slice(0, 3).join(" • ")
      : "Worth a stop while you're in the area";

  return { summary, reasons };
}

async function resolveRecommendedContact(facilityId: string) {
  const { data: contacts, error } = await supabase
    .from(CONTACT_TABLE)
    .select("id, role, name, phone, email, is_verified, confidence")
    .eq("facility_id", facilityId);

  if (error) {
    console.error("[route-intelligence] contact lookup failed", error);
  }

  const named = (contacts ?? []).filter((c) => c.name);

  named.sort((a, b) => {
    const rankA = ROLE_PRIORITY.indexOf(a.role ?? "");
    const rankB = ROLE_PRIORITY.indexOf(b.role ?? "");
    const safeRankA = rankA === -1 ? ROLE_PRIORITY.length : rankA;
    const safeRankB = rankB === -1 ? ROLE_PRIORITY.length : rankB;
    if (safeRankA !== safeRankB) return safeRankA - safeRankB;
    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });

  const best = named[0];

  if (best) {
    return {
      id: best.id as string,
      role: best.role ?? null,
      name: best.name ?? null,
      phone: best.phone ?? null,
      email: best.email ?? null,
      label: `Ask for ${best.name}${best.role ? ` (${best.role})` : ""}`,
    };
  }

  return {
    id: null,
    role: null,
    name: null,
    phone: null,
    email: null,
    label: "No confirmed contact yet — ask for the Administrator or Executive Director",
  };
}

async function generateTalkingPoints(
  facility: FacilityForIntelligence,
  whyVisit: { summary: string; reasons: string[] },
  contactLabel: string
): Promise<string[]> {
  const prompt = `You are helping a healthcare referral liaison prepare for an in-person visit to an assisted living facility.

Facility: ${facility.name}
Location: ${[facility.city, facility.state].filter(Boolean).join(", ")}
Why this visit matters: ${whyVisit.reasons.join("; ")}
Contact plan: ${contactLabel}

Write 3 to 5 short, specific talking points (each under 20 words) the liaison can use in conversation with staff. Focus on: building the relationship, understanding current referral needs/capacity, and reinforcing why our organization is a good referral partner. Do not invent facts about the facility you don't know. Avoid generic filler like "build rapport."

Return ONLY a JSON array of strings, nothing else.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.filter((p) => typeof p === "string").slice(0, 5);
    }
    return [];
  } catch (err) {
    console.error("[route-intelligence] talking point generation failed", err);
    return [
      `Ask how ${facility.name} is currently handling overflow or waitlisted admissions.`,
      "Confirm the best point of contact for future referrals.",
      "Leave updated contact info and referral packet materials.",
    ];
  }
}

function isStale(row: { generated_at: string; invalidated_at: string | null }) {
  if (row.invalidated_at) return true;
  const ageDays = daysSince(row.generated_at) ?? 0;
  return ageDays >= STALE_DAYS;
}

export async function getRouteStopIntelligence(
  facility: FacilityForIntelligence
): Promise<RouteStopIntelligence> {
  const { data: cached } = await supabase
    .from("facility_route_intelligence")
    .select("*")
    .eq("facility_id", facility.id)
    .maybeSingle();

  if (cached && !isStale(cached)) {
    return {
      facilityId: facility.id,
      whyVisit: cached.why_visit,
      whyVisitReasons: cached.why_visit_reasons ?? [],
      recommendedContact: {
        role: cached.recommended_contact_role,
        name: null,
        phone: null,
        email: null,
        label: cached.recommended_contact_label,
      },
      talkingPoints: cached.talking_points ?? [],
      generatedAt: cached.generated_at,
      fromCache: true,
    };
  }

  const whyVisit = buildWhyVisit(facility);
  const contact = await resolveRecommendedContact(facility.id);
  const talkingPoints = await generateTalkingPoints(facility, whyVisit, contact.label);

  const generatedAt = new Date().toISOString();

  const { error: upsertError } = await supabase
    .from("facility_route_intelligence")
    .upsert(
      {
        facility_id: facility.id,
        why_visit: whyVisit.summary,
        why_visit_reasons: whyVisit.reasons,
        recommended_contact_role: contact.role,
        recommended_contact_id: contact.id,
        recommended_contact_label: contact.label,
        talking_points: talkingPoints,
        source_snapshot: {
          score: facility.score ?? null,
          last_visit_at: facility.last_visit_at ?? null,
          open_referrals_count: facility.open_referrals_count ?? null,
        },
        generated_at: generatedAt,
        stale_at: new Date(Date.now() + STALE_DAYS * 86400000).toISOString(),
        invalidated_at: null,
      },
      { onConflict: "facility_id" }
    );

  if (upsertError) {
    console.error("[route-intelligence] failed to cache result", upsertError);
  }

  return {
    facilityId: facility.id,
    whyVisit: whyVisit.summary,
    whyVisitReasons: whyVisit.reasons,
    recommendedContact: contact,
    talkingPoints,
    generatedAt,
    fromCache: false,
  };
}

export async function getRouteStopIntelligenceBatch(
  facilities: FacilityForIntelligence[],
  concurrency = 4
): Promise<Record<string, RouteStopIntelligence>> {
  const results: Record<string, RouteStopIntelligence> = {};
  const queue = [...facilities];

  async function worker() {
    while (queue.length > 0) {
      const facility = queue.shift();
      if (!facility) continue;
      try {
        results[facility.id] = await getRouteStopIntelligence(facility);
      } catch (err) {
        console.error(
          `[route-intelligence] failed for facility ${facility.id}`,
          err
        );
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

export async function invalidateRouteIntelligence(facilityId: string) {
  const { error } = await supabase
    .from("facility_route_intelligence")
    .update({ invalidated_at: new Date().toISOString() })
    .eq("facility_id", facilityId);

  if (error) {
    console.error("[route-intelligence] invalidation failed", error);
  }
}