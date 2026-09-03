import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppStore, type LogSelection } from "../store/AppStore";
import type { EliminationEvent, ToiletCheckIn } from "../domain/models";
import { Button, Card, DatePickerField, Field, Pill } from "./Primitives";
import { pickLocalPhoto } from "./photoPicker";
import { colors, spacing, typography } from "./theme";

export type EditableCheckIn = { checkIn: ToiletCheckIn; events: EliminationEvent[] };
type Props = { visible: boolean; onClose: () => void; onSaved?: () => void; onDelete?: (checkInId: string) => void; initialCheckIn?: EditableCheckIn | null };

export function LogSheet({ visible, onClose, onSaved, onDelete, initialCheckIn }: Props) {
  const { t } = useTranslation();
  const { snapshot, selectedDog, logCheckIn, updateCheckIn: saveCheckIn } = useAppStore();
  const [pee, setPee] = useState<LogSelection["pee"]>(null);
  const [poo, setPoo] = useState<LogSelection["poo"]>(null);
  const [nothing, setNothing] = useState(false);
  const [time, setTime] = useState(new Date().toISOString());
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  const hasSelection = nothing || Boolean(pee || poo);
  const applyInitial = useCallback((entry?: EditableCheckIn) => {
    const events = entry?.events ?? [];
    setPee(events.find((event) => event.kind === "pee")?.location ?? null);
    setPoo(events.find((event) => event.kind === "poo")?.location ?? null);
    setNothing(entry?.checkIn.nothing ?? false);
    setTime(entry?.checkIn.occurredAt ?? new Date().toISOString());
    setNotes(entry?.checkIn.notes ?? "");
    setPhotoUri(entry?.checkIn.photoUri ?? null);
  }, []);
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => applyInitial(initialCheckIn ?? undefined), 0);
    return () => clearTimeout(timer);
  }, [applyInitial, initialCheckIn, visible]);
  const reset = () => { setPee(null); setPoo(null); setNothing(false); setTime(new Date().toISOString()); setNotes(""); setPhotoUri(null); };
  const selectNothing = () => { setNothing(true); setPee(null); setPoo(null); };
  const choosePhoto = async (source: "camera" | "library") => {
    setPhotoBusy(true);
    try {
      const uri = await pickLocalPhoto(source);
      if (uri) setPhotoUri(uri);
    } catch (error) {
      console.warn("Could not attach photo", error);
      Alert.alert(t("log.photoError"));
    } finally {
      setPhotoBusy(false);
    }
  };
  const openPhotoOptions = () => {
    const options: { text: string; onPress: () => void; style?: "default" | "cancel" | "destructive" }[] = [
      { text: t("log.takePhoto"), onPress: () => void choosePhoto("camera") },
      { text: t("log.choosePhoto"), onPress: () => void choosePhoto("library") },
    ];
    if (photoUri) options.push({ text: t("log.removePhoto"), onPress: () => setPhotoUri(null) });
    options.push({ text: t("common.cancel"), onPress: () => undefined, style: "cancel" });
    Alert.alert(t("log.attachPhoto"), t("log.attachPhotoBody"), options);
  };
  const save = () => {
    if (!hasSelection) return;
    const events: EliminationEvent[] = [];
    const dogId = initialCheckIn?.checkIn.dogId ?? selectedDog.id;
    const checkIn: ToiletCheckIn = initialCheckIn
      ? { ...initialCheckIn.checkIn, dogId, occurredAt: time, nothing, notes: notes.trim() || null, photoUri }
      : { id: "", dogId, occurredAt: time, source: "manual", nothing, notes: notes.trim() || null, photoUri, createdAt: "" };
    if (!nothing && pee) events.push({ id: initialCheckIn?.events.find((event) => event.kind === "pee")?.id ?? "", checkInId: checkIn.id, dogId, kind: "pee", location: pee, occurredAt: time });
    if (!nothing && poo) events.push({ id: initialCheckIn?.events.find((event) => event.kind === "poo")?.id ?? "", checkInId: checkIn.id, dogId, kind: "poo", location: poo, occurredAt: time });
    const saved = initialCheckIn
      ? saveCheckIn(checkIn, events)
      : logCheckIn({ pee, poo, nothing, occurredAt: time, notes: notes.trim() || null, photoUri, source: "manual" });
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
      <View style={styles.header}><View><Text style={styles.title}>{initialCheckIn ? t("log.editTitle") : t("log.title")}</Text><Text style={styles.subtitle}>{selectedDog.name} · {t("log.subtitle")}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View>
      <Card tone="moss" style={styles.notice}><Text style={styles.noticeText}>💛 {t("today.tip")}</Text></Card>
      <Text style={styles.groupLabel}>{functionLabels.pee}</Text>
      <View style={styles.pills}><Pill active={pee === "outside"} onPress={() => { setNothing(false); setPee(pee === "outside" ? null : "outside"); }}>{t("log.outside")}</Pill><Pill active={pee === "inside"} onPress={() => { setNothing(false); setPee(pee === "inside" ? null : "inside"); }}>{t("log.inside")}</Pill></View>
      <Text style={styles.groupLabel}>{functionLabels.poo}</Text>
      <View style={styles.pills}><Pill active={poo === "outside"} onPress={() => { setNothing(false); setPoo(poo === "outside" ? null : "outside"); }}>{t("log.outside")}</Pill><Pill active={poo === "inside"} onPress={() => { setNothing(false); setPoo(poo === "inside" ? null : "inside"); }}>{t("log.inside")}</Pill></View>
      <Pressable accessibilityRole="radio" accessibilityState={{ selected: nothing }} onPress={selectNothing} style={[styles.nothing, nothing && styles.nothingSelected]}><Text style={[styles.nothingIcon, nothing && styles.nothingIconSelected]}>{nothing ? "✓" : "○"}</Text><View><Text style={styles.nothingTitle}>{t("log.nothing")}</Text><Text style={styles.nothingBody}>{t("log.followUp")}</Text></View></Pressable>
      <DatePickerField label={t("log.time")} value={time} onChange={setTime} locale={snapshot.settings.locale} mode="datetime" maximumDate={new Date()} placeholder={t("log.timePlaceholder")} doneLabel={t("common.done")} />
      <Field label={t("log.notes")} value={notes} onChangeText={setNotes} multiline numberOfLines={2} style={styles.notes} />
      <View style={styles.photoSection}>
        <View style={styles.photoHeader}><Text style={styles.groupLabel}>{t("log.photo")}</Text><Pressable accessibilityRole="button" onPress={openPhotoOptions} disabled={photoBusy} style={styles.photoButton}><Text style={styles.photoButtonText}>{photoBusy ? t("log.photoAdding") : photoUri ? t("log.changePhoto") : t("log.attachPhoto")}</Text></Pressable></View>
        {photoUri ? <View style={styles.photoPreview}><Image source={{ uri: photoUri }} style={styles.photoImage} /><Pressable accessibilityRole="button" accessibilityLabel={t("log.removePhoto")} onPress={() => setPhotoUri(null)} style={styles.photoRemove}><Text style={styles.photoRemoveText}>×</Text></Pressable></View> : <Text style={styles.photoHint}>{t("log.photoHint")}</Text>}
      </View>
      <View style={styles.actions}>{initialCheckIn && onDelete ? <Button variant="danger" onPress={() => onDelete(initialCheckIn.checkIn.id)}>{t("log.deleteAction")}</Button> : null}<Button variant="ghost" onPress={onClose}>{t("common.cancel")}</Button><Button onPress={save} disabled={!hasSelection || photoBusy}>{t("common.save")}</Button></View>
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
  nothingIconSelected: { fontWeight: "800", color: colors.primaryDark },
  nothingTitle: { ...typography.body, color: colors.text, fontWeight: "800" },
  nothingBody: { ...typography.small, color: colors.muted, marginTop: 2 },
  notes: { minHeight: 72, textAlignVertical: "top", paddingTop: 12 },
  photoSection: { gap: spacing.sm },
  photoHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  photoButton: { borderRadius: 15, backgroundColor: colors.moss, paddingHorizontal: spacing.md, paddingVertical: 10 },
  photoButtonText: { ...typography.small, color: colors.primaryDark, fontWeight: "800" },
  photoHint: { ...typography.small, color: colors.muted },
  photoPreview: { height: 150, borderRadius: 18, overflow: "hidden", backgroundColor: colors.surfaceAlt, position: "relative" },
  photoImage: { width: "100%", height: "100%" },
  photoRemove: { position: "absolute", top: 8, right: 8, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  photoRemoveText: { fontSize: 26, lineHeight: 28, color: colors.text },
  actions: { flexDirection: "row", gap: spacing.sm },
});
