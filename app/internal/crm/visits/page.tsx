import Link from "next/link";
import GrowthOSShell from "@/components/growth-os/shell/GrowthOSShell";
import { getVisits } from "@/features/visits/repository";

export default async function VisitsPage() {
  const visits = await getVisits();

  return (
    <GrowthOSShell>
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-300">Visits</p>
        <h1 className="mt-2 text-3xl font-bold">Facility Visit History</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Track field visits, outcomes, next steps, and follow-up needs.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        {visits.length === 0 ? (
          <div className="p-8 text-sm text-slate-400">No visits logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Facility</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Next Action</th>
                  <th className="px-4 py-3">Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit: any) => (
                  <tr key={visit.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-4 text-slate-300">
                      {new Date(visit.visit_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      {visit.facilities?.id ? (
                        <Link
                          href={`/internal/crm/facilities/${visit.facilities.id}`}
                          className="text-blue-300 hover:text-blue-200"
                        >
                          {visit.facilities.name}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-300">{visit.purpose ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-300">{visit.outcome ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-300">{visit.next_action ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-300">
                      {visit.next_follow_up_at
                        ? new Date(visit.next_follow_up_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </GrowthOSShell>
  );
}
