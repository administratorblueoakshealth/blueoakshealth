import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { discoverWebsite } from "@/features/enrichment/website-discovery";
import { extractWebsiteData } from "@/features/enrichment/website-extractor";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createServerSupabase();

    const { data: facility, error } = await supabase
      .from("facilities")
      .select("id,name,city,state,website,county")
      .eq("county", "BEXAR")
      .limit(1)
      .single();

    if (error) throw new Error(error.message);

    const discovered = await discoverWebsite(facility);

    const websiteUrl = facility.website || discovered.websiteUrl;

    if (!websiteUrl) {
      return NextResponse.json({
        ok: true,
        facility,
        discovered,
        message: "No website found",
      });
    }

    const extracted = await extractWebsiteData(websiteUrl);

    return NextResponse.json({
      ok: true,
      facility,
      discovered,
      websiteUrl,
      extracted: {
        title: extracted.title,
        textLength: extracted.text.length,
        emailCount: extracted.emails.length,
        phoneCount: extracted.phones.length,
        possibleContactCount: extracted.possibleContacts.length,
        emails: extracted.emails.slice(0, 5),
        phones: extracted.phones.slice(0, 5),
        possibleContacts: extracted.possibleContacts.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Debug enrichment failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown debug error",
      },
      { status: 500 }
    );
  }
}