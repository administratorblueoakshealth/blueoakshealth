import { NextResponse } from "next/server";
import { generateDailyRoute } from "@/features/routing/route-planner.service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await generateDailyRoute({
      startingLocation: body.startingLocation,
      maxDistanceMiles: Number(body.maxDistanceMiles ?? 25),
      maxFacilities: Number(body.maxFacilities ?? 8),
      facilityTypes: body.facilityTypes,
      includeAllCategories: Boolean(body.includeAllCategories),
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown route error",
      },
      { status: 500 }
    );
  }
}