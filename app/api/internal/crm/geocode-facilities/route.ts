import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { geocodeLocation } from "@/features/routing/geocoder";

export const runtime = "nodejs";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    const { data: facilities, error } = await supabase
      .from("facilities")
      .select("id,name,address,city,state,zip,county")
      .or("city.ilike.%SAN ANTONIO%,county.ilike.%BEXAR%")
      .is("latitude", null)
      .limit(3000);

    if (error) throw new Error(error.message);

    let geocoded = 0;

    for (const facility of facilities ?? []) {
      const query = [
        facility.address,
        facility.city,
        facility.state ?? "TX",
        facility.zip,
      ]
        .filter(Boolean)
        .join(", ");

      const result = await geocodeLocation(query);

      if (result) {
        await supabase
          .from("facilities")
          .update({
            latitude: result.lat,
            longitude: result.lng,
            geocoded_at: new Date().toISOString(),
            geocode_source: "nominatim",
          })
          .eq("id", facility.id);

        geocoded++;
      }

      await sleep(1100);
    }

    return NextResponse.json({
      ok: true,
      attempted: facilities?.length ?? 0,
      geocoded,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown geocoding error",
      },
      { status: 500 }
    );
  }
}