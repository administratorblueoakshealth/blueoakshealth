import { createServerSupabase } from "@/lib/supabase/server";

export async function getContacts(limit = 100) {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("facility_contacts")
    .select("*, facilities(id,name,city,county)")
    .not("title", "eq", "General Phone")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}