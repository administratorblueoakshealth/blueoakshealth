import { createServerSupabase } from "@/lib/supabase/server";
import { fetchTexasHhscFacilities } from "./texas-hhsc";

export async function importTexasFacilities() {
  const supabase = createServerSupabase();

  const { data: job, error: jobError } = await supabase
    .from("import_jobs")
    .insert({
      source_name: "texas_hhsc_alf",
      market: "Texas",
      status: "started",
    })
    .select()
    .single();

  if (jobError) throw new Error(jobError.message);

  try {
    const facilities = await fetchTexasHhscFacilities();

    const rows = facilities.map((facility) => ({
      name: facility.name,
      facility_type: facility.facility_type,
      address: facility.address,
      city: facility.city,
      state: facility.state,
      zip: facility.zip,
      county: facility.county,
      phone: facility.phone,
      license_number: facility.license_number,
      source_name: facility.source_name,
      source_id: facility.source_id,
      relationship_stage: "new",
      referral_potential: 50,
      priority_score: 0,
    }));

    const { error: upsertError } = await supabase
      .from("facilities")
      .upsert(rows, {
        onConflict: "source_name,source_id",
      });

    if (upsertError) throw new Error(upsertError.message);

    await supabase
      .from("import_jobs")
      .update({
        status: "completed",
        records_found: facilities.length,
        records_imported: facilities.length,
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return {
      job_id: job.id,
      records_found: facilities.length,
      records_imported: facilities.length,
    };
  } catch (error) {
    await supabase
      .from("import_jobs")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown import error",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    throw error;
  }
}