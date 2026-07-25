import { createServerSupabase } from "@/lib/supabase/server";
import { scoreReferralFit } from "./service-fit";

const TAXONOMIES = [
  "Assisted Living Facility",
  "Residential Treatment Facility",
  "Community/Behavioral Health",
  "Clinic/Center Mental Health",
  "Clinic/Center Adult Mental Health",
  "Psychiatric Residential Treatment Facility",
];

export async function importNpiLocalProviders(zip = "78253", radius = 25) {
  const supabase = createServerSupabase();

  let imported = 0;

  for (const taxonomy_description of TAXONOMIES) {
    const url = new URL("https://npiregistry.cms.hhs.gov/api/");
    url.searchParams.set("version", "2.1");
    url.searchParams.set("enumeration_type", "NPI-2");
    url.searchParams.set("postal_code", zip);
    url.searchParams.set("taxonomy_description", taxonomy_description);
    url.searchParams.set("limit", "200");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) continue;

    const json = await res.json();

    for (const item of json.results ?? []) {
      const address =
        item.addresses?.find((a: any) => a.address_purpose === "LOCATION") ??
        item.addresses?.[0];

      if (!address) continue;

      const name =
        item.basic?.organization_name ??
        item.basic?.name ??
        `NPI ${item.number}`;

      const fit = scoreReferralFit({
        name,
        taxonomy: taxonomy_description,
        facilityType: taxonomy_description,
      });

      await supabase.from("facilities").upsert(
        {
          name,
          facility_type: taxonomy_description,
          address: address.address_1,
          city: address.city,
          state: address.state,
          zip: address.postal_code?.slice(0, 5),
          phone: address.telephone_number,
          source_name: "nppes_npi",
          source_id: String(item.number),
          npi_number: String(item.number),
          taxonomy_description,
          market_source: "nppes_npi",
          referral_potential: fit.referral_fit_score,
          referral_fit_score: fit.referral_fit_score,
          service_fit_reason: fit.service_fit_reason,
          exclude_from_routes: fit.exclude_from_routes,
          relationship_stage: "new",
          priority_score: fit.referral_fit_score,
        },
        { onConflict: "source_name,source_id" }
      );

      imported++;
    }
  }

  return { imported };
}