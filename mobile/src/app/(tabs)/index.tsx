import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
    routeMode,
    loadingRoute,
    routeMessage,
    findRoute,
    changeRouteMode,
    runJourney,
    clearRoute,
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
      <NusMap
        route={route}
        announcements={announcements}
        userCoords={coords}
        routeMode={routeMode}
      />

      <View style={styles.topPanel}>
        {route ? (
          <Pressable style={styles.backButton} onPress={clearRoute}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : (
          <RouteSearchPanel
            places={places}
            startPlace={startPlace}
            endPlace={endPlace}
            onStartPlaceChange={setStartPlace}
            onEndPlaceChange={setEndPlace}
            onFindRoute={findRoute}
            routeMode={routeMode}
            onRouteModeChange={changeRouteMode}
            loading={loadingRoute}
            onUseMyLocation={handleUseMyLocation}
            locating={loadingLocation}
          />
        )}
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
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 6,
  },
  backButtonText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700",
  },
  bottomPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 32,
    zIndex: 10,
  },
});
