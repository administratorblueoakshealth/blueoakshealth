import { createServerSupabase } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/maps/geocoder";
import { classifyRelationship } from "@/features/classification/relationship-classifier";

// EXPANDED: added primary care, therapy/counseling, home health, hospice,
// and urgent care — these are legitimate referral sources (PCPs and urgent
// care see patients needing psych referral; therapists/counselors can't
// prescribe so they refer out; home health/hospice are adjacent-care
// partners). ABA/autism already correctly classified as referral_source by
// the classifier fix earlier this week — no separate search term needed
// since it already gets picked up under existing behavioral-health-adjacent
// terms, but adding it explicitly too so it's not missed.
//
// Deliberately NOT adding: dentists, pharmacies, chiropractors — these have
// no clinical pathway into psychiatric referral and would just waste drive
// time on low-value stops.
const SEARCH_TERMS = [
  "group home",
  "assisted living",
  "memory care",
  "senior care",
  "behavioral health",
  "residential care home",
  "adult care home",
  "primary care physician",
  "family medicine clinic",
  "therapist",
  "counseling center",
  "home health agency",
  "hospice",
  "urgent care",
  "aba therapy autism",
];

export async function importGooglePlacesNearby(startingAddress: string, radiusMeters = 16000) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is missing.");

  const supabase = createServerSupabase();
  const start = await geocodeAddress(startingAddress);

  let imported = 0;
  let skippedNoName = 0;
  let failedRequests = 0;

  for (const term of SEARCH_TERMS) {
    const url = "https://places.googleapis.com/v1/places:searchText";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // ADDED addressComponents so we can parse real city/zip instead of
        // hardcoding "SAN ANTONIO" with no zip at all.
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.types,places.addressComponents",
      },
      body: JSON.stringify({
        textQuery: `${term} near ${startingAddress}`,
        locationBias: {
          circle: {
            center: { latitude: start.lat, longitude: start.lng },
            radius: radiusMeters,
          },
        },
      }),
    });

    // FIXED: was a silent `continue` with no logging at all. A failed
    // request (bad API key, quota, network issue) would fail completely
    // invisibly — you'd just get fewer results with zero indication why.
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      console.error(`[google-places-import] request failed for "${term}": ${res.status} ${bodyText}`);
      failedRequests++;
      continue;
    }

    const json = await res.json();

    for (const place of json.places ?? []) {
      const name = place.displayName?.text;
      if (!name) {
        skippedNoName++;
        continue;
      }

      // FIXED: parse real city/zip from addressComponents instead of
      // hardcoding "SAN ANTONIO" with no zip. Falls back only if Google
      // genuinely didn't return a component.
      const components: Array<{ longText?: string; types?: string[] }> =
        place.addressComponents ?? [];
      const city =
        components.find((c) => c.types?.includes("locality"))?.longText ??
        components.find((c) => c.types?.includes("sublocality"))?.longText ??
        "SAN ANTONIO";
      const zip =
        components.find((c) => c.types?.includes("postal_code"))?.longText ?? null;
      const state =
        components.find((c) => c.types?.includes("administrative_area_level_1"))?.longText ??
        "TX";

      // FIXED: uses the real relationship-classifier pipeline (rule pass)
      // instead of the old scoreReferralFit/service-fit.ts, so new imports
      // get relationship_classification and referral_target set
      // immediately for clear-cut categories, matching what the rest of
      // the app (Daily Route filter, Missing Intelligence, etc.) actually
      // reads. Ambiguous ones still fall to the classify-relationships
      // backfill's NPI/website/AI passes afterward, same as always.
      const classification = classifyRelationship({
        name,
        facilityType: term,
        googleTypes: (place.types ?? []).join(" "),
      });

      // FIXED: no more hard-dropping low-fit places at import time.
      // Everything lands in the table; relationship_classification and
      // referral_target control what's visible by default, but the row
      // still exists for review/reclassification instead of vanishing.
      const { error } = await supabase.from("facilities").upsert(
        {
          name,
          facility_type: term,
          address: place.formattedAddress,
          city,
          state,
          zip,
          phone: place.nationalPhoneNumber,
          website: place.websiteUri,
          latitude: place.location?.latitude,
          longitude: place.location?.longitude,
          geocode_source: "google_places",
          google_place_id: place.id,
          source_name: "google_places",
          source_id: place.id,
          market_source: "google_places",
          relationship_classification: classification.relationship_classification,
          competition_level: classification.competition_level,
          relationship_classification_reason: classification.relationship_classification_reason,
          classification_confidence: classification.classification_confidence,
          classification_method: classification.classification_method,
          referral_target: classification.relationship_classification !== "vendor"
            && classification.relationship_classification !== "competitor"
            && classification.relationship_classification !== "non_target",
          relationship_stage: "new",
          priority_score: classification.classification_confidence,
          exclude_from_routes: false,
        },
        { onConflict: "source_name,source_id" }
      );

      if (error) {
        console.error(`[google-places-import] upsert failed for "${name}"`, error.message);
        continue;
      }

      imported++;
    }
  }

  return { imported, skippedNoName, failedRequests };
}