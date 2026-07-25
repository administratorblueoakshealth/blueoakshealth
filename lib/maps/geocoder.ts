export async function geocodeAddress(address: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is missing.");
  }

  const response = await fetch(
    "https://maps.googleapis.com/maps/api/geocode/json?" +
      new URLSearchParams({
        address,
        key: apiKey,
      }),
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Google Geocoding request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== "OK" || !data.results?.[0]) {
    throw new Error(`Could not geocode starting location: ${data.status}`);
  }

  const location = data.results[0].geometry.location;

  return {
    lat: Number(location.lat),
    lng: Number(location.lng),
    formattedAddress: data.results[0].formatted_address,
  };
}
export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 3958.8;

  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}