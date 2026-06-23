import { API_BASE_URL, API_ENDPOINTS } from "../constants/api";

export type BasicPlace = {
  id: string;
  name: string;
  type?: string | null;
  category?: string | null;
  latitude?: number | string| null; //added long and lat 
  longitude?: number | string | null; //added
};

function normalizePlace(place: any): BasicPlace | null {
  if (!place || typeof place !== "object") return null;
  if (place.id === undefined || !place.name) return null;

  return {
    id: String(place.id),
    name: String(place.name),
    type: place.type ?? null,
    category: place.category ?? null,
    latitude: place.latitude ?? place.lat ?? null,  //added
    longitude: place.longitude ?? place.lon ?? place.lng ?? null, //added
  };
}

export async function getPlaces(): Promise<BasicPlace[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.places}`);
    const data = await response.json();

    if (!response.ok) {
      return [];
    }

    const rawPlaces = Array.isArray(data) ? data : data.places;

    if (!Array.isArray(rawPlaces)) {
      return [];
    }

    return rawPlaces
      .map(normalizePlace)
      .filter((place): place is BasicPlace => place !== null);
  } catch {
    return [];
  }
}