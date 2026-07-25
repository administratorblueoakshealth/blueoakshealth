import Link from "next/link";
import GrowthOSShell from "@/components/growth-os/shell/GrowthOSShell";
import { getFacilities } from "@/features/facilities/repository";

type Props = {
  searchParams?: Promise<{
    q?: string;
    city?: string;
    county?: string;
    zip?: string;
    facilityType?: string;
  }>;
};

export default async function FacilitiesPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};

  const facilities = await getFacilities({
    q: params.q,
    city: params.city,
    county: params.county,
    zip: params.zip,
    facilityType: params.facilityType,
    limit: 100,
  });

  return (
    <GrowthOSShell>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-300">Facilities</p>
          <h1 className="mt-2 text-3xl font-bold">Facility Intelligence Database</h1>
          <p className="mt-2 text-slate-400">
            Search, filter, and prioritize licensed Texas facilities from official HHSC data.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <p className="text-sm text-slate-400">Showing</p>
          <p className="text-lg font-semibold">{facilities.length} facilities</p>
        </div>
      </div>

      <form className="mb-5 grid gap-3 md:grid-cols-6">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search facility name..."
          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none md:col-span-2"
        />

        <input
          name="city"
          defaultValue={params.city ?? ""}
          placeholder="City, e.g. San Antonio"
          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
        />

        <input
          name="county"
          defaultValue={params.county ?? ""}
          placeholder="County, e.g. Bexar"
          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
        />

        <input
          name="zip"
          defaultValue={params.zip ?? ""}
          placeholder="ZIP"
          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
        />

        <select
          name="facilityType"
          defaultValue={params.facilityType ?? "all"}
          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
        >
          <option value="all">All types</option>
          <option value="Assisted Living">Assisted Living</option>
          <option value="Memory Care">Memory Care</option>
        </select>

        <button className="rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold hover:bg-blue-400 md:col-span-1">
          Search
        </button>

        <Link
          href="/internal/crm/facilities"
          className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold hover:bg-white/10 md:col-span-1"
        >
          Reset
        </Link>
      </form>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">County</th>
                <th className="px-4 py-3">ZIP</th>
                <th className="px-4 py-3">Beds</th>
                <th className="px-4 py-3">AI Score</th>
              </tr>
            </thead>

            <tbody>
              {facilities.map((facility) => (
                <tr key={facility.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-4">
                    <Link
                      href={`/internal/crm/facilities/${facility.id}`}
                      className="font-medium text-white hover:text-blue-300"
                    >
                      {facility.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {facility.address ?? "No address on file"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{facility.facility_type ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-300">{facility.city ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-300">{facility.county ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-300">{facility.zip ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-300">{facility.bed_count ?? "—"}</td>
                  <td className="px-4 py-4 text-blue-300">{facility.priority_score ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GrowthOSShell>
  );
}