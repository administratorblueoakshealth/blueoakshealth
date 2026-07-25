import { createServerSupabase } from "@/lib/supabase/server";

export async function getVisits(limit = 100) {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("facility_visits")
    .select("*, facilities(id,name,city,county)")
    .order("visit_date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}