import { countFacilities, getTopFacilities } from "@/features/facilities/repository";

export async function getDailyIntelligence() {
  const facilities = await getTopFacilities(10);
  const totalFacilities = await countFacilities();

  const followUpsDue = facilities.filter((facility) => {
    if (!facility.next_follow_up_at) return false;
    return new Date(facility.next_follow_up_at) <= new Date();
  }).length;

  return {
    stats: {
      priorityFacilities: facilities.length,
      totalFacilities,
      followUpsDue,
      suggestedVisits: facilities.length > 0 ? Math.min(facilities.length, 6) : 0,
      referralSignals: facilities.filter((f) => (f.priority_score ?? 0) >= 80).length,
    },
    facilities,
    routeSuggestion:
      facilities.length > 0
        ? "Route planning is ready once facility addresses are geocoded."
        : "No route available until real facilities are imported.",
  };
}