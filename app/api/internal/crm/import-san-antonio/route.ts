import { createServerSupabase } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createServerSupabase();

  // fetch official data
  // normalize
  // insert into staging tables
}