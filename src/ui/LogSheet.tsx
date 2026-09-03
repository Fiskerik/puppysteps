import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppStore, type LogSelection } from "../store/AppStore";
import { Button, Card, Field, Pill } from "./Primitives";
import { colors, spacing, typography } from "./theme";

type Props = { visible: boolean; onClose: () => void; onSaved?: () => void };

const localInputValue = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const parseDate = (value: string): string => {
  const parsed = new Date(value.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

export function LogSheet({ visible, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const { selectedDog, logCheckIn } = useAppStore();
  const [pee, setPee] = useState<LogSelection["pee"]>(null);
  const [poo, setPoo] = useState<LogSelection["poo"]>(null);
  const [nothing, setNothing] = useState(false);
  const [time, setTime] = useState(localInputValue(new Date()));
  const [notes, setNotes] = useState("");

  const hasSelection = nothing || Boolean(pee || poo);
  const reset = () => { setPee(null); setPoo(null); setNothing(false); setTime(localInputValue(new Date())); setNotes(""); };
  const selectNothing = () => { setNothing(true); setPee(null); setPoo(null); };
  const save = () => {
    if (!hasSelection) return;
    logCheckIn({ pee, poo, nothing, occurredAt: parseDate(time), notes: notes.trim() || null, source: "manual" });
    reset();
    onSaved?.();
    onClose();
  };

  const functionLabels = useMemo(() => ({ pee: t("log.pee"), poo: t("log.poo") }), [t]);
  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <View style={styles.modal}>
      <View style={styles.handle} />
      <View style={styles.header}><View><Text style={styles.title}>{t("log.title")}</Text><Text style={styles.subtitle}>{selectedDog.name} · {t("log.subtitle")}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View>
      <Card tone="moss" style={styles.notice}><Text style={styles.noticeText}>💛 {t("today.tip")}</Text></Card>
      <Text style={styles.groupLabel}>{functionLabels.pee}</Text>
      <View style={styles.pills}><Pill active={pee === "outside"} onPress={() => { setNothing(false); setPee(pee === "outside" ? null : "outside"); }}>{t("log.outside")}</Pill><Pill active={pee === "inside"} onPress={() => { setNothing(false); setPee(pee === "inside" ? null : "inside"); }}>{t("log.inside")}</Pill></View>
      <Text style={styles.groupLabel}>{functionLabels.poo}</Text>
      <View style={styles.pills}><Pill active={poo === "outside"} onPress={() => { setNothing(false); setPoo(poo === "outside" ? null : "outside"); }}>{t("log.outside")}</Pill><Pill active={poo === "inside"} onPress={() => { setNothing(false); setPoo(poo === "inside" ? null : "inside"); }}>{t("log.inside")}</Pill></View>
      <Pressable accessibilityRole="radio" accessibilityState={{ selected: nothing }} onPress={selectNothing} style={[styles.nothing, nothing && styles.nothingSelected]}><Text style={styles.nothingIcon}>○</Text><View><Text style={styles.nothingTitle}>{t("log.nothing")}</Text><Text style={styles.nothingBody}>{t("log.followUp")}</Text></View></Pressable>
      <Field label={t("log.time")} value={time} onChangeText={setTime} autoCapitalize="none" />
      <Field label={t("log.notes")} value={notes} onChangeText={setNotes} multiline numberOfLines={2} style={styles.notes} />
      <View style={styles.actions}><Button variant="ghost" onPress={onClose}>{t("common.cancel")}</Button><Button onPress={save} disabled={!hasSelection}>{t("common.save")}</Button></View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
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
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: "auto" },
});
