import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../src/store/AppStore";
import { Avatar, Button, Card, DatePickerField, Field, Screen } from "../src/ui/Primitives";
import { colors, spacing, typography } from "../src/ui/theme";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { addDog } = useAppStore();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const finish = () => { const added = addDog({ name, breed: breed || null, birthDate: birthDate || null, avatar: "🐶" }); if (added) router.replace("/(tabs)"); else Alert.alert(t("dog.saveError")); };
  return <Screen scroll={false} style={styles.screen}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboard}><ScrollView contentContainerStyle={styles.keyboardContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}><View style={styles.hero}><Avatar emoji="🐶" size={82} /><Text style={styles.eyebrow}>PUPPYSTEPS</Text><Text style={styles.title}>{t("onboarding.title")}</Text><Text style={styles.body}>{t("onboarding.body")}</Text></View><Card style={styles.form}><Field label={t("dog.name")} value={name} onChangeText={setName} placeholder="Milo" autoFocus /><Field label={t("dog.breed")} value={breed} onChangeText={setBreed} placeholder={t("dog.unknown")} /><DatePickerField label={t("dog.birth")} value={birthDate || null} onChange={setBirthDate} locale="en-GB" placeholder={t("dog.birthPlaceholder")} doneLabel={t("common.done")} maximumDate={new Date()} /><Button onPress={finish} disabled={!name.trim()}>{t("onboarding.start")}</Button><Text style={styles.privacy}>{t("profile.localBody")}</Text></Card></ScrollView></KeyboardAvoidingView></Screen>;
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center" },
  keyboard: { flex: 1, width: "100%" },
  keyboardContent: { flexGrow: 1, justifyContent: "center", gap: spacing.xl },
  hero: { alignItems: "center", gap: spacing.sm },
  eyebrow: { ...typography.small, color: colors.primary, letterSpacing: 2, marginTop: spacing.sm },
  title: { ...typography.display, color: colors.text, textAlign: "center" },
  body: { ...typography.body, color: colors.muted, textAlign: "center", maxWidth: 320 },
  form: { gap: spacing.md },
  privacy: { ...typography.small, color: colors.muted, textAlign: "center" },
});
