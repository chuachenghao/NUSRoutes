import { Stack } from "expo-router";
import { ProfileProvider } from "../context/ProfileContext";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ProfileProvider>
  );
}