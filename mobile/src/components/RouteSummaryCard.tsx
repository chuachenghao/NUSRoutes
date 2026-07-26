import { Pressable, StyleSheet, Text, View } from "react-native";

import type { RouteResponse } from "../types/route";
import { useProfile } from "../context/ProfileContext";

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
  // grab the saving helpers from the profile context
  const { isSaved, toggleSavedPlace, addJourney } = useProfile();

  if (!route) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>No route selected</Text>
        <Text style={styles.subtitle}>
          {message || "Enter a start and destination to find a route."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{formatDistance(route.distance_m)}</Text>

      <Text style={styles.subtitle}>
        Approx. {estimateWalkingMinutes(route.distance_m)} min walk
      </Text>

      <Text style={styles.routeType}>
        {route.route_mode === "sheltered"
          ? `Shelter-preferred route (${route.sheltered_ratio}% sheltered)`
          : "Fastest walking route"}
      </Text>

      {route.weather_suggestion ? (
        <Text style={styles.weather}>{route.weather_suggestion.reason}</Text>
      ) : null}

      {/* closures make the route go around them, congestion is only a heads up */}
      {route.closure_ignored ? (
        <Text style={styles.closureNote}>
          No way around the closure, this route still goes through it.
        </Text>
      ) : null}

      {route.closures_nearby.map((closure) => (
        <Text key={`closure-${closure.id}`} style={styles.closureNote}>
          Routed around: {closure.title}
        </Text>
      ))}

      {route.congestion_nearby.map((item) => (
        <Text key={`congestion-${item.id}`} style={styles.congestionNote}>
          Heavy foot traffic near {item.title}
        </Text>
      ))}

      <View style={styles.row}>
        <Text style={styles.label}>From</Text>
        <Text style={styles.value}>{route.start_place?.name ?? "Unknown"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>To</Text>
        <Text style={styles.value}>{route.end_place?.name ?? "Unknown"}</Text>
      </View>

      {/* save buttons - one for the place, one for the whole journey */}
      <View style={styles.saveRow}>
        <Pressable
          style={styles.saveBtn}
          onPress={() =>
            toggleSavedPlace({
              id: String(route.end_place.id),
              name: route.end_place.name,
            })
          }
        >
          <Text style={styles.saveBtnText}>
            {isSaved(String(route.end_place.id)) ? "★ Saved" : "☆ Save place"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.saveBtn}
          onPress={() =>
            addJourney(route.start_place.name, route.end_place.name)
          }
        >
          <Text style={styles.saveBtnText}>+ Save journey</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    paddingTop: 28,
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
  routeType: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "700",
    marginTop: -6,
    marginBottom: 10,
  },
  weather: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
  },
  closureNote: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "700",
    marginBottom: 4,
  },
  congestionNote: {
    fontSize: 13,
    color: "#7c3aed",
    fontWeight: "700",
    marginBottom: 4,
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
  saveRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
  },
  saveBtnText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 13,
  },
});
