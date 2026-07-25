import { API_BASE_URL, API_ENDPOINTS } from "../constants/api";
import type { AdminAnalytics } from "../types/admin";

export async function getAdminAnalytics(): Promise<AdminAnalytics | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.adminAnalytics}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as AdminAnalytics;
  } catch {
    return null;
  }
}
