import { Facility } from "@/features/facilities/types";

export function buildFacilityScoringPrompt(facility: Facility) {
  return `
Score this healthcare referral source for BlueOaks Growth OS.

Return JSON only:
{
  "score": number,
  "summary": string,
  "next_action": string,
  "referral_tier": "low" | "medium" | "high" | "strategic"
}

Facility:
${JSON.stringify(facility, null, 2)}
`;
}