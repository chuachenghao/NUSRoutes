export type ReportType =
  | "obstruction"
  | "closure"
  | "crowded"
  | "hazard"
  | "other";

export type VoteType = "upvote" | "irrelevant";

export type Report = {
  id: string;
  type: ReportType;
  description: string | null;
  latitude: number;
  longitude: number;
  reporterId: string | null;
  reporterName: string | null;
  upvotes: number;
  irrelevantCount: number;
  hasUpvoted: boolean;
  hasFlagged: boolean;
  createdAt: string;
  expiresAt: string | null;
};
