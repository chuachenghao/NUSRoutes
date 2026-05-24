import { Pressable, StyleSheet, Text, View } from "react-native";

import PlaceSelector from "./PlaceSelector";

type PlaceOption = {
  id: string;
  name: string;
  type?: string | null;
  category?: string | null;
};

type RouteSearchPanelProps = {
  places: PlaceOption[];

  startPlace: string;
  endPlace: string;

  onStartPlaceChange: (value: string) => void;
  onEndPlaceChange: (value: string) => void;

  onFindRoute: () => void;
  loading: boolean;
};

export default function RouteSearchPanel({
  places,
  startPlace,
  endPlace,
  onStartPlaceChange,
  onEndPlaceChange,
  onFindRoute,
  loading,
}: RouteSearchPanelProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Where to?</Text>

      <PlaceSelector
        label="Start"
        value={startPlace}
        places={places}
        onChange={onStartPlaceChange}
      />

      <PlaceSelector
        label="Destination"
        value={endPlace}
        places={places}
        onChange={onEndPlaceChange}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onFindRoute}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Finding route..." : "Find Route"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  button: {
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});