export type AdminAnalytics = {
  summary: {
    total_route_searches: number;
    recent_route_searches: number;
    avg_distance_m: number;
    avg_sheltered_ratio: number;
    fastest_searches: number;
    sheltered_searches: number;
    busiest_hour: {
      label: string;
      searches: number;
    };
  };
  top_destinations: {
    place_id: string | null;
    name: string;
    searches: number;
  }[];
  route_pairs: {
    start_name: string;
    end_name: string;
    searches: number;
    avg_distance_m: number;
  }[];
  peak_usage_times: {
    hour: number;
    label: string;
    searches: number;
  }[];
  heat_points: {
    place_id: string | null;
    name: string;
    searches: number;
    intensity: number;
  }[];
};
