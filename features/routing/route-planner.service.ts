import { createServerSupabase } from "@/lib/supabase/server";
import { buildMissionBrief } from "@/features/routing/mission-brief";
import { geocodeAddress, haversineMiles } from "@/lib/maps/geocoder";
import { buildVisitIntelligence } from "@/features/routing/visit-intelligence";

function firstMeaningfulScore(...values: Array<number | null | undefined>): number {
  for (const v of values) {
    if (v !== null && v !== undefined && v !== 0) return v;
  }
  return 0;
}

type DailyRouteInput = {
  startingLocation: string;
  maxDistanceMiles?: number;
  maxFacilities?: number;
  facilityTypes?: string[];
  includeAllCategories?: boolean;
};

type BestContact = {
  id: string;
  name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  needs_verification: boolean;
};

function contactDisplayName(c: {
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
}): string | null {
  if (c.full_name) return c.full_name;

  const combined = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return combined || null;
}

async function attachBestContacts(
  supabase: ReturnType<typeof createServerSupabase>,
  facilityIds: string[]
): Promise<Record<string, BestContact>> {
  if (facilityIds.length === 0) return {};

  const { data, error } = await supabase
    .from("facility_contacts")
    .select(
      "id, facility_id, full_name, first_name, last_name, title, email, phone, is_primary, confidence_score, needs_verification"
    )
    .in("facility_id", facilityIds);

  if (error) {
    console.error("[route-planner] contact lookup failed", error.message);
    return {};
  }

  const byFacility: Record<string, NonNullable<typeof data>> = {};

  for (const contact of data ?? []) {
    if (!byFacility[contact.facility_id]) {
      byFacility[contact.facility_id] = [];
    }

    byFacility[contact.facility_id].push(contact);
  }

  const best: Record<string, BestContact> = {};

  for (const [facilityId, contacts] of Object.entries(byFacility)) {
    const sorted = [...contacts].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return (b.confidence_score ?? 0) - (a.confidence_score ?? 0);
    });

    const top = sorted[0];

    if (top) {
      best[facilityId] = {
        id: top.id,
        name: contactDisplayName(top),
        title: top.title,
        email: top.email,
        phone: top.phone,
        is_primary: Boolean(top.is_primary),
        needs_verification: Boolean(top.needs_verification),
      };
    }
  }

  return best;
}

export async function generateDailyRoute(input: DailyRouteInput) {
  const supabase = createServerSupabase();

  const start = await geocodeAddress(input.startingLocation);

  const maxDistanceMiles = input.maxDistanceMiles ?? 25;
  const maxFacilities = input.maxFacilities ?? 8;
  const facilityTypes = input.facilityTypes?.length ? input.facilityTypes : [];

  let query = supabase
    .from("facilities")
    .select("*")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .eq("exclude_from_routes", false)
    .limit(3000);

  if (facilityTypes.length > 0) {
    query = query.in("facility_type", facilityTypes);
  }

  if (!input.includeAllCategories) {
    query = query
      .eq("referral_target", true)
      .not(
        "relationship_classification",
        "in",
        '("competitor","vendor","non_target")'
      )
      .or("classification_method.neq.ai,human_verified.eq.true");
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const ranked =
    data
      ?.map((facility) => {
        const distanceMiles = haversineMiles(
          { lat: start.lat, lng: start.lng },
          {
            lat: Number(facility.latitude),
            lng: Number(facility.longitude),
          }
        );

        const distanceScore = Math.max(0, 100 - distanceMiles * 4);

        // FIXED: ?? only falls through on null/undefined, NOT on 0. Since
        // opportunity_score defaults to 0 for unscored facilities (not
        // null), the old code was treating "unscored" the same as
        // "scored zero" and never checking the fallback fields. This
        // treats 0 as "not meaningfully set yet" too.
        const opportunityScore = firstMeaningfulScore(
          facility.opportunity_score,
          facility.priority_score,
          facility.referral_fit_score
        );

        const referralPotential =
          firstMeaningfulScore(facility.referral_potential, facility.referral_fit_score) || 50;

        const routeScore =
          distanceScore * 0.45 +
          opportunityScore * 0.35 +
          referralPotential * 0.2;

        const intelligence = buildVisitIntelligence(facility);
        const missionBrief = buildMissionBrief(facility);

        return {
          ...facility,
          ...intelligence,
          mission_brief: missionBrief,
          distance_miles: Number(distanceMiles.toFixed(2)),
          route_score: Number(routeScore.toFixed(1)),
          why_visit: buildWhyVisit(facility, distanceMiles),
        };
      })
      .filter((facility) => facility.distance_miles <= maxDistanceMiles)
      .filter((facility) => {
        if (!facility.next_follow_up_at) return true;
        const followUpDate = new Date(facility.next_follow_up_at);
        return followUpDate.getTime() <= Date.now();
      })
      .sort((a, b) => b.route_score - a.route_score)
      .slice(0, maxFacilities) ?? [];

  const bestContacts = await attachBestContacts(
    supabase,
    ranked.map((facility) => facility.id)
  );

  const stopsWithContacts = ranked.map((facility) => ({
    ...facility,
    best_contact: bestContacts[facility.id] ?? null,
  }));

  return {
    startingLocation: input.startingLocation,
    formattedStartingAddress: start.formattedAddress,
    start: {
      lat: start.lat,
      lng: start.lng,
    },
    maxDistanceMiles,
    maxFacilities,
    includeAllCategories: Boolean(input.includeAllCategories),
    stops: stopsWithContacts,
    summary:
      stopsWithContacts.length > 0
        ? `Found ${stopsWithContacts.length} recommended facilities within ${maxDistanceMiles} miles.`
        : input.includeAllCategories
          ? `No geocoded facilities found within ${maxDistanceMiles} miles.`
          : `No referral-target facilities found within ${maxDistanceMiles} miles. Try “include all categories.”`,
  };
}

function buildWhyVisit(facility: any, distanceMiles: number) {
  const reasons: string[] = [];

  if (!facility.last_visit_at) {
    reasons.push("Never visited");
  }

  if (facility.relationship_classification === "primary_target") {
    reasons.push("Primary referral target");
  } else if (facility.relationship_classification === "referral_source") {
    reasons.push("Referral source");
  } else if (facility.relationship_classification === "partner") {
    reasons.push("Strategic partner");
  } else if (facility.relationship_classification === "competitor") {
    reasons.push("Competitor");
  } else if (facility.relationship_classification === "vendor") {
    reasons.push("Vendor / not a care relationship");
  } else if (facility.relationship_classification === "non_target") {
    reasons.push("Not a current BlueOaks target");
  } else if (facility.referral_category === "primary_referral_target") {
    reasons.push("Primary referral target");
  } else if (facility.referral_category === "secondary_referral_target") {
    reasons.push("Potential referral partner");
  }

  if (distanceMiles <= 1) {
    reasons.push("Very close to starting point");
  } else if (distanceMiles <= 5) {
    reasons.push("Nearby on today’s route");
  }

  // FIXED: was facility.classification_reason (column doesn't exist, always
  // undefined, silently fell through to referral_target_reason every time).
  // Actual column is relationship_classification_reason.
  if (facility.relationship_classification_reason) {
    reasons.push(facility.relationship_classification_reason);
  } else if (facility.referral_target_reason) {
    reasons.push(facility.referral_target_reason);
  }

  return reasons.slice(0, 3).join(" • ") || "Nearby and worth reviewing.";
}