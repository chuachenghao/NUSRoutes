import { StyleSheet, Text, View } from "react-native";

import type { RouteResponse } from "../types/route";

type RouteSummaryCardProps = {
  route: RouteResponse | null;
  message?: string;
};

function formatDistance(distanceM: number): string {
  if (!Number.isFinite(distanceM)) {
    return "Unknown distance";
  }

  if (distanceM >= 1000) {
    return `${(distanceM / 1000).toFixed(2)} km`;
  }

  return `${Math.round(distanceM)} m`;
}

function estimateWalkingMinutes(distanceM: number): number {
  return Math.max(1, Math.round(distanceM / 80));
}

export default function RouteSummaryCard({
  route,
  message,
}: RouteSummaryCardProps) {
  if (!route) {
    return (
      <View style={styles.card}>
        <View style={styles.handle} />
        <Text style={styles.title}>No route selected</Text>
        <Text style={styles.subtitle}>
          {message || "Enter a start and destination to find a route."}
        </Text>
      </View>
    );
  }

  const pathCount = route.path?.length ?? 0;
  const coordinateCount = route.coordinates?.length ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.handle} />

      <Text style={styles.title}>{formatDistance(route.distance_m)}</Text>

      <Text style={styles.subtitle}>
        Approx. {estimateWalkingMinutes(route.distance_m)} min walk
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>From</Text>
        <Text style={styles.value}>{route.start_place?.name ?? "Unknown"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>To</Text>
        <Text style={styles.value}>{route.end_place?.name ?? "Unknown"}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>Nodes: {pathCount}</Text>
        <Text style={styles.meta}>Points: {coordinateCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#dddddd",
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 14,
  },
  row: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: "#777777",
    fontWeight: "700",
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  meta: {
    fontSize: 12,
    color: "#777777",
  },
});