import GrowthOSShell from "../shell/GrowthOSShell";
import { getDailyIntelligence } from "@/features/intelligence/daily-intelligence.service";

export default async function GrowthOSDashboard() {
  const intelligence = await getDailyIntelligence();

  const stats = intelligence.stats;
  const facilities = intelligence.facilities;

  return (
    <GrowthOSShell>
      <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm font-medium text-blue-300">Today’s Mission</p>
        <h1 className="mt-2 text-3xl font-bold md:text-5xl">
          Good morning. Here’s where growth needs attention today.
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          AI-ranked outreach priorities, follow-ups, referral signals, and route opportunities.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Priority Facilities" value={stats.priorityFacilities} />
        <Metric label="Follow-ups Due" value={stats.followUpsDue} />
        <Metric label="Suggested Visits" value={stats.suggestedVisits} />
        <Metric label="Referral Signals" value={stats.referralSignals} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">High-Priority Outreach</h2>
          <p className="mt-1 text-sm text-slate-400">
            Facilities ranked by relationship status, follow-up urgency, and AI score.
          </p>

          <div className="mt-6 space-y-4">
            {facilities.length === 0 ? (
              <EmptyState />
            ) : (
              facilities.map((facility: any) => (
                <article
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

                    <div className="rounded-2xl bg-blue-500/15 px-4 py-3 text-center">
                      <p className="text-2xl font-bold text-blue-300">
                        {facility.priority_score ?? 0}
                      </p>
                      <p className="text-xs text-slate-400">AI Score</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-300">
                    {facility.ai_summary ?? "No AI summary yet."}
                  </p>

                  <p className="mt-4 rounded-xl bg-blue-500/10 p-3 text-sm text-blue-200">
                    Next action: {facility.ai_next_action ?? "Review this facility."}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <Panel title="Suggested Route">
            <p className="text-sm text-slate-400">
              {intelligence.routeSuggestion}
            </p>
          </Panel>

          <Panel title="System Health">
            <Status label="Supabase" value="Connected" />
            <Status label="OpenAI" value="Connected" />
            <Status label="Daily Intelligence" value="Live" />
          </Panel>

          <Panel title="Next Product Module">
            <p className="text-sm text-slate-400">
              Build the Facilities table view next: searchable, sortable, filterable, and ready for thousands of Texas records.
            </p>
          </Panel>
        </aside>
      </section>
    </GrowthOSShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/70 p-8 text-center">
      <h3 className="text-lg font-semibold">No live facility intelligence yet</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
        BlueOaks Growth OS is connected to Supabase and OpenAI. The next backend job will import licensed Texas facilities, enrich them, and generate today’s outreach priorities.
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex justify-between rounded-xl bg-slate-900/70 p-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-emerald-300">{value}</span>
    </div>
  );
}