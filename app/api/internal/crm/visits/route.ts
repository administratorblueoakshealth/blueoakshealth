import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { interpretFollowUpTiming } from "@/features/facilities/follow-up-interpreter";

export const runtime = "nodejs";

type ContactInput = {
  role: string;
  name: string;
  phone?: string;
  email?: string;
  is_primary?: boolean;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.facility_id) {
      return NextResponse.json(
        { ok: false, error: "facility_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const contacts: ContactInput[] = Array.isArray(body.contacts) ? body.contacts : [];

    // If the human explicitly picked a date, that ALWAYS wins — no AI
    // involved at all. Only fill the gap when the field was left empty.
    let nextFollowUpAt: string | null = body.next_follow_up_at || null;
    let followUpSource = nextFollowUpAt ? "manual" : null;

    if (!nextFollowUpAt) {
      const interpretation = await interpretFollowUpTiming({
        notes: body.notes ?? null,
        outcome: body.outcome ?? null,
        nextAction: body.next_action ?? null,
        visitDate: new Date().toISOString(),
      });

      if (interpretation.suggested_follow_up_at && interpretation.confidence >= 60) {
        nextFollowUpAt = interpretation.suggested_follow_up_at;
        followUpSource = "ai_inferred";
        console.log(
          `[visits] AI inferred follow-up for facility ${body.facility_id}: ${nextFollowUpAt} (${interpretation.reasoning}, confidence ${interpretation.confidence})`
        );
      }
    }

    const { data: visitId, error } = await supabase.rpc("log_visit_with_contacts", {
      p_facility_id: body.facility_id,
      p_visit_type: body.visit_type ?? "in_person",
      p_purpose: body.purpose ?? null,
      p_notes: body.notes ?? null,
      p_outcome: body.outcome ?? null,
      p_next_action: body.next_action ?? null,
      p_next_follow_up_at: nextFollowUpAt,
      p_relationship_stage: body.relationship_stage ?? "introduced",
      p_contacts: contacts,
      p_logged_by: body.logged_by ?? "field_visit",
      p_current_psych_provider: body.current_psych_provider || null,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({
      ok: true,
      visit_id: visitId,
      next_follow_up_at: nextFollowUpAt,
      follow_up_source: followUpSource, // "manual" | "ai_inferred" | null
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown visit error",
      },
      { status: 500 }
    );
  }
}