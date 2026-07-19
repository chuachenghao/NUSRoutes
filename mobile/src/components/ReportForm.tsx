import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { ReportType } from "../types/report";

// the 5 things a user can report, with a label + emoji for the chips
const TYPES: { value: ReportType; label: string; emoji: string }[] = [
  { value: "obstruction", label: "Obstruction", emoji: "🚧" },
  { value: "closure", label: "Closure", emoji: "⛔" },
  { value: "crowded", label: "Crowded", emoji: "👥" },
  { value: "hazard", label: "Hazard", emoji: "⚠️" },
  { value: "other", label: "Other", emoji: "📌" },
];

type ReportFormProps = {
  coords: { latitude: number; longitude: number } | null;
  onSubmit: (input: {
    type: ReportType;
    description: string;
    latitude: number;
    longitude: number;
  }) => void;
  onClose: () => void;
};

export default function ReportForm({ coords, onSubmit, onClose }: ReportFormProps) {
  const [type, setType] = useState<ReportType>("obstruction");
  const [description, setDescription] = useState("");

  function handleSubmit() {
    if (!coords) return;
    onSubmit({
      type,
      description: description.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    // reset for next time
    setType("obstruction");
    setDescription("");
  }

  return (
    <Modal
      visible={coords !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>New report</Text>
          <Text style={styles.subtitle}>Let others know what's happening here</Text>

          <View style={styles.chips}>
            {TYPES.map((t) => (
              <Pressable
                key={t.value}
                style={[styles.chip, type === t.value && styles.chipActive]}
                onPress={() => setType(t.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    type === t.value && styles.chipTextActive,
                  ]}
                >
                  {t.emoji} {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Add a short description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit report</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    padding: 20,
    paddingBottom: 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
    marginBottom: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  chipActive: {
    backgroundColor: "#2563eb",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  input: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "700",
    color: "#334155",
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  submitText: {
    fontWeight: "800",
    color: "#ffffff",
  },
});
