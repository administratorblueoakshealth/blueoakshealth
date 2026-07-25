import { NextResponse } from "next/server";
import { scoreTopFacilities } from "@/features/facilities/scoring";

export const runtime = "nodejs";

export async function POST() {
  try {
    const results = await scoreTopFacilities(10);

    return NextResponse.json({
      ok: true,
      scored: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}