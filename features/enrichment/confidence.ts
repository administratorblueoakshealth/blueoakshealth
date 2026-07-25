export function scoreWebsiteConfidence(input: {
  facilityName: string;
  city?: string | null;
  url?: string | null;
  text?: string | null;
}) {
  let score = 30;

  const name = input.facilityName.toLowerCase();
  const city = input.city?.toLowerCase() ?? "";
  const url = input.url?.toLowerCase() ?? "";
  const text = input.text?.toLowerCase() ?? "";

  const nameWords = name
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);

  const matchingWords = nameWords.filter(
    (word) => url.includes(word) || text.includes(word)
  );

  if (matchingWords.length >= 2) score += 30;
  if (city && text.includes(city)) score += 15;
  if (url.includes(".com") || url.includes(".org")) score += 10;
  if (text.includes("assisted living")) score += 10;
  if (text.includes("memory care")) score += 10;

  return Math.min(score, 100);
}

export function contactConfidence(sourceType: string) {
  switch (sourceType) {
    case "facility_website":
      return 90;
    case "texas_hhsc":
      return 85;
    case "google_business":
      return 80;
    case "linkedin":
      return 70;
    case "ai_inferred":
      return 40;
    default:
      return 50;
  }
}