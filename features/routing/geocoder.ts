type GeocodeResult = {
  lat: number;
  lng: number;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "BlueOaks-Growth-OS/1.0 admin@blueoakshealth.com",
      "Referer": "https://blueoakshealth.com",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status}`);
  }

  const data = (await response.json()) as Array<{ lat: string; lon: string }>;

  if (!data.length) return null;

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
  };
}

export function haversineMiles(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;

  const dLat = toRad(end.lat - start.lat);
  const dLng = toRad(end.lng - start.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(start.lat)) *
      Math.cos(toRad(end.lat)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}