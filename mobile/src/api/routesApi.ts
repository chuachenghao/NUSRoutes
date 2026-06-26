import { API_BASE_URL, API_ENDPOINTS } from "../constants/api";
import type {
  RouteCoordinate,
  RouteMode,
  RoutePlace,
  RouteResponse,
  RouteSegment,
  WeatherSuggestion,
} from "../types/route";

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

  return {
    id: String(place.id),
    name: String(place.name),
  };
}

function normalizeWeatherSuggestion(value: any): WeatherSuggestion | null {
  if (!value || typeof value !== "object") return null;
  if (!value.reason) return null;

  return {
    reason: String(value.reason),
  };
}

function normalizeRouteSegment(segment: any): RouteSegment | null {
  if (!segment || !Array.isArray(segment.coordinates)) return null;

  const coordinates = segment.coordinates
    .map(normalizeCoordinate)
    .filter((coordinate: RouteCoordinate | null): coordinate is RouteCoordinate => coordinate !== null);

  if (coordinates.length < 2) return null;

  return {
    coordinates,
    is_sheltered: Boolean(segment.is_sheltered),
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

  const routeMode: RouteMode = data.route_mode === "sheltered" ? "sheltered" : "fastest";
  const shelteredRatio = toNumber(data.sheltered_ratio);
  const routeSegments = Array.isArray(data.route_segments)
    ? data.route_segments
        .map(normalizeRouteSegment)
        .filter((segment: RouteSegment | null): segment is RouteSegment => segment !== null)
    : [];

  return {
    start_place: startPlace,
    end_place: endPlace,
    distance_m: distanceM,
    coordinates,
    route_segments: routeSegments,
    route_mode: routeMode,
    sheltered_ratio: shelteredRatio ?? 0,
    weather_suggestion: normalizeWeatherSuggestion(data.weather_suggestion),
  };
}

export async function getRoute(
  start: string,
  end: string,
  mode: RouteMode = "fastest"
): Promise<RouteResponse | null> {
  try {
    const params = new URLSearchParams({
      start: start.trim(),
      end: end.trim(),
      mode,
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
