import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppStore, type LogSelection } from "../store/AppStore";
import { Button, Card, DatePickerField, Field, Pill } from "./Primitives";
import { colors, spacing, typography } from "./theme";

type Props = { visible: boolean; onClose: () => void; onSaved?: () => void };

export function LogSheet({ visible, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const { snapshot, selectedDog, logCheckIn } = useAppStore();
  const [pee, setPee] = useState<LogSelection["pee"]>(null);
  const [poo, setPoo] = useState<LogSelection["poo"]>(null);
  const [nothing, setNothing] = useState(false);
  const [time, setTime] = useState(new Date().toISOString());
  const [notes, setNotes] = useState("");

  const hasSelection = nothing || Boolean(pee || poo);
  const reset = () => { setPee(null); setPoo(null); setNothing(false); setTime(new Date().toISOString()); setNotes(""); };
  const selectNothing = () => { setNothing(true); setPee(null); setPoo(null); };
  const save = () => {
    if (!hasSelection) return;
    const saved = logCheckIn({ pee, poo, nothing, occurredAt: time, notes: notes.trim() || null, source: "manual" });
    if (!saved) {
      Alert.alert(t("log.saveError"));
      return;
    }
    reset();
    onSaved?.();
    onClose();
  };

  const functionLabels = useMemo(() => ({ pee: t("log.pee"), poo: t("log.poo") }), [t]);
  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}>
    <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.handle} />
      <View style={styles.header}><View><Text style={styles.title}>{t("log.title")}</Text><Text style={styles.subtitle}>{selectedDog.name} · {t("log.subtitle")}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View>
      <Card tone="moss" style={styles.notice}><Text style={styles.noticeText}>💛 {t("today.tip")}</Text></Card>
      <Text style={styles.groupLabel}>{functionLabels.pee}</Text>
      <View style={styles.pills}><Pill active={pee === "outside"} onPress={() => { setNothing(false); setPee(pee === "outside" ? null : "outside"); }}>{t("log.outside")}</Pill><Pill active={pee === "inside"} onPress={() => { setNothing(false); setPee(pee === "inside" ? null : "inside"); }}>{t("log.inside")}</Pill></View>
      <Text style={styles.groupLabel}>{functionLabels.poo}</Text>
      <View style={styles.pills}><Pill active={poo === "outside"} onPress={() => { setNothing(false); setPoo(poo === "outside" ? null : "outside"); }}>{t("log.outside")}</Pill><Pill active={poo === "inside"} onPress={() => { setNothing(false); setPoo(poo === "inside" ? null : "inside"); }}>{t("log.inside")}</Pill></View>
      <Pressable accessibilityRole="radio" accessibilityState={{ selected: nothing }} onPress={selectNothing} style={[styles.nothing, nothing && styles.nothingSelected]}><Text style={styles.nothingIcon}>○</Text><View><Text style={styles.nothingTitle}>{t("log.nothing")}</Text><Text style={styles.nothingBody}>{t("log.followUp")}</Text></View></Pressable>
      <DatePickerField label={t("log.time")} value={time} onChange={setTime} locale={snapshot.settings.locale} mode="datetime" maximumDate={new Date()} placeholder={t("log.timePlaceholder")} doneLabel={t("common.done")} />
      <Field label={t("log.notes")} value={notes} onChangeText={setNotes} multiline numberOfLines={2} style={styles.notes} />
      <View style={styles.actions}><Button variant="ghost" onPress={onClose}>{t("common.cancel")}</Button><Button onPress={save} disabled={!hasSelection}>{t("common.save")}</Button></View>
    </ScrollView>
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: colors.background },
  modalContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  handle: { alignSelf: "center", width: 42, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.sm },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.small, color: colors.muted, marginTop: 5, maxWidth: 300 },
  close: { fontSize: 33, lineHeight: 33, color: colors.muted, fontWeight: "300" },
  notice: { paddingVertical: spacing.md },
  noticeText: { ...typography.body, color: colors.primaryDark, fontWeight: "700" },
  groupLabel: { ...typography.small, color: colors.text, marginTop: spacing.xs },
  pills: { flexDirection: "row", gap: spacing.sm },
  nothing: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md, flexDirection: "row", gap: spacing.md, alignItems: "center" },
  nothingSelected: { borderColor: colors.primary, backgroundColor: colors.moss },
  nothingIcon: { fontSize: 25, color: colors.primary },
  nothingTitle: { ...typography.body, color: colors.text, fontWeight: "800" },
  nothingBody: { ...typography.small, color: colors.muted, marginTop: 2 },
  notes: { minHeight: 72, textAlignVertical: "top", paddingTop: 12 },
  actions: { flexDirection: "row", gap: spacing.sm },
});
