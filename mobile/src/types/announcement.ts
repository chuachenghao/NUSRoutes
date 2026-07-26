export type AnnouncementType =
  | "info"
  | "warning"
  | "closure"
  | "disruption"
  | "congestion";

export type Announcement = {
  id: string;
  title: string;
  description: string | null;
  type: AnnouncementType;
  latitude: number;
  longitude: number;
  active: boolean;
  created_at: string;
  expires_at: string | null;
};

// what the admin form sends when posting a new one
export type NewAnnouncement = {
  title: string;
  description: string;
  type: AnnouncementType;
  latitude: number;
  longitude: number;
  expires_at: string | null;
};
