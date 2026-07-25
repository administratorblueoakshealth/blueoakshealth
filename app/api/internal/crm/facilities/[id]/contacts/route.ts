import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("facility_contacts")
      .select("id, full_name, first_name, last_name, title, phone, email, is_primary, confidence_score")
      .eq("facility_id", id)
      .order("is_primary", { ascending: false })
      .order("confidence_score", { ascending: false });

    if (error) throw new Error(error.message);

    const contacts = (data ?? []).map((c) => ({
      id: c.id,
      name: c.full_name ?? [c.first_name, c.last_name].filter(Boolean).join(" "),
      role: c.title,
      phone: c.phone,
      email: c.email,
      is_primary: c.is_primary,
    }));

    return NextResponse.json({ ok: true, contacts });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown contacts error",
      },
      { status: 500 }
    );
  }
}