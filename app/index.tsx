import React from "react";
import { Redirect } from "expo-router";
import { useAppStore } from "../src/store/AppStore";

export default function EntryScreen() {
  const { snapshot } = useAppStore();
  return <Redirect href={snapshot.dogs.length ? "/(tabs)" : "/onboarding"} />;
}
