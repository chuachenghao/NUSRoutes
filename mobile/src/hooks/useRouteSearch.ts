import { useState } from "react";

import { getRoute } from "../api/routesApi";
import type { RouteMode, RouteResponse } from "../types/route";

export function useRouteSearch() {
  const [startPlace, setStartPlace] = useState("");
  const [endPlace, setEndPlace] = useState("");
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [routeMode, setRouteMode] = useState<RouteMode>("fastest");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeMessage, setRouteMessage] = useState("");

  async function findRouteForPlaces(start: string, end: string, mode: RouteMode) {
    const trimmedStart = start.trim();
    const trimmedEnd = end.trim();

    if (!trimmedStart || !trimmedEnd) {
      setRoute(null);
      setRouteMessage("Enter both start and destination.");
      return;
    }

    if (trimmedStart.toLowerCase() === trimmedEnd.toLowerCase()) {
      setRoute(null);
      setRouteMessage("Start and destination cannot be the same.");
      return;
    }

    setLoadingRoute(true);
    setRoute(null);
    setRouteMessage("");

    try {
      const data = await getRoute(trimmedStart, trimmedEnd, mode);

      if (!data) {
        setRouteMessage("No route found for these places.");
        return;
      }

      setRoute(data);
    } finally {
      setLoadingRoute(false);
    }
  }

  async function findRoute() {
    await findRouteForPlaces(startPlace, endPlace, routeMode);
  }

  function changeRouteMode(mode: RouteMode) {
    setRouteMode(mode);
  }

  // used when the user taps a saved journey. findRoute reads the state values
  // which dont update straight away, so i just pass the names in directly here
  async function runJourney(s: string, e: string) {
    setStartPlace(s);
    setEndPlace(e);
    await findRouteForPlaces(s, e, routeMode);
  }

  function clearRoute() {
    setRoute(null);
    setRouteMessage("");
  }

  return {
    startPlace,
    endPlace,
    setStartPlace,
    setEndPlace,
    route,
    routeMode,
    loadingRoute,
    routeMessage,
    findRoute,
    changeRouteMode,
    runJourney,
    clearRoute,
  };
}
