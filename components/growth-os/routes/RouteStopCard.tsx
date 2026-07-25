"use client";

import Link from "next/link";

export type Stop = {
  id: string;
  name: string;
  facility_type: string | null;
  address: string | null;
  city: string | null;
  state?: string | null;
  zip: string | null;
  phone: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance_miles: number;
  route_score: number;
  priority_score: number | null;
  opportunity_score?: number | null;
  ai_summary: string | null;
  ai_next_action: string | null;
  why_visit?: string | null;
  administrator?: string | null;
  last_visit_at?: string | null;
  next_follow_up_at?: string | null;
  best_contact?: {
    name: string | null;
    title: string | null;
    email: string | null;
    phone: string | null;
    is_primary: boolean;
    needs_verification: boolean;
  } | null;
  visit_priority?: string | null;
  visit_goal?: string | null;
  suggested_script?: string | null;
  success_criteria?: string | null;
  fallback_action?: string | null;
  // --- ADDED: mission brief ---
  mission_brief?: {
    mission_objective: string;
    why_it_matters: string[];
    ask_for_roles: string[];
    discovery_questions: string[];
    buying_signals: string[];
    likely_objections: { objection: string; response: string }[];
    leave_behind: string[];
    success_checklist: string[];
  } | null;
  // --- END ADDED ---
};

function navigateUrl(stop: Stop) {
  if (stop.latitude != null && stop.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
  }

  const destination = [stop.address, stop.city, stop.state, stop.zip]
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function priorityBadgeClasses(priority?: string | null) {
  if (priority === "high") return "bg-emerald-500/15 text-emerald-300";
  if (priority === "medium") return "bg-amber-500/15 text-amber-300";
  return "bg-slate-700 text-slate-300";
}

export function RouteStopCard({ stop, index }: { stop: Stop; index: number }) {
  const lastVisit = formatDate(stop.last_visit_at);
  const nextFollowUp = formatDate(stop.next_follow_up_at);
  const contactName = stop.best_contact?.name ?? stop.administrator ?? null;
  const contactTitle =
    stop.best_contact?.title ?? (stop.administrator ? "Administrator (unverified)" : null);
  const contactPhone = stop.best_contact?.phone ?? stop.phone ?? null;

  // Mission Brief supersedes the simpler visit_goal/success_criteria boxes
  // when present, so Ashley isn't shown two versions of the same thing.
  const hasMissionBrief = Boolean(stop.mission_brief);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-300">Stop {index + 1}</p>
        {stop.visit_priority && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${priorityBadgeClasses(
              stop.visit_priority
            )}`}
          >
            {stop.visit_priority} priority
          </span>
        )}
      </div>

      <h2 className="mt-1 text-xl font-semibold">{stop.name}</h2>

      <p className="mt-1 text-sm text-slate-400">
        {stop.facility_type} · {stop.address}, {stop.city} {stop.zip}
      </p>

      <p className="mt-3 text-sm text-slate-300">{stop.phone ?? "No phone listed"}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Distance</p>
          <p className="text-lg font-semibold text-blue-300">{stop.distance_miles} mi</p>
        </div>

        <div className="rounded-xl bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Route score</p>
          <p className="text-lg font-semibold">{stop.route_score}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Last visit</p>
          <p className="mt-0.5 text-sm text-slate-200">{lastVisit ?? "Never visited"}</p>
        </div>
        <div className="rounded-xl bg-slate-900/70 p-3">
          <p className="text-xs text-slate-500">Next follow-up</p>
          <p className="mt-0.5 text-sm text-slate-200">{nextFollowUp ?? "Not scheduled"}</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-blue-500/10 p-3 text-sm text-blue-200">
        Why visit: {stop.why_visit ?? "Nearby and worth reviewing."}
      </p>

      {/* Simpler visit_goal box — ONLY shown when there's no richer mission brief */}
      {!hasMissionBrief && stop.visit_goal && (
        <div className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-100">
          <p className="text-xs uppercase tracking-wide text-emerald-300/80">Visit goal</p>
          <p className="mt-0.5">{stop.visit_goal}</p>
        </div>
      )}

      <div className="mt-3 rounded-xl bg-slate-900/70 p-3">
        <p className="text-xs text-slate-500">Who to ask for</p>
        {contactName ? (
          <p className="mt-0.5 text-sm text-slate-200">
            {contactName}
            {contactTitle ? ` — ${contactTitle}` : ""}
            {stop.best_contact?.needs_verification && (
              <span className="ml-1.5 text-amber-400 text-xs">(unverified)</span>
            )}
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-slate-500">
            No verified contact — ask for the Administrator or Executive Director
          </p>
        )}
      </div>

      {!hasMissionBrief && stop.suggested_script && (
        <div className="mt-3 rounded-xl bg-slate-900/70 p-3 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500">What to say</p>
          <p className="mt-0.5 italic">"{stop.suggested_script}"</p>
        </div>
      )}

      {!hasMissionBrief && stop.success_criteria && (
        <div className="mt-3 rounded-xl bg-slate-900/70 p-3 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-wide text-slate-500">Success looks like</p>
          <p className="mt-0.5">{stop.success_criteria}</p>
        </div>
      )}

      {/* --- ADDED: Mission Brief, replaces the boxes above when present --- */}
      {stop.mission_brief && (
        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-200">Mission Brief</p>

          <p className="mt-2 text-sm text-slate-200">{stop.mission_brief.mission_objective}</p>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Why this matters</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {stop.mission_brief.why_it_matters.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Ask for</p>
            <p className="mt-1 text-sm text-slate-300">
              {stop.mission_brief.ask_for_roles.join(" · ")}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Discovery questions
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {stop.mission_brief.discovery_questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Watch for buying signals
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {stop.mission_brief.buying_signals.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">If they object</p>
            <div className="mt-2 space-y-2">
              {stop.mission_brief.likely_objections.map((o) => (
                <div key={o.objection} className="rounded-xl bg-slate-900/70 p-3">
                  <p className="text-sm font-medium text-slate-200">"{o.objection}"</p>
                  <p className="mt-1 text-sm text-slate-400">{o.response}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Leave behind</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {stop.mission_brief.leave_behind.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Success checklist</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {stop.mission_brief.success_checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {/* --- END ADDED --- */}

      <p className="mt-3 text-sm text-slate-300">{stop.ai_summary ?? "No AI summary yet."}</p>

      <p className="mt-3 rounded-xl bg-slate-900/70 p-3 text-sm text-slate-200">
        Next action:{" "}
        {stop.ai_next_action ?? "Ask for the Administrator, Executive Director, or Admissions Director."}
      </p>

      {!hasMissionBrief && stop.fallback_action && (
        <p className="mt-3 rounded-xl border border-white/10 p-3 text-xs text-slate-400">
          If unavailable: {stop.fallback_action}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <Link
          href={`/internal/crm/facilities/${stop.id}`}
          className="rounded-xl bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-400"
        >
          Open Profile
        </Link>

        <Link
          href={`/internal/crm/facilities/${stop.id}?logVisit=1`}
          className="rounded-xl border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          Log Visit
        </Link>

        <a
          href={navigateUrl(stop)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          Navigate
        </a>

        {contactPhone && (
          <a
            href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Call
          </a>
        )}

        {stop.website && (
          <a
            href={stop.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Website
          </a>
        )}
      </div>
    </article>
  );
}