import { createServerSupabase } from "@/lib/supabase/server";

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\b(llc|inc|ltd|corp|corporation|community|assisted living|memory care)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export async function createEntitiesFromFacilities(limit = 500) {
  const supabase = createServerSupabase();

  const { data: facilities, error } = await supabase
    .from("facilities")
    .select("id,name,city,county,state")
    .limit(limit);

  if (error) throw new Error(error.message);

  const groups = new Map<string, any[]>();

  for (const facility of facilities ?? []) {
    const key = `${normalizeName(facility.name)}|${facility.city ?? ""}|${facility.county ?? ""}`;
    groups.set(key, [...(groups.get(key) ?? []), facility]);
  }

  let entitiesCreated = 0;
  let linksCreated = 0;

  for (const group of groups.values()) {
    const canonical = group[0];

    const { data: entity, error: entityError } = await supabase
      .from("crm_entities")
      .insert({
        display_name: canonical.name,
        city: canonical.city,
        county: canonical.county,
        state: canonical.state ?? "TX",
        canonical_facility_id: canonical.id,
      })
      .select()
      .single();

    if (entityError) continue;

    entitiesCreated++;

    const links = group.map((facility) => ({
      entity_id: entity.id,
      facility_id: facility.id,
      relationship: "licensed_location",
    }));

    const { error: linkError } = await supabase
      .from("crm_entity_facilities")
      .upsert(links, { onConflict: "entity_id,facility_id" });

    if (!linkError) linksCreated += links.length;
  }

  return { entitiesCreated, linksCreated };
}