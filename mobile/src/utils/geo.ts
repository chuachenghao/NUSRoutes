import type { BasicPlace } from "../api/placesApi";
import type { Coords } from "../hooks/useCurrentLocation";

//hvaersine  distance conversion 
export function distanceMeters(a: Coords, b: Coords): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

export function findNearestPlace(
  coords: Coords,
  places: BasicPlace[]
): BasicPlace | null {
  let best: BasicPlace | null = null;
  let bestDist = Infinity;

  for (const place of places) {
    const lat = Number(place.latitude);
    const lon = Number(place.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const d = distanceMeters(coords, { latitude: lat, longitude: lon });
    if (d < bestDist) {
      bestDist = d;
      best = place;
    }
  }

  return best;
}