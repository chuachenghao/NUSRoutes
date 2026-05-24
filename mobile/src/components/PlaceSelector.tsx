import { useMemo, useState } from "react";
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
};

export default function PlaceSelector({
  label,
  value,
  places,
  onChange,
}: PlaceSelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (query.length < 2) {
      return [];
    }

    return places
      .filter((place) => place.name.toLowerCase().includes(query))
      .slice(0, 6);
  }, [value, places]);

  function handleTextChange(text: string) {
    onChange(text);
    setShowSuggestions(true);
  }

  function handleSelectPlace(placeName: string) {
    onChange(placeName);
    setShowSuggestions(false);
  }

  return (
    <View style={styles.container}>
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

      {showSuggestions && suggestions.length > 0 ? (
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
    zIndex: 30,
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
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
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