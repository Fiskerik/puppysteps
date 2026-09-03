import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppStoreProvider } from "../src/store/AppStore";
import "../src/i18n";

export default function RootLayout() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { dogId?: string } | undefined;
      if (data?.dogId) router.push({ pathname: "/(tabs)/log", params: { dogId: data.dogId } });
      else router.push("/(tabs)/log");
    });
    return () => subscription.remove();
  }, []);

  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><AppStoreProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack></AppStoreProvider></SafeAreaProvider></GestureHandlerRootView>;
}
