import { API_BASE_URL, API_ENDPOINTS } from "../constants/api";
import type { Report, ReportType, VoteType } from "../types/report";

const REPORTS_URL = `${API_BASE_URL}${API_ENDPOINTS.reports}`;

// turn a raw row from the backend into our Report type
function toReport(item: any): Report | null {
  if (!item || item.id === undefined) return null;

  const lat = Number(item.latitude);
  const lng = Number(item.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: String(item.id),
    type: (item.type ?? "other") as ReportType,
    description: item.description ?? null,
    latitude: lat,
    longitude: lng,
    reporterId: item.reporter_id ? String(item.reporter_id) : null,
    reporterName: item.reporter_name ?? null,
    upvotes: Number(item.upvotes) || 0,
    irrelevantCount: Number(item.irrelevant_count) || 0,
    hasUpvoted: Boolean(item.has_upvoted),
    hasFlagged: Boolean(item.has_flagged),
    createdAt: String(item.created_at),
    expiresAt: item.expires_at ?? null,
  };
}

export async function getReports(voterId?: string | null): Promise<Report[]> {
  try {
    const url = voterId ? `${REPORTS_URL}?voterId=${voterId}` : REPORTS_URL;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) return [];

    const rows = Array.isArray(data) ? data : [];
    return rows.map(toReport).filter((r): r is Report => r !== null);
  } catch {
    return [];
  }
}

export async function createReport(payload: {
  type: ReportType;
  description?: string | null;
  latitude: number;
  longitude: number;
  reporter_id?: string | null;
  reporter_name?: string | null;
}): Promise<Report | null> {
  try {
    const res = await fetch(REPORTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return null;
    return toReport(data);
  } catch {
    return null;
  }
}

// upvote or mark as no longer relevant (backend toggles it)
export async function voteReport(
  id: string,
  voterId: string,
  voteType: VoteType
): Promise<Report | null> {
  try {
    const res = await fetch(`${REPORTS_URL}/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId, voteType }),
    });
    const data = await res.json();
    if (!res.ok) return null;
    return toReport(data);
  } catch {
    return null;
  }
}

export async function deleteReport(id: string, requesterId: string): Promise<boolean> {
  try {
    const res = await fetch(`${REPORTS_URL}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
