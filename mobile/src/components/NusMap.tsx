import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { NUS_REGION } from "../constants/map";
import type { RouteResponse } from "../types/route";

type NusMapProps = {
  route: RouteResponse | null;
};

export default function NusMap({ route }: NusMapProps) {
  const mapRef = useRef<MapView | null>(null);

  const routeCoordinates = useMemo(() => {
    return (
      route?.coordinates
        ?.map((coordinate) => ({
          latitude: Number(coordinate.latitude ?? coordinate.lat),
          longitude: Number(coordinate.longitude ?? coordinate.lon),
        }))
        .filter(
          (coordinate) =>
            Number.isFinite(coordinate.latitude) &&
            Number.isFinite(coordinate.longitude)
        ) ?? []
    );
  }, [route]);

  const startCoordinate = routeCoordinates[0];
  const endCoordinate = routeCoordinates[routeCoordinates.length - 1];

  useEffect(() => {
    if (routeCoordinates.length > 1) {
      mapRef.current?.fitToCoordinates(routeCoordinates, {
        edgePadding: {
          top: 260,
          right: 100,
          bottom: 300,
          left: 100,
        },
        animated: true,
      });
    }
  }, [routeCoordinates]);

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={NUS_REGION}>
        {routeCoordinates.length > 1 ? (
          <Polyline coordinates={routeCoordinates} strokeWidth={5} />
        ) : null}

        {startCoordinate ? (
          <Marker
            coordinate={startCoordinate}
            title={route?.start_place?.name ?? "Start"}
          />
        ) : null}

        {endCoordinate ? (
          <Marker
            coordinate={endCoordinate}
            title={route?.end_place?.name ?? "Destination"}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eeeeee",
  },
  map: {
    flex: 1,
  },
});