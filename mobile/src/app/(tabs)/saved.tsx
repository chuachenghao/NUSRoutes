import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import PlaceSelector from "../../components/PlaceSelector";
import { useProfile } from "../../context/ProfileContext";
import { usePlaces } from "../../hooks/usePlaces";

export default function SavedScreen() {
  const { savedPlaces, journeys, toggleSavedPlace, removeJourney, isSaved } = useProfile();
  const { places } = usePlaces();
  const router = useRouter();
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [placeName, setPlaceName] = useState("");

  const placeToAdd = places.find((place) => place.name === placeName);
  const canAddPlace = Boolean(placeToAdd && !isSaved(placeToAdd.id));

  function addPlace() {
    if (!placeToAdd || isSaved(placeToAdd.id)) return;

    toggleSavedPlace(placeToAdd);
    setPlaceName("");
    setShowAddPlace(false);
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Frequent journeys</Text>

      <FlatList
        data={journeys}
        keyExtractor={(j) => j.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No saved journeys yet.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            // tapping sends the names back to the route tab so it runs again
            onPress={() =>
              router.push({
                pathname: "/(tabs)",
                params: { start: item.startName, end: item.endName },
              })
            }
            onLongPress={() => removeJourney(item.id)}
          >
            <Text style={styles.rowTitle}>{item.label}</Text>
            <Text style={styles.rowMeta}>tap to route · hold to delete</Text>
          </Pressable>
        )}
      />

      <View style={styles.headingRow}>
        <Text style={styles.heading}>Saved places</Text>
        <Pressable
          accessibilityLabel="Add saved place"
          accessibilityRole="button"
          style={styles.addButton}
          onPress={() => setShowAddPlace(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {showAddPlace ? (
        <View style={styles.addPlacePanel}>
          <PlaceSelector
            label="Place"
            value={placeName}
            places={places}
            onChange={setPlaceName}
          />
          <Pressable
            style={[styles.addPlaceButton, !canAddPlace && styles.addPlaceButtonDisabled]}
            onPress={addPlace}
            disabled={!canAddPlace}
          >
            <Text style={styles.addPlaceButtonText}>Add place</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={savedPlaces}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No saved places yet.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onLongPress={() => toggleSavedPlace(item)}
          >
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowMeta}>{item.type ?? "place"} · hold to remove</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, paddingTop: 64, backgroundColor: "#ffffff" },
  heading: { fontSize: 18, fontWeight: "800", marginTop: 16, marginBottom: 8 },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#eef2ff",
  },
  addButtonText: {
    color: "#2563eb",
    fontSize: 24,
    fontWeight: "500",
    lineHeight: 28,
  },
  addPlacePanel: {
    marginBottom: 8,
  },
  addPlaceButton: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  addPlaceButtonDisabled: {
    opacity: 0.5,
  },
  addPlaceButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  empty: { color: "#888888", fontSize: 14 },
  row: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#f5f6fa",
    marginBottom: 8,
  },
  rowTitle: { fontSize: 15, fontWeight: "700" },
  rowMeta: { fontSize: 12, color: "#777777", marginTop: 2 },
});
