import { NextResponse } from "next/server";
import { backfillRelationshipClassifications } from "@/features/classification/backfill-relationship-classifications";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await backfillRelationshipClassifications();

    return NextResponse.json({ ok: true, ...result });
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