import { NextResponse } from "next/server";
import { scoreAllUnscoredFacilities } from "@/features/facilities/scoring";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { scored, failed, results } = await scoreAllUnscoredFacilities();

    return NextResponse.json({
      ok: true,
      scored,
      failed,
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