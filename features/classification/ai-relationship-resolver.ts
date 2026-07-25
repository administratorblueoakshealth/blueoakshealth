import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export type AiRelationshipResult = {
  relationship_classification: "primary_target" | "referral_source" | "partner" | "competitor" | "vendor" | "non_target" | "unknown";
  competition_level: "none" | "low" | "medium" | "high" | "unknown";
  classification_confidence: number;
  relationship_classification_reason: string; // matches your actual DB column name
  classification_method: "ai";
};

export async function resolveRelationshipWithAI(input: {
  name: string;
  facilityType?: string | null;
  website?: string | null;
}): Promise<AiRelationshipResult> {
  const prompt = `You are classifying an organization's relationship to BlueOaks Health, a PMHNP (Psychiatric Mental Health Nurse Practitioner) practice providing psychiatric medication management and treatment.

Organization: ${input.name}
Listed category: ${input.facilityType ?? "unknown"}
Website: ${input.website ?? "none listed"}

Classify the relationship using ONLY this information — do not assume facts not given.
1. Does this organization prescribe or manage psychiatric medications? (competitor)
2. Does it house patients who may need psychiatric services but doesn't provide them? (primary_target)
3. Does it provide therapy/counseling/case management without prescribing? (referral_source)
4. Is it adjacent care with no overlap, like home health or hospice? (partner)
5. Is it legitimate healthcare but the wrong population (e.g. pediatric-only)? (non_target)
6. Is it not a care relationship at all? (vendor)

Return ONLY a JSON object in this exact shape, nothing else:
{
  "relationship_classification": "primary_target" | "referral_source" | "partner" | "competitor" | "vendor" | "non_target" | "unknown",
  "competition_level": "none" | "low" | "medium" | "high" | "unknown",
  "classification_confidence": <integer 0-100>,
  "relationship_classification_reason": "<one sentence, under 25 words>"
}

If you genuinely cannot tell, use "unknown" with low confidence rather than guessing.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      relationship_classification: parsed.relationship_classification ?? "unknown",
      competition_level: parsed.competition_level ?? "unknown",
      classification_confidence: Number(parsed.classification_confidence) || 0,
      relationship_classification_reason:
        parsed.relationship_classification_reason ?? "AI classification returned no reason",
      classification_method: "ai",
    };
  } catch (err) {
    console.error(`[ai-relationship-resolver] failed for "${input.name}"`, err);
    return {
      relationship_classification: "unknown",
      competition_level: "unknown",
      classification_confidence: 0,
      relationship_classification_reason: "AI classification failed — needs manual review",
      classification_method: "ai",
    };
  }
}