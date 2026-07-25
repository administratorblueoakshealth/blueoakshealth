import { z } from "zod";
import { openai } from "@/lib/ai/openai";

const FacilityScoreSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  next_action: z.string(),
  referral_tier: z.enum(["low", "medium", "high", "strategic"]),
});

function extractJson(text: string) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

export async function scoreFacilityWithAI(facility: unknown) {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    input: `
Score this referral source for BlueOaks Growth OS.

Return JSON only:
{
  "score": number,
  "summary": string,
  "next_action": string,
  "referral_tier": "low" | "medium" | "high" | "strategic"
}

Facility:
${JSON.stringify(facility, null, 2)}
`,
  });

  const parsed = JSON.parse(extractJson(response.output_text));
  return FacilityScoreSchema.parse(parsed);
}