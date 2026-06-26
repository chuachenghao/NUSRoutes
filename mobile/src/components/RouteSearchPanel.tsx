import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import PlaceSelector from "./PlaceSelector";
import type { RouteMode } from "../types/route";

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
  routeMode: RouteMode;
  onRouteModeChange: (mode: RouteMode) => void;
  loading: boolean;
  onUseMyLocation: () => void;
  locating: boolean;
};

export default function RouteSearchPanel({
  places,
  startPlace,
  endPlace,
  onStartPlaceChange,
  onEndPlaceChange,
  onFindRoute,
  routeMode,
  onRouteModeChange,
  loading,
  onUseMyLocation,
  locating,
}: RouteSearchPanelProps) {
  const [startSuggestionsOpen, setStartSuggestionsOpen] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Where to?</Text>
      <Pressable
        style={styles.locationBtn}
        onPress={onUseMyLocation}
        disabled={locating}
      >
        <Text style={styles.locationBtnText}>
          {locating ? "Locating..." : "Use my location as start"}
        </Text>
      </Pressable>

      <PlaceSelector
        label="Start"
        value={startPlace}
        places={places}
        onChange={onStartPlaceChange}
        onSuggestionsChange={setStartSuggestionsOpen}
      />

      <View
        style={startSuggestionsOpen && styles.hiddenInput}
        pointerEvents={startSuggestionsOpen ? "none" : "auto"}
      >
        <PlaceSelector
          label="Destination"
          value={endPlace}
          places={places}
          onChange={onEndPlaceChange}
        />
      </View>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, routeMode === "fastest" && styles.modeButtonSelected]}
          onPress={() => onRouteModeChange("fastest")}
          disabled={loading}
        >
          <Text style={[styles.modeButtonText, routeMode === "fastest" && styles.modeButtonTextSelected]}>
            Fastest
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, routeMode === "sheltered" && styles.modeButtonSelected]}
          onPress={() => onRouteModeChange("sheltered")}
          disabled={loading}
        >
          <Text style={[styles.modeButtonText, routeMode === "sheltered" && styles.modeButtonTextSelected]}>
            Sheltered
          </Text>
        </Pressable>
      </View>

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
  hiddenInput: {
    opacity: 0,
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
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  modeButtonSelected: {
    backgroundColor: "#2563eb",
  },
  modeButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
  modeButtonTextSelected: {
    color: "#ffffff",
  },
  locationBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
    marginBottom: 10,
  },
  locationBtnText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 13,
  },
});
