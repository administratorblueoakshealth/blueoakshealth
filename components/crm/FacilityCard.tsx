import { Facility } from "@/types/facility";

export default function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{facility.name}</h3>
          <p className="text-sm text-gray-500">
            {facility.type} · {facility.address}, {facility.city}
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
          {facility.priority_score}
        </span>
      </div>

      <div className="mt-4 text-sm">
        <p>Status: {facility.status}</p>
        <p>Next follow-up: {facility.next_follow_up_date}</p>
      </div>

      {facility.notes && (
        <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
          {facility.notes}
        </p>
      )}
    </div>
  );
}