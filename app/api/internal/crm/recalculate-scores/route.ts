import { NextResponse } from "next/server";
import { recalculateFacilityScores } from "@/features/facilities/recalculate-scores";

export const runtime = "nodejs";

export async function POST() {
  try {
    const results = await recalculateFacilityScores(200);

    return NextResponse.json({
      ok: true,
      updated: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown scoring error",
      },
      { status: 500 }
    );
  }
}