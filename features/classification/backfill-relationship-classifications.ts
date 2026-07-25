import { createServerSupabase } from "@/lib/supabase/server";
import { classifyRelationship } from "./relationship-classifier";
import { verifyWithNpiRegistry } from "./npi-verifier";
import { verifyViaWebsite } from "./website-relationship-verifier";
import { resolveRelationshipWithAI } from "./ai-relationship-resolver";

const BATCH_SIZE = 500;

/**
 * Full pipeline, in order:
 *   1. Rule classifier (free, instant, handles the clear-cut majority)
 *   2. NPI Registry verification (free, real evidence — often fails for
 *      small practices registered under a different legal name)
 *   3. Website content scan (free, real evidence from the practice's own
 *      public claims — catches most of what NPI misses)
 *   4. AI resolution (costs money, genuinely last resort — only reached if
 *      nothing above produced a confident answer)
 */
export async function backfillRelationshipClassifications() {
  const supabase = createServerSupabase();

  let ruleProcessed = 0;
  let offset = 0;

  const needsFurtherReview: Array<{
    id: string;
    name: string;
    facility_type: string | null;
    city: string | null;
    state: string | null;
    website: string | null;
  }> = [];

  // --- PASS 1: rule-based classification over EVERY row ---
  while (true) {
    const { data, error } = await supabase
      .from("facilities")
      .select("id, name, facility_type, taxonomy_description, city, state, website")
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) throw new Error(`Pass 1 fetch failed at offset ${offset}: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const facility of data) {
      const result = classifyRelationship({
        name: facility.name,
        facilityType: facility.facility_type,
        taxonomy: facility.taxonomy_description,
      });

      const { error: updateError } = await supabase
        .from("facilities")
        .update({
          relationship_classification: result.relationship_classification,
          competition_level: result.competition_level,
          relationship_classification_reason: result.relationship_classification_reason,
          classification_confidence: result.classification_confidence,
          classification_method: result.classification_method,
        })
        .eq("id", facility.id);

      if (updateError) {
        console.error(`[classify] Pass 1 update failed for ${facility.id} (${facility.name}):`, updateError.message);
        continue;
      }

      ruleProcessed++;

      if (result.needs_ai_review) {
        needsFurtherReview.push({
          id: facility.id,
          name: facility.name,
          facility_type: facility.facility_type,
          city: facility.city,
          state: facility.state,
          website: facility.website,
        });
      }
    }

    offset += data.length;
  }

  // --- PASS 2: NPI Registry verification ---
  let npiVerified = 0;
  const needsWebsiteCheck: typeof needsFurtherReview = [];

  for (const facility of needsFurtherReview) {
    const npiResult = await verifyWithNpiRegistry({
      name: facility.name,
      city: facility.city,
      state: facility.state,
    });

    if (npiResult.matched && !npiResult.needs_human_review) {
      const { error: updateError } = await supabase
        .from("facilities")
        .update({
          relationship_classification: npiResult.relationship_classification,
          competition_level: npiResult.competition_level,
          relationship_classification_reason: npiResult.relationship_classification_reason,
          classification_confidence: npiResult.classification_confidence,
          classification_method: npiResult.classification_method,
          npi_verification_number: npiResult.npi_number,
          npi_verification_taxonomy: npiResult.taxonomy_description,
          npi_verification_matched_name: npiResult.matched_name,
          npi_verification_name_match_score: npiResult.name_match_score,
          npi_verified_at: new Date().toISOString(),
          human_verified: true,
          human_verified_by: "npi_registry_auto",
          human_verified_at: new Date().toISOString(),
        })
        .eq("id", facility.id);

      if (!updateError) {
        npiVerified++;
        continue;
      }
      console.error(`[classify] NPI update failed for ${facility.id} (${facility.name}):`, updateError.message);
    }

    // Store whatever partial NPI evidence exists even if not confident enough to act on
    if (npiResult.matched) {
      await supabase
        .from("facilities")
        .update({
          npi_verification_number: npiResult.npi_number,
          npi_verification_taxonomy: npiResult.taxonomy_description,
          npi_verification_matched_name: npiResult.matched_name,
          npi_verification_name_match_score: npiResult.name_match_score,
          npi_verified_at: new Date().toISOString(),
        })
        .eq("id", facility.id);
    }

    needsWebsiteCheck.push(facility);
  }

  // --- PASS 3: Website content scan ---
  let websiteVerified = 0;
  const stillNeedsAi: typeof needsFurtherReview = [];

  for (const facility of needsWebsiteCheck) {
    const webResult = await verifyViaWebsite(facility.website);

    if (webResult.matched && webResult.relationship_classification !== "unknown") {
      const { error: updateError } = await supabase
        .from("facilities")
        .update({
          relationship_classification: webResult.relationship_classification,
          competition_level: webResult.competition_level,
          relationship_classification_reason: webResult.relationship_classification_reason,
          classification_confidence: webResult.classification_confidence,
          classification_method: webResult.classification_method,
          website_verification_signal: webResult.matched_signals.join(", ") || null,
          website_verification_providers: webResult.extracted_providers,
          website_verified_at: new Date().toISOString(),
          human_verified: !webResult.needs_human_review,
          human_verified_by: !webResult.needs_human_review ? "website_scan_auto" : null,
          human_verified_at: !webResult.needs_human_review ? new Date().toISOString() : null,
        })
        .eq("id", facility.id);

      if (!updateError) {
        websiteVerified++;
        continue;
      }
      console.error(`[classify] Website scan update failed for ${facility.id} (${facility.name}):`, updateError.message);
    }

    stillNeedsAi.push(facility);
  }

  // --- PASS 4: AI as genuine last resort ---
  let aiProcessed = 0;
  let aiFailed = 0;

  for (const facility of stillNeedsAi) {
    const aiResult = await resolveRelationshipWithAI({
      name: facility.name,
      facilityType: facility.facility_type,
      website: facility.website,
    });

    const { error: updateError } = await supabase
      .from("facilities")
      .update({
        relationship_classification: aiResult.relationship_classification,
        competition_level: aiResult.competition_level,
        relationship_classification_reason: aiResult.relationship_classification_reason,
        classification_confidence: aiResult.classification_confidence,
        classification_method: aiResult.classification_method,
        // human_verified stays false — pure AI guesses always need a human look
      })
      .eq("id", facility.id);

    if (updateError) {
      console.error(`[classify] AI update failed for ${facility.id} (${facility.name}):`, updateError.message);
      aiFailed++;
      continue;
    }

    aiProcessed++;
  }

  return {
    ruleProcessed,
    ambiguousCount: needsFurtherReview.length,
    npiVerified,
    websiteVerified,
    aiProcessed,
    aiFailed,
  };
}