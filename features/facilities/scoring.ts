import { getUnscoredFacilities, updateFacilityAI } from "./repository";
import { scoreFacilityWithAI } from "@/features/ai/facility-scorer";

const BATCH_SIZE = 25;

export async function scoreAllUnscoredFacilities() {
  const results: Array<{ facility_id: string; facility_name: string; score: unknown }> = [];
  let failed = 0;

  while (true) {
    const facilities = await getUnscoredFacilities(BATCH_SIZE);
    if (facilities.length === 0) break;

    for (const facility of facilities) {
      try {
        const score = await scoreFacilityWithAI(facility);

        await updateFacilityAI(facility.id, {
          priority_score: score.score,
          ai_summary: score.summary,
          ai_next_action: score.next_action,
        });

        results.push({
          facility_id: facility.id,
          facility_name: facility.name,
          score,
        });
      } catch (err) {
        console.error(`[scoring] failed for facility ${facility.id} (${facility.name})`, err);
        failed++;
      }
    }
  }

  return { scored: results.length, failed, results };
}

export async function scoreTopFacilities(limit = 10) {
  const { getTopFacilities } = await import("./repository");
  const facilities = await getTopFacilities(limit);

  const results = [];

  for (const facility of facilities) {
    const score = await scoreFacilityWithAI(facility);

    await updateFacilityAI(facility.id, {
      priority_score: score.score,
      ai_summary: score.summary,
      ai_next_action: score.next_action,
    });

    results.push({
      facility_id: facility.id,
      facility_name: facility.name,
      score,
    });
  }

  return results;
}