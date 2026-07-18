import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type PlaceOption = {
  id: string;
  name: string;
  type?: string | null;
  category?: string | null;
};

type PlaceSelectorProps = {
  label: string;
  value: string;
  places: PlaceOption[];
  onChange: (value: string) => void;
  onSuggestionsChange?: (showing: boolean) => void;
};

export default function PlaceSelector({
  label,
  value,
  places,
  onChange,
  onSuggestionsChange,
}: PlaceSelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return places
      .filter((place) => place.name.toLowerCase().includes(query))
      .slice(0, 6);
  }, [value, places]);

  const dropdownOpen = showSuggestions && suggestions.length > 0;

  useEffect(() => {
    onSuggestionsChange?.(dropdownOpen);
  }, [dropdownOpen, onSuggestionsChange]);

  function handleTextChange(text: string) {
    onChange(text);
    setShowSuggestions(true);
  }

  function handleSelectPlace(placeName: string) {
    onChange(placeName);
    setShowSuggestions(false);
  }

  return (
    <View style={[styles.container, showSuggestions && styles.containerOpen]}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleTextChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder={`Type ${label.toLowerCase()}`}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {dropdownOpen ? (
        <View style={styles.dropdown}>
          {suggestions.map((place) => (
            <Pressable
              key={place.id}
              style={styles.suggestion}
              onPress={() => handleSelectPlace(place.name)}
            >
              <Text style={styles.suggestionText}>{place.name}</Text>

              {place.type || place.category ? (
                <Text style={styles.suggestionMeta}>
                  {[place.type, place.category].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    position: "relative",
  },
  containerOpen: {
    zIndex: 100,
    elevation: 100,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666666",
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    fontSize: 15,
  },
  dropdown: {
    position: "absolute",
    top: 62,
    left: 0,
    right: 0,
    zIndex: 100,
    minHeight: 190,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    elevation: 10,
  },
  suggestion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  suggestionMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#777777",
  },
});
