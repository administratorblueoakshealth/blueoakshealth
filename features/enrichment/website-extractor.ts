import * as cheerio from "cheerio";

export type ExtractedWebsiteData = {
  title: string | null;
  text: string;
  emails: string[];
  phones: string[];
  possibleContacts: Array<{
    full_name: string | null;
    title: string;
    confidence_score: number;
  }>;
};

const CONTACT_TITLES = [
  "administrator",
  "executive director",
  "director of nursing",
  "don",
  "admissions director",
  "marketing director",
  "community relations director",
  "social worker",
  "resident care director",
];

export async function extractWebsiteData(url: string): Promise<ExtractedWebsiteData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "BlueOaks-Growth-OS/1.0 admin@blueoakshealth.com",
    },
  });

  if (!response.ok) {
    throw new Error(`Website fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, noscript").remove();

  const title = $("title").text().trim() || null;
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 20000);

  const emails = Array.from(
    new Set(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [])
  );

  const phones = Array.from(
    new Set(text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) ?? [])
  );

  const lowerText = text.toLowerCase();

  const possibleContacts = CONTACT_TITLES.filter((title) =>
    lowerText.includes(title)
  ).map((title) => ({
    full_name: null,
    title,
    confidence_score: 55,
  }));

  return {
    title,
    text,
    emails,
    phones,
    possibleContacts,
  };
}