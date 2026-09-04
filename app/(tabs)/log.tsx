import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ALL_DOGS_FILTER, buildLogEntryAccessibilityLabel, getLogActivityPresentation, resolveLogDogFilter, shouldShowDogIdentity } from "../../src/domain/logPresentation";
import type { RoutineEvent } from "../../src/domain/models";
import { useAppStore } from "../../src/store/AppStore";
import { Avatar, Button, Card, EmptyState, Pill, Screen } from "../../src/ui/Primitives";
import { LogSheet, type EditableCheckIn } from "../../src/ui/LogSheet";
import { RoutineSheet } from "../../src/ui/RoutineSheet";
import { colors, spacing, typography } from "../../src/ui/theme";

const dateTime = (iso: string, locale: string): string => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

type DogDetails = { name: string; avatar: string; photoUri: string | null };
type LogEntry = { type: "checkIn"; id: string; occurredAt: string; dog: DogDetails; checkIn: EditableCheckIn } | { type: "routine"; id: string; occurredAt: string; dog: DogDetails; event: RoutineEvent };

export default function LogScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ dogId?: string }>();
  const { snapshot, selectedDog, setSelectedDogId, removeCheckIn, removeRoutine } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<EditableCheckIn | undefined>();
  const [editingRoutine, setEditingRoutine] = useState<RoutineEvent | null>(null);
  const [dogFilter, setDogFilter] = useState<string>(ALL_DOGS_FILTER);
  const linkedDogFilter = resolveLogDogFilter(snapshot.dogs.map((dog) => dog.id), params.dogId);
  useEffect(() => {
    // Route params can change while this tab stays mounted. A normal visit
    // returns to the household-wide view; only a valid dog deep link narrows
    // the list and synchronizes the selected profile.
    const sync = setTimeout(() => {
      setDogFilter(linkedDogFilter);
      if (linkedDogFilter !== ALL_DOGS_FILTER) setSelectedDogId(linkedDogFilter);
    }, 0);
    return () => clearTimeout(sync);
  }, [linkedDogFilter, setSelectedDogId]);
  const activityLabels = useMemo(() => ({
    pee: t("log.pee"),
    poo: t("log.poo"),
    nothing: t("log.nothing"),
    routine: {
      wake: t("routine.wake"),
      meal: t("routine.meal"),
      drink: t("routine.drink"),
      play: t("routine.play"),
      walk: t("routine.walk"),
      sleep: t("routine.sleep"),
      car: t("routine.car"),
    },
  }), [t]);
  const dogEvents = useMemo(() => snapshot.eliminations.filter((event) => dogFilter === ALL_DOGS_FILTER || event.dogId === dogFilter), [dogFilter, snapshot.eliminations]);
  const entries = useMemo<LogEntry[]>(() => {
    const dogDetails = (dogId: string): DogDetails => {
      const dog = snapshot.dogs.find((item) => item.id === dogId);
      return { name: dog?.name ?? t("dog.unknown"), avatar: dog?.avatar ?? "🐶", photoUri: dog?.photoUri ?? null };
    };
    const checkIns: LogEntry[] = snapshot.checkIns.filter((checkIn) => dogFilter === ALL_DOGS_FILTER || checkIn.dogId === dogFilter).map((checkIn) => ({ type: "checkIn", id: checkIn.id, occurredAt: checkIn.occurredAt, dog: dogDetails(checkIn.dogId), checkIn: { checkIn, events: dogEvents.filter((event) => event.checkInId === checkIn.id) } }));
    const routines: LogEntry[] = snapshot.routineEvents.filter((event) => dogFilter === ALL_DOGS_FILTER || event.dogId === dogFilter).map((event) => ({ type: "routine", id: event.id, occurredAt: event.occurredAt, dog: dogDetails(event.dogId), event }));
    return [...checkIns, ...routines].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }, [dogEvents, dogFilter, snapshot.checkIns, snapshot.dogs, snapshot.routineEvents, t]);
  const hasDog = selectedDog.id !== "no-dog";
  const openCheckIn = (entry: EditableCheckIn) => { setEditingRoutine(null); setEditingCheckIn(entry); setVisible(true); };
  const openRoutine = (event: RoutineEvent) => { setEditingCheckIn(undefined); setEditingRoutine(event); setVisible(true); };
  const deleteCheckIn = (checkInId: string) => Alert.alert(t("log.deleteConfirm"), undefined, [{ text: t("common.cancel"), style: "cancel" }, { text: t("log.deleteAction"), style: "destructive", onPress: () => { if (removeCheckIn(checkInId)) { setVisible(false); setEditingCheckIn(undefined); } else Alert.alert(t("today.saveError")); } }]);
  const deleteRoutine = (eventId: string) => Alert.alert(t("log.deleteConfirm"), undefined, [{ text: t("common.cancel"), style: "cancel" }, { text: t("log.deleteAction"), style: "destructive", onPress: () => { if (removeRoutine(eventId)) { setVisible(false); setEditingRoutine(null); } else Alert.alert(t("today.saveError")); } }]);
  const renderEntry = (entry: LogEntry) => {
    const isCheckIn = entry.type === "checkIn";
    const activity = isCheckIn
      ? getLogActivityPresentation({ type: "checkIn", nothing: entry.checkIn.checkIn.nothing, eliminationKinds: entry.checkIn.events.map((event) => event.kind) }, activityLabels)
      : getLogActivityPresentation({ type: "routine", kind: entry.event.kind }, activityLabels);
    const showDog = shouldShowDogIdentity(dogFilter, snapshot.dogs.length);
    const entryDateTime = dateTime(entry.occurredAt, snapshot.settings.locale);
    return <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={buildLogEntryAccessibilityLabel(entry.dog.name, activity.label, entryDateTime)} onPress={() => isCheckIn ? openCheckIn(entry.checkIn) : openRoutine(entry.event)} onLongPress={() => isCheckIn ? openCheckIn(entry.checkIn) : openRoutine(entry.event)} delayLongPress={350} style={styles.item}>
      <View style={styles.iconGroup}>{activity.icons.map((icon, index) => <View key={`${entry.id}-${index}`} style={styles.iconBubble}><MaterialCommunityIcons name={icon} size={20} color={icon === "emoticon-poop" ? colors.terracotta : icon === "circle-outline" ? colors.muted : colors.primary} /></View>)}</View>
      <View style={styles.itemCopy}><Text style={styles.itemTitle}>{activity.label}</Text><View style={styles.itemMetaRow}>{showDog ? <View style={styles.dogMeta}><Avatar emoji={entry.dog.avatar} photoUri={entry.dog.photoUri} size={18} /><Text style={styles.itemMeta}>{entry.dog.name}</Text></View> : null}<Text style={styles.itemMeta}>{entryDateTime}</Text></View></View>
      {isCheckIn && entry.checkIn.checkIn.photoUri ? <Image source={{ uri: entry.checkIn.checkIn.photoUri }} style={styles.photoThumb} /> : null}
      <Text style={styles.more}>›</Text>
    </Pressable>;
  };

  return <Screen density="compact">
    <View style={styles.header}><View><Text style={styles.eyebrow}>{t("nav.log")}</Text><Text style={styles.title}>{dogFilter === ALL_DOGS_FILTER && snapshot.dogs.length > 1 ? t("common.allDogs") : selectedDog.name}</Text><Text style={styles.subtle}>{t("today.subtle")}</Text></View></View>
    <View style={styles.dogRow}><Pill active={dogFilter === ALL_DOGS_FILTER} onPress={() => setDogFilter(ALL_DOGS_FILTER)}>{t("common.allDogs")}</Pill>{snapshot.dogs.map((dog) => <Pill key={dog.id} active={dog.id === dogFilter} onPress={() => { setDogFilter(dog.id); setSelectedDogId(dog.id); }}>{dog.name}</Pill>)}</View>
    {hasDog ? <Button onPress={() => { setEditingCheckIn(undefined); setEditingRoutine(null); setVisible(true); }}>{t("today.log")}</Button> : <><EmptyState title={t("onboarding.title")} body={t("onboarding.body")} /><Button onPress={() => router.push("/onboarding")}>{t("profile.addDog")}</Button></>}
    {entries.length ? <Card><View style={styles.columnHeader}><Text style={styles.columnHeaderText}>{t("log.dateTimeHeader")}</Text></View>{entries.map(renderEntry)}<Text style={styles.hint}>{t("log.hint")}</Text></Card> : <EmptyState title={t("log.emptyTitle")} body={t("log.emptyBody")} />}
    <LogSheet visible={visible && !editingRoutine} initialCheckIn={editingCheckIn ?? null} onClose={() => { setVisible(false); setEditingCheckIn(undefined); }} onDelete={deleteCheckIn} />
    <RoutineSheet visible={visible && Boolean(editingRoutine)} event={editingRoutine} onClose={() => { setVisible(false); setEditingRoutine(null); }} onDelete={deleteRoutine} />
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }, eyebrow: { ...typography.small, color: colors.primary, letterSpacing: 0.3 }, title: { ...typography.display, color: colors.text, marginTop: 3 }, subtle: { ...typography.body, color: colors.muted, marginTop: 5, maxWidth: 250 }, dogRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }, columnHeader: { paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border }, columnHeaderText: { ...typography.small, color: colors.muted, fontWeight: "800", letterSpacing: 0.3 }, item: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }, iconGroup: { minWidth: 36, flexDirection: "row", alignItems: "center", gap: 3 }, iconBubble: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceAlt }, itemCopy: { flex: 1, gap: 3 }, itemTitle: { ...typography.body, color: colors.text, fontWeight: "800" }, itemMetaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.xs }, dogMeta: { flexDirection: "row", alignItems: "center", gap: 4 }, itemMeta: { ...typography.small, color: colors.muted }, photoThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.surfaceAlt }, more: { fontSize: 27, color: colors.muted }, hint: { ...typography.small, color: colors.muted, marginTop: spacing.md },
});
