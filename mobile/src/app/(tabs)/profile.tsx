import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { useProfile } from "../../context/ProfileContext";
import { buildExportCsv } from "../../utils/csv";

export default function ProfileScreen() {
  const { profile, createProfile, signOut, savedPlaces, journeys } = useProfile();
  const [name, setName] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  // write the csv into the app folder then open the normal share sheet
  async function exportData() {
    try {
      const csv = buildExportCsv(profile, savedPlaces, journeys);
      const file = new File(Paths.cache, "nusroutes-export.csv");

      // delete the old one first, otherwise create() complains it already exists
      if (file.exists) {
        file.delete();
      }

      file.create();
      file.write(csv);

      if (!(await Sharing.isAvailableAsync())) {
        setExportMessage("Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Export NUSRoutes data",
      });

      setExportMessage("");
    } catch {
      setExportMessage("Could not export your data.");
    }
  }

  // no profile yet -> show the create form
  if (!profile) {
    return (
      <View style={styles.screen}>
        <Text style={styles.heading}>Create a local profile</Text>

        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Pressable style={styles.btn} onPress={() => createProfile(name)}>
          <Text style={styles.btnText}>Create profile</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Hi, {profile.name}</Text>

      <Text style={styles.meta}>
        {savedPlaces.length} saved places · {journeys.length} journeys
      </Text>

      <Pressable style={[styles.btn, styles.export]} onPress={exportData}>
        <Text style={styles.btnText}>Export my data (CSV)</Text>
      </Pressable>

      {exportMessage ? <Text style={styles.exportNote}>{exportMessage}</Text> : null}

      <Pressable style={[styles.btn, styles.signout]} onPress={signOut}>
        <Text style={styles.btnText}>Sign out & clear data</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, paddingTop: 64, backgroundColor: "#ffffff" },
  heading: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  meta: { fontSize: 14, color: "#666666", marginBottom: 20 },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  btn: {
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  export: { backgroundColor: "#2563eb", marginBottom: 12 },
  exportNote: { fontSize: 13, color: "#dc2626", marginBottom: 12 },
  signout: { backgroundColor: "#ef4444" },
  btnText: { color: "#ffffff", fontWeight: "800", fontSize: 16 },
});
