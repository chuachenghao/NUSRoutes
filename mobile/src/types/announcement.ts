export type Announcement = {
  id: string;
  title: string;
  description: string | null;
  type: "info" | "warning" | "closure" | "disruption";
  latitude: number;
  longitude: number;
  active: boolean;
  created_at: string;
  expires_at: string | null;
};
