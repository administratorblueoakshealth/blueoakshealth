import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export async function getFacilityProfile(id: string) {
  const supabase = createServerSupabase();

  const [facilityResult, contactsResult, visitsResult, referralsResult, intelligenceResult] =
    await Promise.all([
      supabase.from("facilities").select("*").eq("id", id).single(),

      supabase
        .from("facility_contacts")
        .select("*")
        .eq("facility_id", id)
        .order("is_primary", { ascending: false }),

      supabase
        .from("facility_visits")
        .select("*")
        .eq("facility_id", id)
        .order("visit_date", { ascending: false })
        .limit(20),

      supabase
        .from("facility_referrals")
        .select("*")
        .eq("facility_id", id)
        .order("referral_date", { ascending: false })
        .limit(20),

      // ADDED: facility_intelligence — previously never fetched, meaning
      // current_psych_provider (and everything else in that table) could
      // never show up on the profile page even after being captured.
      // .maybeSingle() instead of .single() because a facility may not
      // have an intelligence row yet (nothing's been logged for it) —
      // .single() would throw an error in that case, .maybeSingle() just
      // returns null.
      supabase
        .from("facility_intelligence")
        .select("*")
        .eq("facility_id", id)
        .maybeSingle(),
    ]);

  if (facilityResult.error || !facilityResult.data) notFound();
  if (contactsResult.error) throw new Error(contactsResult.error.message);
  if (visitsResult.error) throw new Error(visitsResult.error.message);
  if (referralsResult.error) throw new Error(referralsResult.error.message);
  // NOTE: intelligenceResult.error is deliberately NOT thrown — if
  // facility_intelligence doesn't exist yet (migration not run), this
  // degrades to null rather than breaking the whole profile page.
  if (intelligenceResult.error) {
    console.error("[profile.repository] facility_intelligence fetch failed", intelligenceResult.error.message);
  }

  return {
    facility: facilityResult.data,
    contacts: contactsResult.data ?? [],
    visits: visitsResult.data ?? [],
    referrals: referralsResult.data ?? [],
    intelligence: intelligenceResult.data ?? null,
  };
}