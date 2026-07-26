import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { NUS_REGION } from "../constants/map";
import type { Announcement } from "../types/announcement";
import type { Report } from "../types/report";
import type { RouteResponse } from "../types/route";
import type { RouteMode } from "../types/route";

const ANNOUNCEMENT_PIN_COLORS: Record<Announcement["type"], string> = {
  closure: "red",
  disruption: "orange",
  congestion: "purple",
  warning: "yellow",
  info: "blue",
};

type LatLng = { latitude: number; longitude: number };

type NusMapProps = {
  route: RouteResponse | null;
  announcements: Announcement[];
  reports: Report[];
  onReportPress: (report: Report) => void;
  onLongPress: (coords: LatLng) => void;
  userCoords?: LatLng | null;
  routeMode: RouteMode;
};

export default function NusMap({
  route,
  announcements,
  reports,
  onReportPress,
  onLongPress,
  userCoords,
  routeMode,
}: NusMapProps) {
  const mapRef = useRef<MapView | null>(null);

  const routeCoordinates = useMemo(() => {
    return (
      route?.coordinates
        ?.map((coordinate) => ({
          latitude: Number(coordinate.latitude),
          longitude: Number(coordinate.longitude),
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
  const routeSegments = route?.route_segments ?? [];

  useEffect(() => {
    if (routeCoordinates.length > 1) {
      mapRef.current?.fitToCoordinates(routeCoordinates, {
        edgePadding: {
          top: route ? 110 : 260,
          right: 100,
          bottom: route ? 350 : 300,
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
        onLongPress={(e) => onLongPress(e.nativeEvent.coordinate)}
      >
        {routeSegments.map((segment, index) =>
          segment.is_sheltered ? (
            <Polyline
              key={`shelter-outline-${index}`}
              coordinates={segment.coordinates}
              strokeColor="#1f2937"
              strokeWidth={8}
            />
          ) : null
        )}

        {routeSegments.map((segment, index) => (
          <Polyline
            key={`route-section-${index}`}
            coordinates={segment.coordinates}
            strokeColor={segment.is_sheltered ? "#ffffff" : "#2563eb"}
            strokeWidth={5}
          />
        ))}

        {routeCoordinates.length > 1 && routeSegments.length === 0 && routeMode === "sheltered" ? (
          <>
            <Polyline coordinates={routeCoordinates} strokeColor="#1f2937" strokeWidth={8} />
            <Polyline coordinates={routeCoordinates} strokeColor="#ffffff" strokeWidth={5} />
          </>
        ) : null}

        {routeCoordinates.length > 1 && routeSegments.length === 0 && routeMode === "fastest" ? (
          <Polyline coordinates={routeCoordinates} strokeColor="#2563eb" strokeWidth={5} />
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

        {/* community reports - show a warning triangle instead of a pin */}
        {reports.map((report) => (
          <Marker
            key={`report-${report.id}`}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => onReportPress(report)}
            tracksViewChanges={false}
          >
            <Text style={styles.reportIcon}>⚠️</Text>
          </Marker>
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
  reportIcon: {
    fontSize: 28,
  },
});
