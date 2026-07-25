import GrowthOSShell from "@/components/growth-os/shell/GrowthOSShell";
import LogVisitForm from "@/components/growth-os/visits/LogVisitForm";
import { getFacilityProfile } from "@/features/facilities/profile.repository";
import { buildMissingIntelligenceChecklist } from "@/features/facilities/missing-intelligence";
import { buildTodaysMission, buildLastConversation } from "@/features/facilities/facility-mission";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FacilityProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const {
    facility,
    contacts,
    visits,
    referrals,
    intelligence,
  }: any = await getFacilityProfile(id);

  const bestContact = contacts.length > 0
    ? {
        name: contacts[0].full_name ?? null,
        title: contacts[0].title ?? null,
        phone: contacts[0].phone ?? null,
        email: contacts[0].email ?? null,
        needs_verification: contacts[0].needs_verification ?? true,
      }
    : null;

  const checklist = buildMissingIntelligenceChecklist(facility, bestContact, intelligence);

  const mission = buildTodaysMission(
    facility,
    bestContact,
    intelligence,
    facility.last_visit_at
  );

  const mostRecentVisit = visits.length > 0 ? visits[0] : null;
  const lastConversation = buildLastConversation(mostRecentVisit);

  const relationshipStageLabel = facility.relationship_stage
    ? facility.relationship_stage.charAt(0).toUpperCase() + facility.relationship_stage.slice(1)
    : "New";

  return (
    <GrowthOSShell>
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-400">
          Facility Profile
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          {facility.name}
        </h1>

        <p className="mt-3 text-slate-400">
          {facility.facility_type ?? "Facility"} •{" "}
          {facility.address},{" "}
          {facility.city},{" "}
          {facility.state}{" "}
          {facility.zip}
        </p>
      </div>

      <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <p className="text-sm font-semibold text-emerald-300">Today's Goal</p>
        <p className="mt-2 text-lg text-slate-100">{mission.goal}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {mission.status.map((s) => (
            <span
              key={s}
              className="rounded-full bg-slate-900/60 px-3 py-1 text-xs text-slate-300"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.6fr_1fr]">
        {/* LEFT SIDE */}

        <div className="space-y-8">
          <Panel title="Last Conversation">
            <p className="text-sm leading-7 text-slate-300">{lastConversation}</p>
          </Panel>

          <Panel title="Visit History">
            {visits.length === 0 ? (
              <Empty text="No visits have been logged yet." />
            ) : (
              <div className="space-y-4">
                {visits.map((visit: any) => (
                  <Card key={visit.id}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {new Date(
                          visit.visit_date
                        ).toLocaleDateString()}
                      </h3>

                      <span className="text-xs text-slate-400">
                        {visit.visit_type}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-300">
                      {visit.notes ?? "No notes"}
                    </p>

                    <div className="mt-4 rounded-lg bg-slate-800 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Next Action
                      </p>

                      <p className="mt-1 text-sm text-blue-300">
                        {visit.next_action ??
                          "None recorded"}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Referral History">
            {referrals.length === 0 ? (
              <Empty text="No referrals recorded." />
            ) : (
              <div className="space-y-4">
                {referrals.map((referral: any) => (
                  <Card key={referral.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {referral.status}
                      </p>

                      <span className="text-xs text-slate-400">
                        {new Date(
                          referral.referral_date
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-300">
                      {referral.notes ??
                        "No referral notes."}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* RIGHT SIDE */}

        <aside className="space-y-8">
          <Panel title="Relationship Status">
            <Info
              label="Visited"
              value={facility.last_visit_at ? new Date(facility.last_visit_at).toLocaleDateString() : "Never"}
            />
            <Info label="Decision Maker" value={bestContact?.name ?? facility.administrator ?? "Unknown"} />
            <Info label="Current Provider" value={intelligence?.current_psych_provider ?? "Unknown"} />
            <Info label="Relationship" value={relationshipStageLabel} />
            <Info
              label="Next Follow-up"
              value={facility.next_follow_up_at ? new Date(facility.next_follow_up_at).toLocaleDateString() : "None scheduled"}
            />
          </Panel>

          <Panel title="Facility Details">
            <Info label="Phone" value={facility.phone} />
            <Info
              label="License"
              value={facility.license_number}
            />
            <Info
              label="County"
              value={facility.county}
            />
            <Info
              label="Website"
              value={facility.website}
            />
            <Info
              label="Source"
              value={facility.source_name}
            />
          </Panel>

          <Panel title="Missing Intelligence">
            <p className="mb-4 text-sm text-slate-400">
              {checklist.knownCount} of {checklist.totalCount} known
              {checklist.verifiedCount > 0 && ` (${checklist.verifiedCount} verified)`}
            </p>

            <div className="space-y-2">
              {checklist.items.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                    item.status === "missing"
                      ? "border-dashed border-white/10 bg-slate-900/40 text-slate-500"
                      : item.status === "verified"
                      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200"
                      : "border-white/10 bg-slate-900/60 text-slate-200"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs uppercase tracking-wide">
                    {item.status === "missing"
                      ? "Missing"
                      : item.status === "verified"
                      ? "Verified"
                      : "Known"}
                  </span>
                </div>
              ))}
            </div>

            {checklist.objectives.length > 0 && (
              <div className="mt-5 rounded-xl bg-blue-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                  Before you leave, learn:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
                  {checklist.objectives.map((obj) => (
                    <li key={obj}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          <Panel title="Relationship Contacts">
            {contacts.length === 0 ? (
              <Empty text="No verified contacts yet." />
            ) : (
              <div className="space-y-4">
                {contacts.map((contact: any) => (
                  <Card key={contact.id}>
                    <h3 className="font-semibold">
                      {contact.full_name ??
                        "Unknown Contact"}
                    </h3>

                    <p className="text-sm text-slate-400">
                      {contact.title ?? "—"}
                    </p>

                    <p className="mt-3 text-sm">
                      {contact.phone ?? ""}
                    </p>

                    <p className="text-sm">
                      {contact.email ?? ""}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Log New Visit">
            <LogVisitForm
              facilityId={facility.id}
            />
          </Panel>
        </aside>
      </section>
    </GrowthOSShell>
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
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <div className="mt-5">
        {children}
      </div>
    </div>
  );
}

function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      {children}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="mb-3 flex justify-between border-b border-white/10 pb-3 text-sm">
      <span className="text-slate-400">
        {label}
      </span>

      <span className="max-w-[55%] text-right text-slate-200">
        {value || "—"}
      </span>
    </div>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/50 p-5 text-sm text-slate-400">
      {text}
    </div>
  );
}