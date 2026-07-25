import { NextResponse } from "next/server";
import { importNpiLocalProviders } from "@/features/imports/npi-import";
import { importGooglePlacesNearby } from "@/features/imports/google-places-import";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const startingAddress =
      body.startingAddress ?? "622 Colosseo Way, San Antonio, TX 78253";

    const npi = await importNpiLocalProviders("78253");
    const googlePlaces = await importGooglePlacesNearby(startingAddress, 16000);

    return NextResponse.json({
      ok: true,
      npi,
      googlePlaces,
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