export type Place = {
  id: string;
  venue_code: string | null;
  name: string;
  type: string | null;
  category?: string | null;
  building_code: string | null;
  room_name: string | null;
  floor: string | number | null;
  latitude: number | string;
  longitude: number | string;
  google_maps_url: string | null;
  description: string | null;
  keywords?: string[] | null;
  source?: string | null;
  osm_id?: string | null;
  osm_type?: string | null;
};

export type NearbyPlace = Place & {
  distance_km: number | string;
};