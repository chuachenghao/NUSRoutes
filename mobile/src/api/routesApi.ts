import { API_BASE_URL, API_ENDPOINTS } from "../constants/api";
import type { RouteCoordinate, RoutePlace, RouteResponse } from "../types/route";

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeCoordinate(coordinate: any): RouteCoordinate | null {
  if (!coordinate || typeof coordinate !== "object") return null;

  const latitude = toNumber(coordinate.latitude ?? coordinate.lat);
  const longitude = toNumber(coordinate.longitude ?? coordinate.lon ?? coordinate.lng);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function normalizePlace(place: any): RoutePlace | null {
  if (!place || typeof place !== "object") return null;
  if (place.id === undefined || !place.name) return null;

  const latitude = place.latitude ?? place.lat;
  const longitude = place.longitude ?? place.lon ?? place.lng;

  return {
    id: String(place.id),
    name: String(place.name),
    latitude: latitude ?? "",
    longitude: longitude ?? "",
    nearest_osm_node: place.nearest_osm_node ?? null,
  };
}

function normalizeRouteResponse(data: any): RouteResponse | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const distanceM = toNumber(data.distance_m ?? data.distanceMeters);

  if (distanceM === null) {
    return null;
  }

  const startPlace = normalizePlace(data.start_place ?? data.startPlace);
  const endPlace = normalizePlace(data.end_place ?? data.endPlace);

  if (!startPlace || !endPlace) {
    return null;
  }

  if (!Array.isArray(data.coordinates)) {
    return null;
  }

  const coordinates = data.coordinates
    .map(normalizeCoordinate)
    .filter((coordinate: RouteCoordinate | null): coordinate is RouteCoordinate => coordinate !== null);

  if (coordinates.length < 2) {
    return null;
  }

  const path = Array.isArray(data.path) ? data.path.map(String) : [];

  return {
    start_place: startPlace,
    end_place: endPlace,
    distance_m: distanceM,
    path,
    coordinates,
  };
}

export async function getRoute(
  start: string,
  end: string
): Promise<RouteResponse | null> {
  try {
    const params = new URLSearchParams({
      start: start.trim(),
      end: end.trim(),
    });

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.routes}?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    return normalizeRouteResponse(data);
  } catch {
    return null;
  }
}