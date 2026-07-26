import { API_BASE_URL, API_ENDPOINTS } from "../constants/api";
import type { Announcement, NewAnnouncement } from "../types/announcement";

function normalizeAnnouncement(item: any): Announcement | null {
  if (!item || typeof item !== "object") return null;
  if (item.id === undefined || !item.title) return null;

  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    id: String(item.id),
    title: String(item.title),
    description: item.description ?? null,
    type: item.type ?? "info",
    latitude,
    longitude,
    active: Boolean(item.active),
    created_at: String(item.created_at),
    expires_at: item.expires_at ?? null,
  };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.announcements}`
    );
    const data = await response.json();

    if (!response.ok) {
      return [];
    }

    const rawItems = Array.isArray(data) ? data : [];

    return rawItems
      .map(normalizeAnnouncement)
      .filter((item): item is Announcement => item !== null);
  } catch {
    return [];
  }
}

export async function createAnnouncement(
  input: NewAnnouncement
): Promise<Announcement | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.announcements}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    return normalizeAnnouncement(data);
  } catch {
    return null;
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.announcements}/${id}`,
      { method: "DELETE" }
    );

    return response.ok;
  } catch {
    return false;
  }
}
