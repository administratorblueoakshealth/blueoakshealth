import { createServerSupabase } from "@/lib/supabase/server";
import { discoverWebsite } from "./website-discovery";
import { extractWebsiteData } from "./website-extractor";
import { scoreWebsiteConfidence, contactConfidence } from "./confidence";

export async function enrichFacilitiesBatch(limit = 10) {
  const supabase = createServerSupabase();

  const { data: job, error: jobError } = await supabase
    .from("facility_enrichment_jobs")
    .insert({
      status: "started",
      market: "Bexar",
    })
    .select()
    .single();

  if (jobError) throw new Error(jobError.message);

  let attempted = 0;
  let enriched = 0;
  let failed = 0;

  const failures: Array<{
    facilityId: string;
    facilityName: string;
    error: string;
  }> = [];

  try {
    const { data: facilities, error } = await supabase
      .from("facilities")
      .select("id,name,address,city,state,county,website,phone,provider_email")
      .eq("county", "BEXAR")
      .or(
        "enrichment_status.is.null,enrichment_status.eq.not_started,enrichment_status.eq.needs_website,enrichment_status.eq.failed,enrichment_status.eq.enriched"
      )
      .limit(limit);

    if (error) throw new Error(error.message);

    for (const facility of facilities ?? []) {
      attempted++;

      try {
        let websiteUrl = facility.website as string | null;

        if (!websiteUrl) {
          const discovered = await discoverWebsite(facility);
          websiteUrl = discovered.websiteUrl;

          await supabase.from("facility_enrichment_sources").insert({
            facility_id: facility.id,
            source_type: "website_discovery",
            source_url: discovered.websiteUrl,
            source_title: discovered.title,
            raw_text: discovered.snippet ?? discovered.searchQuery,
            confidence_score: discovered.websiteUrl ? 70 : 20,
          });
        }

        if (!websiteUrl) {
          await supabase
            .from("facilities")
            .update({
              enrichment_status: "needs_website",
              last_enriched_at: new Date().toISOString(),
            })
            .eq("id", facility.id);

          continue;
        }

        const extracted = await extractWebsiteData(websiteUrl);

        const confidence = scoreWebsiteConfidence({
          facilityName: facility.name,
          city: facility.city,
          url: websiteUrl,
          text: extracted.text,
        });

        await supabase.from("facility_enrichment_sources").insert({
          facility_id: facility.id,
          source_type: "facility_website",
          source_url: websiteUrl,
          source_title: extracted.title,
          raw_text: extracted.text.slice(0, 15000),
          confidence_score: confidence,
        });

        const titleContacts = extracted.possibleContacts
          .filter((contact) => contact.full_name)
          .map((contact) => ({
            facility_id: facility.id,
            full_name: contact.full_name,
            title: contact.title,
            source: "facility_website",
            source_url: websiteUrl,
            confidence: confidence >= 80 ? "high" : "medium",
            confidence_score: contactConfidence("facility_website"),
            needs_verification: true,
            last_seen_at: new Date().toISOString(),
          }));

        const emailContacts = extracted.emails.map((email) => ({
          facility_id: facility.id,
          full_name: null,
          title: "Facility Email",
          email,
          source: "facility_website",
          source_url: websiteUrl,
          confidence: confidence >= 80 ? "high" : "medium",
          confidence_score: 80,
          needs_verification: true,
          last_seen_at: new Date().toISOString(),
        }));

        const contacts = [...titleContacts, ...emailContacts];

        if (contacts.length > 0) {
          const { error: contactsError } = await supabase
            .from("facility_contacts")
            .insert(contacts);

          if (contactsError) throw new Error(contactsError.message);
        }

        const { error: facilityUpdateError } = await supabase
          .from("facilities")
          .update({
            website: websiteUrl,
            website_confidence_score: confidence,
            enrichment_status: "enriched",
            last_enriched_at: new Date().toISOString(),
          })
          .eq("id", facility.id);

        if (facilityUpdateError) throw new Error(facilityUpdateError.message);

        enriched++;
      } catch (error) {
        failed++;

        const message =
          error instanceof Error ? error.message : "Unknown facility enrichment error";

        failures.push({
          facilityId: facility.id,
          facilityName: facility.name,
          error: message,
        });

        await supabase
          .from("facilities")
          .update({
            enrichment_status: "failed",
            last_enriched_at: new Date().toISOString(),
          })
          .eq("id", facility.id);
      }
    }

    await supabase
      .from("facility_enrichment_jobs")
      .update({
        status: "completed",
        attempted,
        enriched,
        failed,
        error_message: failures.length ? JSON.stringify(failures.slice(0, 5)) : null,
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return {
      job_id: job.id,
      attempted,
      enriched,
      failed,
      failures,
    };
  } catch (error) {
    await supabase
      .from("facility_enrichment_jobs")
      .update({
        status: "failed",
        attempted,
        enriched,
        failed,
        error_message: error instanceof Error ? error.message : "Unknown error",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    throw error;
  }
}