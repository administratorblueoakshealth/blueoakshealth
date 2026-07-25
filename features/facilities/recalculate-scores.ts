import { getFacilities, updateFacilityOpportunityScores } from "./repository";
import { calculateOpportunityScore } from "./opportunity-score";

export async function recalculateFacilityScores(limit = 200) {
  const facilities = await getFacilities({
    county: "BEXAR",
    limit,
  });

  const results = [];

  for (const facility of facilities) {
    const scores = calculateOpportunityScore(facility);

    await updateFacilityOpportunityScores(facility.id, scores);

    results.push({
      facility_id: facility.id,
      facility_name: facility.name,
      opportunity_score: scores.opportunity_score,
    });
  }

  return results;
}