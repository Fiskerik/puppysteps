import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { RoutineEvent, RoutineEventKind } from "../domain/models";
import { useAppStore } from "../store/AppStore";
import { Button, Card, DatePickerField, Pill } from "./Primitives";
import { colors, spacing, typography } from "./theme";

type Props = { visible: boolean; event: RoutineEvent | null; onClose: () => void; onSaved?: () => void; onDelete?: (eventId: string) => void };

const kinds: RoutineEventKind[] = ["wake", "meal", "drink", "play", "walk", "sleep", "car"];
const icons: Record<RoutineEventKind, string> = { wake: "☀️", meal: "🍽️", drink: "💧", play: "🎾", walk: "🐾", sleep: "😴", car: "🚗" };

export function RoutineSheet({ visible, event, onClose, onSaved, onDelete }: Props) {
  const { t } = useTranslation();
  const { updateRoutine } = useAppStore();
  const [kind, setKind] = useState<RoutineEventKind>("play");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString());

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setKind(event?.kind ?? "play");
      setOccurredAt(event?.occurredAt ?? new Date().toISOString());
    }, 0);
    return () => clearTimeout(timer);
  }, [event?.id, event?.kind, event?.occurredAt, visible]);

  const save = () => {
    if (!event) return;
    if (!updateRoutine({ ...event, kind, occurredAt })) {
      Alert.alert(t("log.saveError"));
      return;
    }
    onSaved?.();
    onClose();
  };

  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} style={styles.backdrop} onPress={onClose} />
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Card style={styles.sheet}>
            <View style={styles.header}><Text style={styles.title}>{t("log.editTitle")}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View>
            <Text style={styles.label}>{t("log.activity")}</Text>
            <View style={styles.kindGrid}>{kinds.map((value) => <Pill key={value} active={kind === value} onPress={() => setKind(value)}>{icons[value]} {t(`routine.${value}`)}</Pill>)}</View>
            <DatePickerField label={t("log.time")} value={occurredAt} onChange={setOccurredAt} locale="en-GB" mode="datetime" maximumDate={new Date()} doneLabel={t("common.done")} />
            <View style={styles.actions}>{event && onDelete ? <Button variant="danger" onPress={() => onDelete(event.id)}>{t("log.deleteAction")}</Button> : null}<Button variant="ghost" onPress={onClose}>{t("common.cancel")}</Button><Button onPress={save}>{t("common.save")}</Button></View>
          </Card>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(32,51,43,0.28)", justifyContent: "flex-end" },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  scroll: { flexGrow: 1, justifyContent: "flex-end" },
  sheet: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, gap: spacing.lg, paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  title: { ...typography.title, color: colors.text },
  close: { fontSize: 33, lineHeight: 33, color: colors.muted, fontWeight: "300" },
  label: { ...typography.small, color: colors.text, fontWeight: "800" },
  kindGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
