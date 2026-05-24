const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export const API_ENDPOINTS = {
  places: "/places",
  routes: "/routing",
} as const;