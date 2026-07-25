import { NextResponse } from "next/server";
import { enrichFacilitiesBatch } from "@/features/enrichment/enrichment.service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await enrichFacilitiesBatch(10);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown enrichment error",
      },
      { status: 500 }
    );
  }
}