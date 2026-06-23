import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useProfile } from "../../context/ProfileContext";

export default function SavedScreen() {
  const { savedPlaces, journeys, toggleSavedPlace, removeJourney } = useProfile();
  const router = useRouter();

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

      <Text style={styles.heading}>Saved places</Text>

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
