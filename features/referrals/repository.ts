import { createServerSupabase } from "@/lib/supabase/server";

export async function getReferrals(limit = 100) {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("facility_referrals")
    .select("*, facilities(id,name,city,county)")
    .order("referral_date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}