import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { classifyReferralTarget } from "@/features/classification/referral-target-classifier";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("facilities")
      .select("id,name,facility_type,taxonomy_description")
      .limit(5000);

    if (error) throw new Error(error.message);

    let updated = 0;

    for (const facility of data ?? []) {
      const classification = classifyReferralTarget({
        name: facility.name,
        facilityType: facility.facility_type,
        taxonomy: facility.taxonomy_description,
      });

      const { error: updateError } = await supabase
        .from("facilities")
        .update(classification)
        .eq("id", facility.id);

      if (!updateError) updated++;
    }

    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown classification error",
      },
      { status: 500 }
    );
  }
}