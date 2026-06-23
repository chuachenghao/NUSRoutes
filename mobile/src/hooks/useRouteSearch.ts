import { useState } from "react";

import { getRoute } from "../api/routesApi";
import type { RouteResponse } from "../types/route";

export function useRouteSearch() {
  const [startPlace, setStartPlace] = useState("");
  const [endPlace, setEndPlace] = useState("");
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeMessage, setRouteMessage] = useState("");

  async function findRoute() {
    const trimmedStart = startPlace.trim();
    const trimmedEnd = endPlace.trim();

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
      const data = await getRoute(trimmedStart, trimmedEnd);

      if (!data) {
        setRouteMessage("No route found for these places.");
        return;
      }

      setRoute(data);
    } finally {
      setLoadingRoute(false);
    }
  }

  // used when the user taps a saved journey. findRoute reads the state values
  // which dont update straight away, so i just pass the names in directly here
  async function runJourney(s: string, e: string) {
    setStartPlace(s);
    setEndPlace(e);

    setLoadingRoute(true);
    setRoute(null);
    setRouteMessage("");

    try {
      const data = await getRoute(s, e);

      if (!data) {
        setRouteMessage("No route found for these places.");
        return;
      }

      setRoute(data);
    } finally {
      setLoadingRoute(false);
    }
  }

  return {
    startPlace,
    endPlace,
    setStartPlace,
    setEndPlace,
    route,
    loadingRoute,
    routeMessage,
    findRoute,
    runJourney,
  };
}