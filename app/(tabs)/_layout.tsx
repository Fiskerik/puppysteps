import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/ui/theme";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = { index: "sunny-outline", log: "checkbox-outline", learn: "play-circle-outline", journey: "footsteps-outline", profile: "person-circle-outline" };

export default function TabsLayout() {
  const { t } = useTranslation();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontSize: 11, fontWeight: "700" }, tabBarStyle: { height: 78, paddingTop: 8, paddingBottom: 12, borderTopColor: colors.border, backgroundColor: colors.surface }, tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name] ?? "ellipse-outline"} size={size} color={color} /> })}>
    <Tabs.Screen name="index" options={{ title: t("nav.today") }} />
    <Tabs.Screen name="log" options={{ title: t("nav.log") }} />
    <Tabs.Screen name="learn" options={{ title: t("nav.learn") }} />
    <Tabs.Screen name="journey" options={{ title: t("nav.journey") }} />
    <Tabs.Screen name="profile" options={{ title: t("nav.profile") }} />
  </Tabs>;
}
