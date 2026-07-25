import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
import type { AdminAnalytics } from "../../types/admin";

const emptyAnalytics: AdminAnalytics = {
  summary: {
    total_route_searches: 0,
    recent_route_searches: 0,
    avg_distance_m: 0,
    avg_sheltered_ratio: 0,
    fastest_searches: 0,
    sheltered_searches: 0,
    busiest_hour: {
      label: "-",
      searches: 0,
    },
  },
  top_destinations: [],
  route_pairs: [],
  peak_usage_times: [],
  heat_points: [],
};

function formatNumber(value: number) {
  return Math.round(value).toString();
}

function formatDistance(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} km`;
  }

  return `${Math.round(value)} m`;
}

export default function AdminScreen() {
  const { analytics } = useAdminAnalytics();

  const data = analytics ?? emptyAnalytics;
  const summary = data.summary;
  const busyHours = data.peak_usage_times.filter((item) => item.searches > 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Basic analytics for NUSRoutes</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.row}>
          Route searches: {formatNumber(summary.total_route_searches)}
        </Text>
        <Text style={styles.row}>
          Searches in last 7 days: {formatNumber(summary.recent_route_searches)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Route Analytics</Text>
        <Text style={styles.row}>
          Average distance: {formatDistance(summary.avg_distance_m)}
        </Text>
        <Text style={styles.row}>
          Average sheltered ratio: {formatNumber(summary.avg_sheltered_ratio)}%
        </Text>
        <Text style={styles.row}>
          Fastest searches: {formatNumber(summary.fastest_searches)}
        </Text>
        <Text style={styles.row}>
          Sheltered searches: {formatNumber(summary.sheltered_searches)}
        </Text>
        <Text style={styles.row}>
          Busiest hour: {summary.busiest_hour.label}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Peak Usage Times</Text>
        {busyHours.map((item) => (
          <Text key={item.hour} style={styles.row}>
            {item.label}: {formatNumber(item.searches)} searches
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Route Pairs</Text>
        {data.route_pairs.map((pair, index) => (
          <View key={`${pair.start_name}-${pair.end_name}-${index}`} style={styles.listItem}>
            <Text style={styles.itemTitle}>
              {pair.start_name} to {pair.end_name}
            </Text>
            <Text style={styles.itemText}>
              {formatNumber(pair.searches)} searches, average {formatDistance(pair.avg_distance_m)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Destinations</Text>
        {data.top_destinations.map((place) => (
          <Text key={place.place_id ?? place.name} style={styles.row}>
            {place.name}: {formatNumber(place.searches)} searches
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heat Insight</Text>
        {data.heat_points.map((point) => (
          <View key={point.place_id ?? point.name} style={styles.heatItem}>
            <Text style={styles.itemTitle}>{point.name}</Text>
            <Text style={styles.itemText}>{formatNumber(point.searches)} total route hits</Text>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${point.intensity * 100}%` }]} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 16,
    paddingTop: 64,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
  },
  section: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  row: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 6,
  },
  listItem: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222222",
  },
  itemText: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  heatItem: {
    marginBottom: 12,
  },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dddddd",
    marginTop: 6,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
  },
});
