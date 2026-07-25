import { createServerSupabase } from "@/lib/supabase/server";
import type { Facility } from "./types";

export type FacilityFilters = {
  q?: string;
  city?: string;
  county?: string;
  zip?: string;
  facilityType?: string;
  limit?: number;
};

export async function getFacilities(filters: FacilityFilters = {}): Promise<Facility[]> {
  const supabase = createServerSupabase();

  let query = supabase
    .from("facilities")
    .select("*")
    .order("priority_score", { ascending: false })
    .order("name", { ascending: true })
    .limit(filters.limit ?? 100);

    if (filters.q) {
    const q = filters.q.trim();

    if (q) {
        query = query.or(
        `name.ilike.%${q}%,address.ilike.%${q}%,phone.ilike.%${q}%,license_number.ilike.%${q}%`
        );
    }
    }

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  if (filters.county) {
    query = query.ilike("county", `%${filters.county}%`);
  }

  if (filters.zip) {
    query = query.ilike("zip", `%${filters.zip}%`);
  }

  if (filters.facilityType && filters.facilityType !== "all") {
    query = query.eq("facility_type", filters.facilityType);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function getTopFacilities(limit = 10): Promise<Facility[]> {
  return getFacilities({
    county: "BEXAR",
    limit,
  });
}

export async function countFacilities() {
  const supabase = createServerSupabase();

  const { count, error } = await supabase
    .from("facilities")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);

  return count ?? 0;
}

export async function updateFacilityAI(
  id: string,
  input: {
    priority_score: number;
    ai_summary: string;
    ai_next_action: string;
  }
) {
  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("facilities")
    .update({
      priority_score: input.priority_score,
      ai_summary: input.ai_summary,
      ai_next_action: input.ai_next_action,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
export async function updateFacilityOpportunityScores(
  id: string,
  scores: {
    opportunity_score: number;
    service_fit_score: number;
    relationship_score: number;
    follow_up_score: number;
    data_confidence_score: number;
  }
) {
  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("facilities")
    .update({
      ...scores,
      priority_score: scores.opportunity_score,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
export async function getUnscoredFacilities(batchSize: number): Promise<Facility[]> {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .is("ai_summary", null)
    .order("priority_score", { ascending: false })
    .range(0, batchSize - 1);

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function countUnscoredFacilities(): Promise<number> {
  const supabase = createServerSupabase();

  const { count, error } = await supabase
    .from("facilities")
    .select("*", { count: "exact", head: true })
    .is("ai_summary", null);

  if (error) throw new Error(error.message);

  return count ?? 0;
}