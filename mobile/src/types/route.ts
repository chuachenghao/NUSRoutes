export type RoutePlace = {
  id: string;
  name: string;
  latitude: number | string;
  longitude: number | string;
  nearest_osm_node?: string | number | null;
};

export type RouteCoordinate = {
  latitude: number;
  longitude: number;
  lat?: number;
  lon?: number;
};

export type RouteResponse = {
  start_place: RoutePlace;
  end_place: RoutePlace;
  distance_m: number;
  path: string[];
  coordinates: RouteCoordinate[];
};