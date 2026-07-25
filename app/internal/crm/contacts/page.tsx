import Link from "next/link";
import GrowthOSShell from "@/components/growth-os/shell/GrowthOSShell";
import { getContacts } from "@/features/contacts/repository";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <GrowthOSShell>
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-300">Contacts</p>
        <h1 className="mt-2 text-3xl font-bold">Referral Relationship Contacts</h1>
        <p className="mt-2 text-slate-400">
          Verified and source-backed facility contacts. Machine-found records require verification.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        {contacts.length === 0 ? (
          <div className="p-8 text-sm text-slate-400">
            No usable contacts yet. Enrichment will only show named contacts or verified emails.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Facility</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>

              <tbody>
                {contacts.map((contact: any) => (
                  <tr key={contact.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-4 font-medium text-white">
                      {contact.full_name ?? contact.email ?? "Unnamed contact"}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatTitle(contact.title)}
                    </td>

                    <td className="px-4 py-4">
                      {contact.facilities?.id ? (
                        <Link
                          href={`/internal/crm/facilities/${contact.facilities.id}`}
                          className="text-blue-300 hover:text-blue-200"
                        >
                          {contact.facilities.name}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {contact.email ?? "—"}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {contact.confidence_score ?? 0}%
                    </td>

                    <td className="px-4 py-4">
                      {contact.needs_verification ? (
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                          Needs verification
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                          Verified
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {contact.source_url ? (
                        <a
                          href={contact.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-300 hover:text-blue-200"
                        >
                          Source
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
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

function formatTitle(title?: string | null) {
  if (!title) return "—";
  if (title.toLowerCase() === "don") return "Director of Nursing";
  if (title.toLowerCase() === "general contact") return "Facility Email";

  return title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}