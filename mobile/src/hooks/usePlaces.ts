import { useEffect, useState } from "react";

import { getPlaces, type BasicPlace } from "../api/placesApi";

export function usePlaces() {
  const [places, setPlaces] = useState<BasicPlace[]>([]);
  const [placesMessage, setPlacesMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      setPlacesMessage("");

      const data = await getPlaces();

      if (!isMounted) return;

      setPlaces(data);

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
    placesMessage,
  };
}
