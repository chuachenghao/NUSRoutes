import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { NUS_REGION } from "../constants/map";
import type { Announcement } from "../types/announcement";
import type { RouteResponse } from "../types/route";

const ANNOUNCEMENT_PIN_COLORS: Record<Announcement["type"], string> = {
  closure: "red",
  disruption: "orange",
  warning: "yellow",
  info: "blue",
};

type NusMapProps = {
  route: RouteResponse | null;
  announcements: Announcement[];
  userCoords?: { latitude: number; longitude: number}|null; //added
};

export default function NusMap({ route, announcements, userCoords }: NusMapProps) {
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
  //Adding useEffect which adds recentering on the user feature
  useEffect(() => {
    if (userCoords) {
      mapRef.current?.animateToRegion(
        { ...userCoords, latitudeDelta: 0.006, longitudeDelta: 0.006 },
        500
      );
    }
  }, [userCoords]);

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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={NUS_REGION}
        showsUserLocation
        showsMyLocationButton
      >
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

        {announcements.map((announcement) => (
          <Marker
            key={announcement.id}
            coordinate={{
              latitude: announcement.latitude,
              longitude: announcement.longitude,
            }}
            title={announcement.title}
            description={announcement.description ?? undefined}
            pinColor={ANNOUNCEMENT_PIN_COLORS[announcement.type]}
          />
        ))}
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