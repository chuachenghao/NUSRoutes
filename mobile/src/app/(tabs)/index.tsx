import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import NusMap from "../../components/NusMap";
import RouteSearchPanel from "../../components/RouteSearchPanel";
import RouteSummaryCard from "../../components/RouteSummaryCard";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import { usePlaces } from "../../hooks/usePlaces";
import { useRouteSearch } from "../../hooks/useRouteSearch";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";
import { findNearestPlace } from "../../utils/geo";

export default function HomeScreen() {
  const { places, placesMessage } = usePlaces();
  const { announcements } = useAnnouncements();

  const { coords, loadingLocation, requestLocation } = useCurrentLocation();

  const {
    startPlace,
    endPlace,
    setStartPlace,
    setEndPlace,
    route,
    loadingRoute,
    routeMessage,
    findRoute,
    runJourney,
  } = useRouteSearch();

  // if we came from the Saved tab it sends start + end as params, so just run it
  const { start, end } = useLocalSearchParams<{ start?: string; end?: string }>();
  useEffect(() => {
    if (start && end) {
      runJourney(start, end);
    }
  }, [start, end]);

  async function handleUseMyLocation() {
    const here = await requestLocation();
    if (!here) return;

    const nearest = findNearestPlace(here, places);
    if (nearest) {
      setStartPlace(nearest.name);
    }
  }

  return (
    <View style={styles.screen}>
      <NusMap route={route} announcements={announcements} userCoords={coords} />

      <View style={styles.topPanel}>
        <RouteSearchPanel
          places={places}
          startPlace={startPlace}
          endPlace={endPlace}
          onStartPlaceChange={setStartPlace}
          onEndPlaceChange={setEndPlace}
          onFindRoute={findRoute}
          loading={loadingRoute}
          onUseMyLocation={handleUseMyLocation}
          locating={loadingLocation}
        />
      </View>

      <View style={styles.bottomPanel}>
        <RouteSummaryCard route={route} message={routeMessage || placesMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topPanel: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  bottomPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 32,
    zIndex: 10,
  },
});
