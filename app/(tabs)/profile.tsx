import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import type { Locale } from "../../src/domain/models";
import { supported } from "../../src/i18n";
import { useAppStore } from "../../src/store/AppStore";
import { Avatar, Button, Card, DatePickerField, Field, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { colors, spacing, typography } from "../../src/ui/theme";

const languageNames: Record<Locale, string> = { "sv-SE": "Svenska", "en-GB": "English", "fr-FR": "Français", "de-DE": "Deutsch", "da-DK": "Dansk", "fi-FI": "Suomi", "nb-NO": "Norsk" };

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { snapshot, selectedDogId, setSelectedDogId, addDog, updateSettings, enableReminders, toggleResponsible, exportData, deleteLocalData } = useAppStore();
  const [addVisible, setAddVisible] = useState(false);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const saveDog = () => { const added = addDog({ name, breed: breed || null, birthDate: birthDate || null, avatar: "🐶" }); if (added) { setName(""); setBreed(""); setBirthDate(""); setAddVisible(false); } else Alert.alert(snapshot.dogs.length >= 2 ? t("dog.limit") : t("dog.saveError")); };
  const exportFile = async (format: "csv" | "json") => {
    try {
      const directory = FileSystem.cacheDirectory;
      if (!directory) throw new Error("No cache directory available");
      const path = `${directory}puppysteps-export.${format}`;
      await FileSystem.writeAsStringAsync(path, exportData(format), { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path, { mimeType: format === "csv" ? "text/csv" : "application/json", dialogTitle: t("profile.export") });
      else Alert.alert(`${t("profile.export")}: ${path}`);
    } catch (error) {
      console.warn("Could not export local data", error);
      Alert.alert(t("profile.exportError"));
    }
  };
  const toggleReminders = async () => {
    if (snapshot.settings.remindersEnabled) {
      updateSettings({ remindersEnabled: false });
      return;
    }
    if (!(await enableReminders())) Alert.alert(t("notifications.disabled"));
  };
  const confirmDelete = () => Alert.alert(t("profile.delete"), t("profile.deleteConfirm"), [{ text: t("common.cancel"), style: "cancel" }, { text: t("profile.deleteAction"), style: "destructive", onPress: () => void deleteLocalData() }]);
  return <Screen><View style={styles.header}><Text style={styles.eyebrow}>{t("nav.profile")}</Text><Text style={styles.title}>{t("profile.title")}</Text><Text style={styles.subtitle}>{t("profile.localBody")}</Text></View><SectionTitle title={t("profile.dogs")} action={snapshot.dogs.length < 2 ? `＋ ${t("common.add")}` : undefined} onAction={() => setAddVisible(true)} />{snapshot.dogs.length ? <Card>{snapshot.dogs.map((dog) => <View key={dog.id} style={styles.dogRow}><Avatar emoji={dog.avatar} size={44} /><View style={styles.dogCopy}><Text style={styles.dogName}>{dog.name}</Text><Text style={styles.dogMeta}>{dog.breed ?? t("dog.unknown")}</Text></View><Pill active={dog.id === selectedDogId} onPress={() => setSelectedDogId(dog.id)}>{dog.id === selectedDogId ? "✓" : t("common.select")}</Pill></View>)}</Card> : <Card tone="moss"><Text style={styles.cardTitle}>{t("profile.addFirstDog")}</Text><Button onPress={() => setAddVisible(true)}>{t("profile.addDog")}</Button></Card>}
    <SectionTitle title={t("profile.reminders")} /><Card style={styles.settingsCard}><View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.cardTitle}>{snapshot.settings.remindersEnabled ? t("profile.notificationOn") : t("profile.notificationOff")}</Text><Text style={styles.cardBody}>{snapshot.settings.remindersEnabled ? t("today.reason") : t("notifications.body")}</Text></View><Pill active={snapshot.settings.remindersEnabled} onPress={() => void toggleReminders()}>{snapshot.settings.remindersEnabled ? t("common.on") : t("common.off")}</Pill></View><View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.cardTitle}>{snapshot.settings.responsible ? t("today.responsible") : t("today.away")}</Text><Text style={styles.cardBody}>{t("profile.quiet")}: {snapshot.settings.quietStart}–{snapshot.settings.quietEnd}</Text></View><Pill active={snapshot.settings.responsible} onPress={toggleResponsible}>{snapshot.settings.responsible ? t("common.on") : t("common.off")}</Pill></View><View style={styles.quietRow}><Field label={`${t("profile.quiet")} ${t("profile.quietStart")}`} value={snapshot.settings.quietStart} onChangeText={(quietStart) => updateSettings({ quietStart })} placeholder="22:00" /><Field label={`${t("profile.quiet")} ${t("profile.quietEnd")}`} value={snapshot.settings.quietEnd} onChangeText={(quietEnd) => updateSettings({ quietEnd })} placeholder="07:00" /></View></Card>
    <SectionTitle title={t("profile.language")} /><Card><View style={styles.languageGrid}>{supported.map((locale) => <Pill key={locale} active={locale === snapshot.settings.locale} onPress={() => updateSettings({ locale })}>{languageNames[locale]}</Pill>)}</View><Text style={styles.hint}>{t("profile.localeHint")}</Text></Card>
    <SectionTitle title={t("profile.privacy")} /><Card style={styles.settingsCard}><Text style={styles.cardTitle}>{t("profile.local")}</Text><Text style={styles.cardBody}>{t("profile.localBody")}</Text><View style={styles.exportRow}><Button variant="secondary" onPress={() => void exportFile("csv")}>CSV</Button><Button variant="secondary" onPress={() => void exportFile("json")}>JSON</Button></View><Button variant="danger" onPress={confirmDelete}>{t("profile.delete")}</Button><Text style={styles.hint}>{t("profile.supportHint")}</Text></Card>
    <Modal visible={addVisible} animationType="slide" transparent onRequestClose={() => setAddVisible(false)}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}><ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}><Card style={styles.modal}><Text style={styles.modalTitle}>{t("profile.addDog")}</Text><Field label={t("dog.name")} value={name} onChangeText={setName} placeholder="Milo" autoFocus /><Field label={t("dog.breed")} value={breed} onChangeText={setBreed} placeholder={t("dog.unknown")} /><DatePickerField label={t("dog.birth")} value={birthDate || null} onChange={setBirthDate} locale={snapshot.settings.locale} placeholder={t("dog.birthPlaceholder")} doneLabel={t("common.done")} maximumDate={new Date()} /><View style={styles.modalActions}><Button variant="ghost" onPress={() => setAddVisible(false)}>{t("common.cancel")}</Button><Button onPress={saveDog} disabled={!name.trim()}>{t("common.save")}</Button></View></Card></ScrollView></KeyboardAvoidingView></Modal>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  eyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, maxWidth: 340, marginTop: 4 },
  dogRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  dogCopy: { flex: 1, gap: 2 },
  dogName: { ...typography.heading, color: colors.text },
  dogMeta: { ...typography.small, color: colors.muted },
  settingsCard: { gap: spacing.md },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, paddingVertical: spacing.xs },
  settingCopy: { flex: 1, gap: 2 },
  cardTitle: { ...typography.heading, color: colors.text },
  cardBody: { ...typography.body, color: colors.muted },
  languageGrid: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  hint: { ...typography.small, color: colors.muted, marginTop: spacing.sm },
  exportRow: { flexDirection: "row", gap: spacing.sm },
  quietRow: { gap: spacing.sm },
  overlay: { flex: 1, backgroundColor: "rgba(32,51,43,0.28)", justifyContent: "flex-end" },
  modalScroll: { flexGrow: 1, justifyContent: "center", padding: spacing.lg },
  modal: { width: "100%", maxHeight: "92%", gap: spacing.lg },
  modalTitle: { ...typography.title, color: colors.text },
  modalActions: { flexDirection: "row", gap: spacing.sm },
});
