import { NextResponse } from "next/server";
import { getFacilities } from "@/features/facilities/repository";
import { generateDailyRoute } from "@/features/routing/route-planner.service";

export const runtime = "nodejs";

function looksLikeAddress(input: string) {
  return /\d{2,}/.test(input) && /(street|st|road|rd|drive|dr|way|lane|ln|court|ct|avenue|ave|blvd|parkway|pkwy|circle|cir)/i.test(input);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const q = String(body.q ?? "").trim();
    const city = String(body.city ?? "").trim();
    const county = String(body.county ?? "").trim();
    const zip = String(body.zip ?? "").trim();
    const facilityType = String(body.facilityType ?? "all");

    if (q && looksLikeAddress(q)) {
      const route = await generateDailyRoute({
        startingLocation: q,
        maxDistanceMiles: Number(body.maxDistanceMiles ?? 25),
        maxFacilities: Number(body.limit ?? 50),
        facilityTypes:
          facilityType && facilityType !== "all" ? [facilityType] : ["Assisted Living"],
      });

      return NextResponse.json({
        ok: true,
        mode: "nearby_address",
        facilities: route.stops,
        formattedStartingAddress: route.formattedStartingAddress,
        start: route.start,
      });
    }

    const facilities = await getFacilities({
      q,
      city,
      county,
      zip,
      facilityType,
      limit: Number(body.limit ?? 100),
    });

    return NextResponse.json({
      ok: true,
      mode: "facility_filter",
      facilities,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown smart search error",
      },
      { status: 500 }
    );
  }
}