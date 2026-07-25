import Sidebar from "./Sidebar";
import StatCard from "./StatCard";

type Facility = {
  id: string;
  name: string;
  facility_type: string | null;
  city: string | null;
  priority_score: number | null;
  relationship_stage: string | null;
  next_follow_up_at: string | null;
  ai_summary: string | null;
  ai_next_action: string | null;
};

async function getDailyIntelligence() {
  const res = await fetch("http://localhost:3000/api/internal/crm/daily-intelligence", {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function CRMDashboard() {
  const intelligence = await getDailyIntelligence();

  const stats = intelligence?.stats ?? {
    priorityFacilities: 0,
    followUpsDue: 0,
    suggestedVisits: 0,
    referralSignals: 0,
  };

  const facilities: Facility[] = intelligence?.facilities ?? [];

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur md:px-8">
          <p className="text-sm font-medium text-blue-300">BlueOaks Growth OS</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Today’s Growth Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            AI-ranked referral opportunities, follow-ups, and visit priorities for today.
          </p>
        </div>

        <div className="p-5 md:p-8">
          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="Priority Facilities" value={stats.priorityFacilities} />
            <StatCard label="Follow-ups Due" value={stats.followUpsDue} />
            <StatCard label="Suggested Visits" value={stats.suggestedVisits} />
            <StatCard label="Referral Signals" value={stats.referralSignals} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Priority Facilities Today</h2>

              <div className="mt-6 space-y-4">
                {facilities.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/70 p-8 text-center">
                    <h3 className="text-lg font-semibold">No intelligence generated yet</h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
                      Once facilities are imported and scored, today’s best outreach opportunities will appear here.
                    </p>
                  </div>
                ) : (
                  facilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{facility.name}</h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {facility.facility_type ?? "Facility"} · {facility.city ?? "Texas"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-blue-500/15 px-4 py-2 text-center">
                          <p className="text-xl font-bold text-blue-300">
                            {facility.priority_score ?? 0}
                          </p>
                          <p className="text-xs text-slate-400">Score</p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-slate-300">
                        {facility.ai_summary ?? "No summary yet."}
                      </p>

                      <p className="mt-3 text-sm text-blue-300">
                        Next action: {facility.ai_next_action ?? "Review facility profile."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Suggested Route</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {intelligence?.routeSuggestion ?? "Waiting for facility intelligence."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">System Status</h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between rounded-xl bg-slate-900/70 p-3">
                    <span className="text-slate-400">Supabase</span>
                    <span className="text-emerald-300">Connected</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-900/70 p-3">
                    <span className="text-slate-400">OpenAI</span>
                    <span className="text-emerald-300">Connected</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-900/70 p-3">
                    <span className="text-slate-400">Daily Intelligence</span>
                    <span className="text-emerald-300">Live</span>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}