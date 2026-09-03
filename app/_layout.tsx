import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppStoreProvider, useAppStore } from "../src/store/AppStore";
import "../src/i18n";

function NotificationRouter() {
  const { logCheckIn, setSelectedDogId } = useAppStore();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { dogId?: string } | undefined;
      const action = response.actionIdentifier;
      if (data?.dogId) setSelectedDogId(data.dogId);
      if (action === "pee_outside" || action === "poo_outside" || action === "accident" || action === "nothing") {
        logCheckIn({ ...(data?.dogId ? { dogId: data.dogId } : {}), pee: action === "pee_outside" ? "outside" : action === "accident" ? "inside" : null, poo: action === "poo_outside" ? "outside" : null, nothing: action === "nothing", source: "notification" });
        return;
      }
      if (data?.dogId) router.push({ pathname: "/(tabs)/log", params: { dogId: data.dogId } });
      else router.push("/(tabs)/log");
    });
    return () => subscription.remove();
  }, [logCheckIn, setSelectedDogId]);
  return null;
}

export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><AppStoreProvider><NotificationRouter /><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack></AppStoreProvider></SafeAreaProvider></GestureHandlerRootView>;
}
