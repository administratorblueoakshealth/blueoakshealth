export function scoreReferralFit(input: {
  name?: string | null;
  facilityType?: string | null;
  taxonomy?: string | null;
  category?: string | null;
}) {
  const text = [
    input.name,
    input.facilityType,
    input.taxonomy,
    input.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = 40;
  const reasons: string[] = [];

  const strongFits = [
    "assisted living",
    "memory care",
    "alzheimer",
    "dementia",
    "group home",
    "residential care",
    "icf",
    "intellectual disability",
    "developmental disability",
    "behavioral health",
    "mental health",
    "psychiatric",
    "senior living",
  ];

  for (const term of strongFits) {
    if (text.includes(term)) {
      score += 10;
      reasons.push(`Matches ${term}`);
    }
  }

  const weakOrExclude = [
    "dentist",
    "chiropractor",
    "optometry",
    "pharmacy",
    "laboratory",
    "imaging",
    "ambulance",
  ];

  for (const term of weakOrExclude) {
    if (text.includes(term)) {
      score -= 30;
      reasons.push(`Low referral fit: ${term}`);
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    referral_fit_score: score,
    service_fit_reason: reasons.join("; ") || "General healthcare facility",
    exclude_from_routes: score < 50,
  };
}