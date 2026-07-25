import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Route",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "point.topleft.down.to.point.bottomright.curvepath",
                android: "alt_route",
                web: "alt_route",
              }}
              size={26}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "bookmark.fill", android: "bookmark", web: "bookmark" }}
              size={26}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "person.crop.circle.fill",
                android: "account_circle",
                web: "account_circle",
              }}
              size={26}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "chart.bar.fill",
                android: "bar_chart",
                web: "bar_chart",
              }}
              size={26}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
