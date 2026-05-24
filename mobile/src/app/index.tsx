import { StyleSheet, View } from "react-native";

import NusMap from "../components/NusMap";
import RouteSearchPanel from "../components/RouteSearchPanel";
import RouteSummaryCard from "../components/RouteSummaryCard";
import { usePlaces } from "../hooks/usePlaces";
import { useRouteSearch } from "../hooks/useRouteSearch";

export default function HomeScreen() {
  const { places, placesMessage } = usePlaces();

  const {
    startPlace,
    endPlace,
    setStartPlace,
    setEndPlace,
    route,
    loadingRoute,
    routeMessage,
    findRoute,
  } = useRouteSearch();

  return (
    <View style={styles.screen}>
      <NusMap route={route} />

      <View style={styles.topPanel}>
        <RouteSearchPanel
          places={places}
          startPlace={startPlace}
          endPlace={endPlace}
          onStartPlaceChange={setStartPlace}
          onEndPlaceChange={setEndPlace}
          onFindRoute={findRoute}
          loading={loadingRoute}
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