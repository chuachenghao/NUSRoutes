import { useEffect, useState } from "react";

import { getPlaces, type BasicPlace } from "../api/placesApi";

export function usePlaces() {
  const [places, setPlaces] = useState<BasicPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesMessage, setPlacesMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      setLoadingPlaces(true);
      setPlacesMessage("");

      const data = await getPlaces();

      if (!isMounted) return;

      setPlaces(data);
      setLoadingPlaces(false);

      if (data.length === 0) {
        setPlacesMessage("No places loaded from backend.");
      }
    }

    loadPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    places,
    loadingPlaces,
    placesMessage,
  };
}