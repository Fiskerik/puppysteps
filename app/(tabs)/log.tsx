import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import type { RoutineEvent, RoutineEventKind } from "../../src/domain/models";
import { useAppStore } from "../../src/store/AppStore";
import { Button, Card, EmptyState, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { LogSheet, type EditableCheckIn } from "../../src/ui/LogSheet";
import { RoutineSheet } from "../../src/ui/RoutineSheet";
import { colors, spacing, typography } from "../../src/ui/theme";

const dateTime = (iso: string, locale: string): string => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const routineIcons: Record<RoutineEventKind, string> = { wake: "☀️", meal: "🍽️", drink: "💧", play: "🎾", walk: "🐾", sleep: "😴", car: "🚗" };

type LogEntry = { type: "checkIn"; id: string; occurredAt: string; checkIn: EditableCheckIn } | { type: "routine"; id: string; occurredAt: string; event: RoutineEvent };

export default function LogScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ dogId?: string }>();
  const { snapshot, selectedDog, selectedDogId, setSelectedDogId, removeCheckIn, removeRoutine } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<EditableCheckIn | undefined>();
  const [editingRoutine, setEditingRoutine] = useState<RoutineEvent | null>(null);
  useEffect(() => { if (params.dogId && snapshot.dogs.some((dog) => dog.id === params.dogId)) setSelectedDogId(params.dogId); }, [params.dogId, setSelectedDogId, snapshot.dogs]);
  const dogEvents = useMemo(() => snapshot.eliminations.filter((event) => event.dogId === selectedDogId), [selectedDogId, snapshot.eliminations]);
  const entries = useMemo<LogEntry[]>(() => {
    const checkIns: LogEntry[] = snapshot.checkIns.filter((checkIn) => checkIn.dogId === selectedDogId).map((checkIn) => ({ type: "checkIn", id: checkIn.id, occurredAt: checkIn.occurredAt, checkIn: { checkIn, events: dogEvents.filter((event) => event.checkInId === checkIn.id) } }));
    const routines: LogEntry[] = snapshot.routineEvents.filter((event) => event.dogId === selectedDogId).map((event) => ({ type: "routine", id: event.id, occurredAt: event.occurredAt, event }));
    return [...checkIns, ...routines].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }, [dogEvents, selectedDogId, snapshot.checkIns, snapshot.routineEvents]);
  const hasDog = selectedDog.id !== "no-dog";
  const openCheckIn = (entry: EditableCheckIn) => { setEditingRoutine(null); setEditingCheckIn(entry); setVisible(true); };
  const openRoutine = (event: RoutineEvent) => { setEditingCheckIn(undefined); setEditingRoutine(event); setVisible(true); };
  const deleteCheckIn = (checkInId: string) => Alert.alert(t("log.deleteConfirm"), undefined, [{ text: t("common.cancel"), style: "cancel" }, { text: t("log.deleteAction"), style: "destructive", onPress: () => { if (removeCheckIn(checkInId)) { setVisible(false); setEditingCheckIn(undefined); } else Alert.alert(t("today.saveError")); } }]);
  const deleteRoutine = (eventId: string) => Alert.alert(t("log.deleteConfirm"), undefined, [{ text: t("common.cancel"), style: "cancel" }, { text: t("log.deleteAction"), style: "destructive", onPress: () => { if (removeRoutine(eventId)) { setVisible(false); setEditingRoutine(null); } else Alert.alert(t("today.saveError")); } }]);
  const renderEntry = (entry: LogEntry) => {
    const isCheckIn = entry.type === "checkIn";
    const icons = isCheckIn
      ? entry.checkIn.checkIn.nothing ? ["○"] : entry.checkIn.events.map((event) => event.kind === "pee" ? "💧" : "💩")
      : [routineIcons[entry.event.kind]];
    const labels = isCheckIn
      ? entry.checkIn.checkIn.nothing ? [t("log.nothing")] : entry.checkIn.events.map((event) => event.kind === "pee" ? t("log.pee") : t("log.poo"))
      : [t(`routine.${entry.event.kind}`)];
    const label = labels.join(" · ");
    return <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`${label}, ${dateTime(entry.occurredAt, snapshot.settings.locale)}`} onPress={() => isCheckIn ? openCheckIn(entry.checkIn) : openRoutine(entry.event)} onLongPress={() => isCheckIn ? openCheckIn(entry.checkIn) : openRoutine(entry.event)} delayLongPress={350} style={styles.item}>
      <View style={styles.iconGroup}>{icons.map((icon, index) => <Text key={`${entry.id}-${index}`} style={styles.itemIcon}>{icon}</Text>)}</View>
      <View style={styles.itemCopy}><Text style={styles.itemTitle}>{label}</Text><Text style={styles.itemMeta}>{dateTime(entry.occurredAt, snapshot.settings.locale)}</Text></View>
      {isCheckIn && entry.checkIn.checkIn.photoUri ? <Image source={{ uri: entry.checkIn.checkIn.photoUri }} style={styles.photoThumb} /> : null}
      <Text style={styles.more}>›</Text>
    </Pressable>;
  };

  return <Screen>
    <View style={styles.header}><View><Text style={styles.eyebrow}>{t("nav.log")}</Text><Text style={styles.title}>{selectedDog.name}</Text><Text style={styles.subtle}>{t("today.subtle")}</Text></View></View>
    <View style={styles.dogRow}>{snapshot.dogs.map((dog) => <Pill key={dog.id} active={dog.id === selectedDogId} onPress={() => setSelectedDogId(dog.id)}>{dog.name}</Pill>)}</View>
    {hasDog ? <Button onPress={() => { setEditingCheckIn(undefined); setEditingRoutine(null); setVisible(true); }}>{t("today.log")}</Button> : <><EmptyState title={t("onboarding.title")} body={t("onboarding.body")} /><Button onPress={() => router.push("/onboarding")}>{t("profile.addDog")}</Button></>}
    <SectionTitle title={t("log.dateTimeHeader")} />
    {entries.length ? <Card><View style={styles.columnHeader}><Text style={styles.columnHeaderText}>{t("log.activity")}</Text><Text style={styles.columnHeaderText}>{t("log.dateTimeHeader")}</Text></View>{entries.map(renderEntry)}<Text style={styles.hint}>{t("log.hint")}</Text></Card> : <EmptyState title={t("log.emptyTitle")} body={t("log.emptyBody")} />}
    <LogSheet visible={visible && !editingRoutine} initialCheckIn={editingCheckIn ?? null} onClose={() => { setVisible(false); setEditingCheckIn(undefined); }} onDelete={deleteCheckIn} />
    <RoutineSheet visible={visible && Boolean(editingRoutine)} event={editingRoutine} onClose={() => { setVisible(false); setEditingRoutine(null); }} onDelete={deleteRoutine} />
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }, eyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.2 }, title: { ...typography.display, color: colors.text, marginTop: 3 }, subtle: { ...typography.body, color: colors.muted, marginTop: 5, maxWidth: 250 }, dogRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }, columnHeader: { flexDirection: "row", justifyContent: "space-between", paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border }, columnHeaderText: { ...typography.small, color: colors.muted, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 }, item: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }, iconGroup: { minWidth: 50, flexDirection: "row", alignItems: "center", gap: 2 }, itemIcon: { fontSize: 23 }, itemCopy: { flex: 1, gap: 3 }, itemTitle: { ...typography.body, color: colors.text, fontWeight: "800" }, itemMeta: { ...typography.small, color: colors.muted }, photoThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.surfaceAlt }, more: { fontSize: 27, color: colors.muted }, hint: { ...typography.small, color: colors.muted, marginTop: spacing.md },
});
