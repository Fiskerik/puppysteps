import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ageInMonths } from "../../src/domain/reminderEngine";
import { useAppStore } from "../../src/store/AppStore";
import { Avatar, Button, Card, EmptyState, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { LogSheet } from "../../src/ui/LogSheet";
import { colors, spacing, typography } from "../../src/ui/theme";

const time = (iso: string, locale: string): string => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const date = (iso: string, locale: string): string => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));

export default function TodayScreen() {
  const { t } = useTranslation();
  const { snapshot, selectedDog, selectedDogId, setSelectedDogId, planFor, addRoutine, enableReminders, toggleResponsible } = useAppStore();
  const [logVisible, setLogVisible] = useState(false);
  const [routineMessage, setRoutineMessage] = useState<string | null>(null);
  const locale = snapshot.settings.locale;
  const hasDog = selectedDog.id !== "no-dog";
  const plan = hasDog ? planFor(selectedDog.id) : null;
  const selectedEvents = useMemo(() => snapshot.eliminations.filter((event) => event.dogId === selectedDog.id).slice(0, 4), [selectedDog.id, snapshot.eliminations]);
  const enable = async () => {
    const allowed = await enableReminders();
    if (!allowed) Alert.alert(t("notifications.disabled"));
  };
  const recordRoutine = (kind: "wake" | "meal" | "play", label: string) => {
    if (!addRoutine(kind)) {
      Alert.alert(t("today.saveError"));
      return;
    }
    setRoutineMessage(t("today.routineSaved", { activity: label }));
  };
  const dogPills = snapshot.dogs.map((dog) => <Pill key={dog.id} active={dog.id === selectedDogId} onPress={() => setSelectedDogId(dog.id)}>{dog.name}</Pill>);
  return <Screen>
    <View style={styles.top}><View><Text style={styles.eyebrow}>{t("today.eyebrow")}</Text><Text style={styles.title}>{selectedDog.name}</Text><Text style={styles.subtle}>{hasDog ? `${t("today.ageMonths", { count: ageInMonths(selectedDog) })} · ${selectedDog.breed ?? t("dog.unknown")}` : t("onboarding.body")}</Text></View><Avatar emoji={selectedDog.avatar} size={64} /></View>
    <View style={styles.pillRow}>{dogPills}{hasDog ? <Pill onPress={() => setLogVisible(true)}>＋ {t("today.log")}</Pill> : null}</View>
    {!hasDog ? <Card tone="moss" style={styles.permissionCard}><Text style={styles.cardTitle}>{t("onboarding.title")}</Text><Text style={styles.cardBody}>{t("onboarding.body")}</Text><Button onPress={() => router.push("/onboarding")}>{t("profile.addDog")}</Button></Card> : null}
    <Card tone="sun" style={styles.hero}>
      <View style={styles.heroCopy}><Text style={styles.heroLabel}>{t("today.next")}</Text>{plan ? <Text style={styles.heroTime}>{time(plan.at, locale)}</Text> : <Text style={styles.heroTime}>—</Text>}<Text style={styles.heroReason}>{plan ? t(`reason.${plan.reasonCode}`) : t("today.noReminder")}</Text></View>
      <View accessibilityLabel={plan ? `${t("today.next")} ${time(plan.at, locale)}` : t("today.noReminder")} style={styles.progressCircle}><Text style={styles.progressNumber}>{plan?.intervalMinutes ?? "—"}</Text><Text style={styles.progressUnit}>{plan ? "min" : ""}</Text></View>
    </Card>
    {!snapshot.settings.remindersEnabled ? <Card style={styles.permissionCard}><Text style={styles.cardTitle}>{t("notifications.title")}</Text><Text style={styles.cardBody}>{t("notifications.body")}</Text><Button onPress={() => void enable()}>{t("notifications.allow")}</Button></Card> : <Card tone="moss" style={styles.permissionCard}><View style={styles.rowBetween}><View><Text style={styles.cardTitle}>{snapshot.settings.responsible ? t("today.responsible") : t("today.away")}</Text><Text style={styles.cardBody}>{t("today.reason")}: {plan ? t(`reason.${plan.reasonCode}`) : t("today.noReminder")}</Text></View><Pressable accessibilityRole="switch" accessibilityState={{ checked: snapshot.settings.responsible }} onPress={toggleResponsible} style={[styles.switch, snapshot.settings.responsible && styles.switchOn]}><View style={[styles.switchKnob, snapshot.settings.responsible && styles.switchKnobOn]} /></Pressable></View></Card>}
    {hasDog ? <Button onPress={() => setLogVisible(true)}>{t("today.log")} · {selectedDog.name}</Button> : null}
    <SectionTitle title={t("today.routine")} />
    {hasDog ? <View style={styles.routineGroup}><View style={styles.routineRow}><Pill onPress={() => recordRoutine("wake", t("today.wake"))}>☀️ {t("today.wake")}</Pill><Pill onPress={() => recordRoutine("meal", t("today.meal"))}>🥣 {t("today.meal")}</Pill><Pill onPress={() => recordRoutine("play", t("today.play"))}>🧸 {t("today.play")}</Pill></View>{routineMessage ? <Text accessibilityLiveRegion="polite" style={styles.savedMessage}>✓ {routineMessage}</Text> : null}</View> : null}
    <SectionTitle title={t("today.last")} action={t("nav.log")} onAction={() => router.push("/(tabs)/log")} />
    {selectedEvents.length ? <Card>{selectedEvents.map((event) => <View key={event.id} style={styles.eventRow}><View style={[styles.eventDot, event.location === "inside" && styles.eventDotInside]} /><View style={styles.eventCopy}><Text style={styles.eventTitle}>{event.kind === "pee" ? t("log.pee") : t("log.poo")} {event.location === "outside" ? t("common.outside") : t("common.inside")}</Text><Text style={styles.eventMeta}>{time(event.occurredAt, locale)} · {date(event.occurredAt, locale)}</Text></View></View>)}</Card> : <EmptyState title={t("today.noReminder")} body={t("today.noReminderBody")} />}
    {snapshot.dogs.length > 1 ? <><SectionTitle title={t("today.agenda")} /><Card>{snapshot.dogs.map((dog) => { const dogPlan = planFor(dog.id); return <Pressable key={dog.id} accessibilityRole="button" onPress={() => setSelectedDogId(dog.id)} style={styles.agendaRow}><Avatar emoji={dog.avatar} size={34} /><View style={styles.eventCopy}><Text style={styles.eventTitle}>{dog.name}</Text><Text style={styles.eventMeta}>{dogPlan ? `${t("today.next")}: ${time(dogPlan.at, locale)}` : t("today.noReminder")}</Text></View><Text style={styles.chevron}>›</Text></Pressable>; })}</Card></> : null}
    <LogSheet visible={logVisible} onClose={() => setLogVisible(false)} />
  </Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { ...typography.display, color: colors.text, marginTop: 3 },
  subtle: { ...typography.small, color: colors.muted, marginTop: 4 },
  pillRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  hero: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 170 },
  heroCopy: { flex: 1, gap: spacing.xs },
  heroLabel: { ...typography.small, color: colors.primaryDark, textTransform: "uppercase", letterSpacing: 1 },
  heroTime: { ...typography.display, color: colors.text },
  heroReason: { ...typography.body, color: colors.primaryDark },
  progressCircle: { width: 104, height: 104, borderRadius: 52, borderWidth: 8, borderColor: colors.primary, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.52)" },
  progressNumber: { ...typography.title, color: colors.text },
  progressUnit: { ...typography.small, color: colors.muted },
  permissionCard: { gap: spacing.sm },
  cardTitle: { ...typography.heading, color: colors.text },
  cardBody: { ...typography.body, color: colors.muted },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  switch: { width: 52, height: 31, borderRadius: 16, padding: 3, backgroundColor: colors.border, justifyContent: "center" },
  switchOn: { backgroundColor: colors.primary },
  switchKnob: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.surface },
  switchKnobOn: { alignSelf: "flex-end" },
  routineRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  routineGroup: { gap: spacing.sm },
  savedMessage: { ...typography.small, color: colors.success },
  eventRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  eventDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success },
  eventDotInside: { backgroundColor: colors.attention },
  eventCopy: { flex: 1, gap: 2 },
  eventTitle: { ...typography.body, color: colors.text, fontWeight: "800" },
  eventMeta: { ...typography.small, color: colors.muted },
  agendaRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  chevron: { fontSize: 26, color: colors.muted },
});
