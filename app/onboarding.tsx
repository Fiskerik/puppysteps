import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../src/store/AppStore";
import { Avatar, Button, Card, Field, Screen } from "../src/ui/Primitives";
import { colors, spacing, typography } from "../src/ui/theme";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { addDog } = useAppStore();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const finish = () => { const parsedBirthDate = birthDate ? new Date(birthDate) : null; const safeBirthDate = parsedBirthDate && !Number.isNaN(parsedBirthDate.getTime()) ? parsedBirthDate.toISOString() : null; const added = addDog({ name, breed: breed || null, birthDate: safeBirthDate, avatar: "🐶" }); if (added) router.replace("/(tabs)"); };
  return <Screen scroll={false} style={styles.screen}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}><View style={styles.hero}><Avatar emoji="🐶" size={82} /><Text style={styles.eyebrow}>PUPPYSTEPS</Text><Text style={styles.title}>{t("onboarding.title")}</Text><Text style={styles.body}>{t("onboarding.body")}</Text></View><Card style={styles.form}><Field label={t("dog.name")} value={name} onChangeText={setName} placeholder="Milo" autoFocus /><Field label={t("dog.breed")} value={breed} onChangeText={setBreed} placeholder={t("dog.unknown")} /><Field label={t("dog.birth")} value={birthDate} onChangeText={setBirthDate} placeholder="2026-01-15" autoCapitalize="none" /><Button onPress={finish} disabled={!name.trim()}>{t("onboarding.start")}</Button><Text style={styles.privacy}>{t("profile.localBody")}</Text></Card></KeyboardAvoidingView></Screen>;
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center" },
  keyboard: { flex: 1, justifyContent: "center", gap: spacing.xl },
  hero: { alignItems: "center", gap: spacing.sm },
  eyebrow: { ...typography.small, color: colors.primary, letterSpacing: 2, marginTop: spacing.sm },
  title: { ...typography.display, color: colors.text, textAlign: "center" },
  body: { ...typography.body, color: colors.muted, textAlign: "center", maxWidth: 320 },
  form: { gap: spacing.md },
  privacy: { ...typography.small, color: colors.muted, textAlign: "center" },
});
