import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import PlaceSelector from "../../components/PlaceSelector";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";
import { usePlaces } from "../../hooks/usePlaces";
import type { AdminAnalytics } from "../../types/admin";
import type { AnnouncementType } from "../../types/announcement";

// not real security, it ships inside the app. just stops random people posting
const ADMIN_PASSCODE = "NUSRoutes123";

// only closures change the routing, the rest are just shown on the map
const ANNOUNCEMENT_TYPES: { value: AnnouncementType; label: string }[] = [
  { value: "closure", label: "Closure" },
  { value: "congestion", label: "Congestion" },
  { value: "disruption", label: "Disruption" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
];

const EXPIRY_CHOICES: { label: string; hours: number | null }[] = [
  { label: "2 hours", hours: 2 },
  { label: "6 hours", hours: 6 },
  { label: "24 hours", hours: 24 },
  { label: "No expiry", hours: null },
];

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
  const { places } = usePlaces();
  const { announcements, addAnnouncement, removeAnnouncement } = useAnnouncements();
  const { requestLocation, loadingLocation } = useCurrentLocation();

  // passcode gate
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // the new announcement form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AnnouncementType>("closure");
  const [placeName, setPlaceName] = useState("");
  const [expiryHours, setExpiryHours] = useState<number | null>(24);
  const [myCoords, setMyCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [formMessage, setFormMessage] = useState("");
  const [posting, setPosting] = useState(false);

  // location comes from my own position if i used that button, otherwise the picked place
  const selectedPlace = places.find((place) => place.name === placeName);
  const placeCoords =
    selectedPlace &&
    Number.isFinite(Number(selectedPlace.latitude)) &&
    Number.isFinite(Number(selectedPlace.longitude))
      ? {
          latitude: Number(selectedPlace.latitude),
          longitude: Number(selectedPlace.longitude),
        }
      : null;
  const coords = myCoords ?? placeCoords;

  function checkPasscode() {
    if (passcode === ADMIN_PASSCODE) {
      setUnlocked(true);
      setPasscode("");
      setPasscodeError("");
    } else {
      setPasscodeError("Wrong passcode.");
    }
  }

  async function useMyLocation() {
    const here = await requestLocation();

    if (!here) {
      setFormMessage("Could not get your location.");
      return;
    }

    setMyCoords(here);
    setPlaceName("");
    setFormMessage("Using your current location.");
  }

  async function postAnnouncement() {
    if (!title.trim()) {
      setFormMessage("Give it a title first.");
      return;
    }

    if (!coords) {
      setFormMessage("Pick a place or use your location.");
      return;
    }

    setPosting(true);

    const expiresAt =
      expiryHours === null
        ? null
        : new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

    const ok = await addAnnouncement({
      title: title.trim(),
      description: description.trim(),
      type,
      latitude: coords.latitude,
      longitude: coords.longitude,
      expires_at: expiresAt,
    });

    setPosting(false);

    if (!ok) {
      setFormMessage("Could not post it, check the backend is running.");
      return;
    }

    // clear the form for the next one
    setTitle("");
    setDescription("");
    setPlaceName("");
    setMyCoords(null);
    setFormMessage("Posted.");
  }

  if (!unlocked) {
    return (
      <View style={styles.lockScreen}>
        <Text style={styles.title}>Admin</Text>
        <Text style={styles.subtitle}>Enter the admin passcode to continue.</Text>

        <TextInput
          style={styles.input}
          value={passcode}
          onChangeText={setPasscode}
          placeholder="Passcode"
          secureTextEntry
          autoCapitalize="none"
        />

        {passcodeError ? <Text style={styles.errorText}>{passcodeError}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={checkPasscode}>
          <Text style={styles.primaryButtonText}>Unlock</Text>
        </Pressable>
      </View>
    );
  }

  const data = analytics ?? emptyAnalytics;
  const summary = data.summary;
  const busyHours = data.peak_usage_times.filter((item) => item.searches > 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Basic analytics for NUSRoutes</Text>

      <View style={[styles.section, styles.formSection]}>
        <Text style={styles.sectionTitle}>Post Announcement</Text>
        <Text style={styles.hint}>
          Closures make routes go around them. The other types only show on the map.
        </Text>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title (e.g. COM1 walkway closed)"
        />

        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          multiline
        />

        <Text style={styles.fieldLabel}>Type</Text>
        <View style={styles.chipRow}>
          {ANNOUNCEMENT_TYPES.map((item) => (
            <Pressable
              key={item.value}
              style={[styles.chip, type === item.value && styles.chipActive]}
              onPress={() => setType(item.value)}
            >
              <Text style={[styles.chipText, type === item.value && styles.chipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Where</Text>
        <PlaceSelector
          label="Place"
          value={placeName}
          places={places}
          onChange={(value) => {
            setPlaceName(value);
            setMyCoords(null);
          }}
        />

        <Pressable style={styles.secondaryButton} onPress={useMyLocation}>
          <Text style={styles.secondaryButtonText}>
            {loadingLocation ? "Getting location..." : "Use my location"}
          </Text>
        </Pressable>

        <Text style={styles.fieldLabel}>Expires in</Text>
        <View style={styles.chipRow}>
          {EXPIRY_CHOICES.map((choice) => (
            <Pressable
              key={choice.label}
              style={[styles.chip, expiryHours === choice.hours && styles.chipActive]}
              onPress={() => setExpiryHours(choice.hours)}
            >
              <Text
                style={[
                  styles.chipText,
                  expiryHours === choice.hours && styles.chipTextActive,
                ]}
              >
                {choice.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {formMessage ? <Text style={styles.hint}>{formMessage}</Text> : null}

        <Pressable
          style={[styles.primaryButton, posting && styles.buttonDisabled]}
          onPress={postAnnouncement}
          disabled={posting}
        >
          <Text style={styles.primaryButtonText}>
            {posting ? "Posting..." : "Post announcement"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Announcements</Text>

        {announcements.length === 0 ? (
          <Text style={styles.itemText}>Nothing active right now.</Text>
        ) : null}

        {announcements.map((announcement) => (
          <View key={announcement.id} style={styles.announcementRow}>
            <View style={styles.announcementInfo}>
              <Text style={styles.itemTitle}>{announcement.title}</Text>
              <Text style={styles.itemText}>
                {announcement.type}
                {announcement.expires_at
                  ? ` · until ${new Date(announcement.expires_at).toLocaleString()}`
                  : " · no expiry"}
              </Text>
            </View>

            <Pressable
              style={styles.deleteButton}
              onPress={() => removeAnnouncement(announcement.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        ))}
      </View>

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
  lockScreen: {
    flex: 1,
    padding: 16,
    paddingTop: 64,
    backgroundColor: "#ffffff",
  },
  formSection: {
    zIndex: 50,
  },
  hint: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666666",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    fontSize: 15,
  },
  inputMultiline: {
    height: 70,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
  },
  chipActive: {
    backgroundColor: "#2563eb",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  primaryButton: {
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryButton: {
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  announcementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  announcementInfo: {
    flex: 1,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
  },
  deleteButtonText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 13,
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
