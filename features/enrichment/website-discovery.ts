type SerpApiResult = {
  organic_results?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    source?: string;
  }>;
};

const BLOCKED_DOMAINS = [
  "facebook.com",
  "linkedin.com",
  "yelp.com",
  "senioradvisor.com",
  "aplaceformom.com",
  "caring.com",
  "mapquest.com",
  "yellowpages.com",
  "zoominfo.com",
];

function isLikelyOfficialWebsite(url: string) {
  const lower = url.toLowerCase();

  if (!lower.startsWith("http")) return false;

  return !BLOCKED_DOMAINS.some((domain) => lower.includes(domain));
}

export async function discoverWebsite(facility: {
  name: string;
  city?: string | null;
  state?: string | null;
}) {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY is missing");
  }

  const query = `${facility.name} ${facility.city ?? ""} ${
    facility.state ?? "TX"
  } official website`;

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("num", "5");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`SerpAPI failed: ${response.status}`);
  }

  const data = (await response.json()) as SerpApiResult;

  const result =
    data.organic_results?.find(
      (item) => item.link && isLikelyOfficialWebsite(item.link)
    ) ?? null;

  return {
    searchQuery: query,
    websiteUrl: result?.link ?? null,
    source: "serpapi_google",
    title: result?.title ?? null,
    snippet: result?.snippet ?? null,
  };
}