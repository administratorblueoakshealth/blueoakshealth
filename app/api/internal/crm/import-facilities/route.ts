import { NextResponse } from "next/server";
import { importTexasFacilities } from "@/features/imports/import.service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await importTexasFacilities();

    return NextResponse.json({
      ok: true,
      message: "Texas HHSC facilities imported.",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown import error",
      },
      { status: 500 }
    );
  }
}