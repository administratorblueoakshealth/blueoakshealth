import { NextResponse } from "next/server";
import { getDailyIntelligence } from "@/features/intelligence/daily-intelligence.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getDailyIntelligence();

    return NextResponse.json({
      ok: true,
      ...data,
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