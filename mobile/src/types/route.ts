export type RoutePlace = {
  id: string;
  name: string;
};

export type RouteCoordinate = {
  latitude: number;
  longitude: number;
};

export type RouteSegment = {
  coordinates: RouteCoordinate[];
  is_sheltered: boolean;
};

export type RouteMode = "fastest" | "sheltered";

export type WeatherSuggestion = {
  reason: string;
};

export type RouteAnnouncement = {
  id: string;
  title: string;
  type: string;
};

export type RouteResponse = {
  start_place: RoutePlace;
  end_place: RoutePlace;
  distance_m: number;
  coordinates: RouteCoordinate[];
  route_segments: RouteSegment[];
  route_mode: RouteMode;
  sheltered_ratio: number;
  weather_suggestion: WeatherSuggestion | null;
  closures_nearby: RouteAnnouncement[];
  congestion_nearby: RouteAnnouncement[];
  closure_ignored: boolean;
};
