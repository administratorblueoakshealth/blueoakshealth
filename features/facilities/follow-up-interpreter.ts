import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Reads real visit notes/outcome and infers whether the facility implied a
 * follow-up timeframe, even if nothing specific like "come back tomorrow"
 * was said. E.g. "she seemed really interested and said to check back soon"
 * should trigger a short follow-up window, while "no residents right now,
 * she'll reach out when needed" should NOT trigger a short window.
 *
 * IMPORTANT: this only runs when the human did NOT manually set a follow-up
 * date on the form. An explicit human-chosen date always wins — this exists
 * purely to fill the gap when notes clearly imply timing but nobody typed
 * a date in. If the AI finds no clear signal, it returns null and the
 * field stays empty, exactly as if this step never ran.
 *
 * Runs ONCE at visit-log time, not on every Daily Route page load — the
 * result gets written to next_follow_up_at and read from there after that,
 * same caching discipline as facility_ai_profiles and route scoring.
 */

export type FollowUpInterpretation = {
  suggested_follow_up_at: string | null; // ISO date string, or null if no signal
  reasoning: string;
  confidence: number; // 0-100
};

export async function interpretFollowUpTiming(input: {
  notes: string | null;
  outcome: string | null;
  nextAction: string | null;
  visitDate: string; // ISO date of the visit being logged, used as the anchor for "in 2 days" etc.
}): Promise<FollowUpInterpretation> {
  const combinedText = [input.notes, input.outcome, input.nextAction]
    .filter(Boolean)
    .join(" ");

  if (!combinedText.trim()) {
    return { suggested_follow_up_at: null, reasoning: "No visit notes to interpret", confidence: 0 };
  }

  const prompt = `You are reading field notes from a healthcare referral visit to determine if the person visited implied a follow-up timeframe, even indirectly.

Today's visit date: ${input.visitDate}

Visit notes: "${input.notes ?? ""}"
Outcome: "${input.outcome ?? ""}"
Next action written down: "${input.nextAction ?? ""}"

Decide if there's a genuine signal about WHEN to follow up:
- Explicit ("come back Thursday", "check back in 2 days") → use that
- Strong positive/urgency language ("very interested", "asked us to check back soon", "wants to move quickly") → suggest 2-5 days out
- Moderate positive, no urgency ("open to it", "said maybe") → suggest 2-3 weeks out
- Neutral/no current need but door open ("no residents right now", "reach out when needed") → return null, this should NOT get a short follow-up
- Negative/no interest → return null

Be conservative: if you're not genuinely confident there's a timing signal, return null rather than guessing. A false "follow up in 2 days" wastes a real visit slot; a missed short window just means the facility appears at normal priority instead of urgently, which is a much smaller cost.

Return ONLY a JSON object:
{
  "days_from_now": <integer or null>,
  "reasoning": "<one sentence, under 20 words>",
  "confidence": <integer 0-100>
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 150,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.days_from_now === null || parsed.days_from_now === undefined) {
      return {
        suggested_follow_up_at: null,
        reasoning: parsed.reasoning ?? "No clear timing signal found",
        confidence: Number(parsed.confidence) || 0,
      };
    }

    const days = Math.max(0, Math.min(180, Number(parsed.days_from_now))); // sanity clamp
    const followUpDate = new Date(input.visitDate);
    followUpDate.setDate(followUpDate.getDate() + days);

    return {
      suggested_follow_up_at: followUpDate.toISOString(),
      reasoning: parsed.reasoning ?? "",
      confidence: Number(parsed.confidence) || 0,
    };
  } catch (err) {
    console.error("[follow-up-interpreter] failed", err);
    return { suggested_follow_up_at: null, reasoning: "Interpretation failed", confidence: 0 };
  }
}