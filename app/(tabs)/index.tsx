import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ageInMonths } from "../../src/domain/reminderEngine";
import { useAppStore } from "../../src/store/AppStore";
import { Avatar, Button, Card, EmptyState, IconButton, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { LogSheet } from "../../src/ui/LogSheet";
import { colors, spacing, typography } from "../../src/ui/theme";
import { loadTodayWeather, type TodayWeather } from "../../src/weather/weather";

const time = (iso: string, locale: string): string => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const date = (iso: string, locale: string): string => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));

export default function TodayScreen() {
  const { t } = useTranslation();
  const { snapshot, selectedDog, selectedDogId, setSelectedDogId, planFor, addRoutine, enableReminders, updateSettings, toggleResponsible } = useAppStore();
  const [logVisible, setLogVisible] = useState(false);
  const [routineMessage, setRoutineMessage] = useState<string | null>(null);
  const [weather, setWeather] = useState<TodayWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);
  const [clock, setClock] = useState(() => new Date().getTime());
  const locale = snapshot.settings.locale;
  const hasDog = selectedDog.id !== "no-dog";
  const refreshWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(false);
    try { setWeather(await loadTodayWeather()); }
    catch (error) { console.warn("Could not load today's weather", error); setWeather(null); setWeatherError(true); }
    finally { setWeatherLoading(false); }
  }, []);
  useEffect(() => { const timer = setTimeout(() => { if (hasDog) void refreshWeather(); }, 0); return () => clearTimeout(timer); }, [hasDog, refreshWeather, selectedDog.id]);
  useEffect(() => { const timer = setInterval(() => setClock(new Date().getTime()), 60_000); return () => clearInterval(timer); }, []);
  const plan = hasDog ? planFor(selectedDog.id) : null;
  const minutesUntilPlan = plan ? Math.max(0, Math.round((new Date(plan.at).getTime() - clock) / 60_000)) : null;
  const countdownLabel = minutesUntilPlan === null ? t("today.noReminder") : minutesUntilPlan >= 60 ? `${Math.floor(minutesUntilPlan / 60)}h ${minutesUntilPlan % 60}m` : `${minutesUntilPlan} min`;
  const progressRatio = plan && minutesUntilPlan !== null ? Math.max(0, Math.min(1, 1 - minutesUntilPlan / Math.max(plan.intervalMinutes, 1))) : 0;
  const selectedEvents = useMemo(() => snapshot.eliminations.filter((event) => event.dogId === selectedDog.id).slice(0, 4), [selectedDog.id, snapshot.eliminations]);
  const enable = async () => {
    const allowed = await enableReminders();
    if (!allowed) Alert.alert(t("notifications.disabled"));
  };
  const toggleReminders = async () => { if (snapshot.settings.remindersEnabled) updateSettings({ remindersEnabled: false }); else await enable(); };
  const recordRoutine = (kind: "wake" | "meal" | "drink" | "play" | "walk" | "sleep", label: string) => {
    if (!addRoutine(kind)) {
      Alert.alert(t("today.saveError"));
      return;
    }
    setRoutineMessage(t("today.routineSaved", { activity: label }));
  };
  return <Screen>
    <View style={styles.top}><View><Text style={styles.eyebrow}>{t("today.eyebrow")}</Text><Text style={styles.title}>{selectedDog.name}</Text><Text style={styles.subtle}>{hasDog ? `${t("today.ageMonths", { count: ageInMonths(selectedDog) })} · ${selectedDog.breed ?? t("dog.unknown")}` : t("onboarding.body")}</Text></View><Avatar emoji={selectedDog.avatar} photoUri={selectedDog.photoUri} size={64} /></View>
    <View style={styles.dogSwitcher}>{snapshot.dogs.map((dog) => <Pressable key={dog.id} accessibilityRole="button" accessibilityState={{ selected: dog.id === selectedDogId }} onPress={() => setSelectedDogId(dog.id)} style={[styles.dogSwitcherItem, dog.id === selectedDogId && styles.dogSwitcherItemActive]}><Avatar emoji={dog.avatar} photoUri={dog.photoUri} size={30} /><Text style={[styles.dogSwitcherText, dog.id === selectedDogId && styles.dogSwitcherTextActive]}>{dog.name}</Text></Pressable>)}{snapshot.dogs.length < 2 ? <IconButton label={t("profile.addDog")} onPress={() => router.push("/onboarding")}>＋</IconButton> : null}</View>
    {!hasDog ? <Card tone="moss" style={styles.permissionCard}><Text style={styles.cardTitle}>{t("onboarding.title")}</Text><Text style={styles.cardBody}>{t("onboarding.body")}</Text><Button onPress={() => router.push("/onboarding")}>{t("profile.addDog")}</Button></Card> : null}
    <Card tone="sun" style={styles.hero}>
      <View style={styles.heroCopy}><Text style={styles.heroLabel}>{t("today.next")}</Text>{plan ? <Text style={styles.heroTime}>{time(plan.at, locale)}</Text> : <Text style={styles.heroTime}>—</Text>}<Text style={styles.heroCountdown}>{plan ? `${t("today.inAbout")} ${countdownLabel}` : t("today.noReminder")}</Text><Text style={styles.heroReason}>{plan ? t(`reason.${plan.reasonCode}`) : t("today.noReminder")}</Text></View>
      <View accessibilityLabel={plan ? `${t("today.next")} ${time(plan.at, locale)}` : t("today.noReminder")} style={styles.progressBarTrack}><View style={[styles.progressBarFill, { width: `${Math.round(progressRatio * 100)}%` }]} /></View>
    </Card>
    {hasDog ? <Card style={styles.weatherCard}><View style={styles.weatherHeader}><View><Text style={styles.weatherEyebrow}>{t("weather.title")}</Text><Text style={styles.weatherSummary}>{weather?.hours[0] ? t(`weather.${weather.hours[0].summaryKey}`) : weatherLoading ? t("weather.loading") : t("weather.unavailable")}</Text></View><Button variant="secondary" onPress={() => void refreshWeather()} disabled={weatherLoading}>{weatherLoading ? "…" : t("weather.refresh")}</Button></View>{weather?.hours.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weatherHours}>{weather.hours.map((hour, index) => <View key={hour.at} style={[styles.weatherHour, index === 0 && styles.weatherHourNow]}><Text style={styles.weatherTime}>{index === 0 ? t("weather.now") : new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(hour.at))}</Text><Text style={styles.weatherIcon}>{hour.icon}</Text><Text style={styles.weatherTemp}>{Math.round(hour.temperature)}°</Text><Text style={[styles.weatherAdvice, hour.advice === "good" ? styles.weatherGood : hour.advice === "short" ? styles.weatherShort : styles.weatherWait]}>{hour.advice === "good" ? t("weather.good") : hour.advice === "short" ? t("weather.short") : t("weather.wait")}</Text></View>)}</ScrollView> : <Text style={styles.weatherHint}>{weatherError ? t("weather.error") : t("weather.permission")}</Text>}<Text style={styles.weatherAttribution}>{t("weather.source")}</Text></Card> : null}
    <Card tone={snapshot.settings.remindersEnabled ? "moss" : "surface"} style={styles.permissionCard}><View style={styles.rowBetween}><View style={styles.reminderCopy}><Text style={styles.cardTitle}>{snapshot.settings.remindersEnabled ? t("profile.notificationOn") : t("profile.notificationOff")}</Text><Text style={styles.cardBody}>{snapshot.settings.remindersEnabled ? t("today.reminderOnBody") : t("notifications.body")}</Text></View><Pill active={snapshot.settings.remindersEnabled} onPress={() => void toggleReminders()}>{snapshot.settings.remindersEnabled ? t("common.on") : t("common.off")}</Pill></View>{snapshot.settings.remindersEnabled ? <View style={styles.rowBetween}><View style={styles.reminderCopy}><Text style={styles.cardTitle}>{snapshot.settings.responsible ? t("today.responsible") : t("today.away")}</Text><Text style={styles.cardBody}>{t("today.reason")}: {plan ? t(`reason.${plan.reasonCode}`) : t("today.noReminder")}</Text></View><Pressable accessibilityRole="switch" accessibilityState={{ checked: snapshot.settings.responsible }} onPress={toggleResponsible} style={[styles.switch, snapshot.settings.responsible && styles.switchOn]}><View style={[styles.switchKnob, snapshot.settings.responsible && styles.switchKnobOn]} /></Pressable></View> : <Button variant="secondary" onPress={() => void enable()}>{t("notifications.allow")}</Button>}</Card>
    {hasDog ? <Button onPress={() => setLogVisible(true)}>✦ {t("today.log")} · {selectedDog.name}</Button> : null}
    <SectionTitle title={t("today.routine")} />
    {hasDog ? <View style={styles.routineGroup}><View style={styles.routineRow}><Pill style={styles.quickChip} onPress={() => recordRoutine("wake", t("today.wake"))}>☀️ {t("today.wake")}</Pill><Pill style={styles.quickChip} onPress={() => recordRoutine("meal", t("today.meal"))}>🍽️ {t("today.meal")}</Pill><Pill style={styles.quickChip} onPress={() => recordRoutine("drink", t("today.drink"))}>💧 {t("today.drink")}</Pill><Pill style={styles.quickChip} onPress={() => recordRoutine("play", t("today.play"))}>🎾 {t("today.play")}</Pill><Pill style={styles.quickChip} onPress={() => recordRoutine("walk", t("today.walk"))}>🐾 {t("today.walk")}</Pill><Pill style={styles.quickChip} onPress={() => recordRoutine("sleep", t("today.sleep"))}>😴 {t("today.sleep")}</Pill></View>{routineMessage ? <Text accessibilityLiveRegion="polite" style={styles.savedMessage}>✓ {routineMessage}</Text> : null}</View> : null}
    <SectionTitle title={t("today.last")} action={t("nav.log")} onAction={() => router.push("/(tabs)/log")} />
    {selectedEvents.length ? <Card>{selectedEvents.map((event) => <View key={event.id} style={styles.eventRow}><View style={[styles.eventDot, event.location === "inside" && styles.eventDotInside]} /><View style={styles.eventCopy}><Text style={styles.eventTitle}>{event.kind === "pee" ? t("log.pee") : t("log.poo")} {event.location === "outside" ? t("common.outside") : t("common.inside")}</Text><Text style={styles.eventMeta}>{time(event.occurredAt, locale)} · {date(event.occurredAt, locale)}</Text></View></View>)}</Card> : <EmptyState title={t("today.noReminder")} body={t("today.noReminderBody")} />}
    {snapshot.dogs.length > 1 ? <><SectionTitle title={t("today.agenda")} /><Card>{snapshot.dogs.map((dog) => { const dogPlan = planFor(dog.id); return <Pressable key={dog.id} accessibilityRole="button" onPress={() => setSelectedDogId(dog.id)} style={styles.agendaRow}><Avatar emoji={dog.avatar} size={34} /><View style={styles.eventCopy}><Text style={styles.eventTitle}>{dog.name}</Text><Text style={styles.eventMeta}>{dogPlan ? `${t("today.next")}: ${time(dogPlan.at, locale)}` : t("today.noReminder")}</Text></View><Text style={styles.chevron}>›</Text></Pressable>; })}</Card></> : null}
    <LogSheet visible={logVisible} onClose={() => setLogVisible(false)} />
  </Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { ...typography.small, color: colors.primary, letterSpacing: 0.2 },
  title: { ...typography.display, color: colors.text, marginTop: 3 },
  subtle: { ...typography.small, color: colors.muted, marginTop: 4 },
  dogSwitcher: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  dogSwitcherItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 44, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  dogSwitcherItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dogSwitcherText: { ...typography.body, color: colors.text, fontWeight: "700" },
  dogSwitcherTextActive: { color: "#FFFFFF" },
  hero: { minHeight: 170, gap: spacing.md },
  heroCopy: { flex: 1, gap: spacing.xs },
  heroLabel: { ...typography.small, color: colors.primaryDark },
  heroTime: { ...typography.display, color: colors.text },
  heroCountdown: { ...typography.body, color: colors.text, fontWeight: "700" },
  heroReason: { ...typography.body, color: colors.primaryDark },
  progressBarTrack: { height: 10, borderRadius: 5, backgroundColor: "rgba(47,107,95,0.16)", overflow: "hidden" },
  progressBarFill: { height: 10, borderRadius: 5, backgroundColor: colors.primary },
  permissionCard: { gap: spacing.sm },
  reminderCopy: { flex: 1, gap: 2 },
  weatherCard: { gap: spacing.md },
  weatherHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  weatherEyebrow: { ...typography.small, color: colors.primary },
  weatherSummary: { ...typography.heading, color: colors.text, marginTop: 2 },
  weatherHours: { gap: spacing.sm },
  weatherHour: { width: 76, minHeight: 114, borderRadius: 16, padding: spacing.sm, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceAlt, gap: 3 },
  weatherHourNow: { backgroundColor: colors.moss, borderWidth: 1, borderColor: colors.primary },
  weatherTime: { ...typography.small, color: colors.muted },
  weatherIcon: { fontSize: 23, marginVertical: 2 },
  weatherTemp: { ...typography.heading, color: colors.text },
  weatherAdvice: { ...typography.small, textAlign: "center", fontSize: 10, lineHeight: 13 },
  weatherGood: { color: colors.success },
  weatherShort: { color: colors.attention },
  weatherWait: { color: colors.muted },
  weatherHint: { ...typography.small, color: colors.muted },
  weatherAttribution: { ...typography.small, color: colors.muted, fontSize: 10 },
  cardTitle: { ...typography.heading, color: colors.text },
  cardBody: { ...typography.body, color: colors.muted },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  switch: { width: 52, height: 31, borderRadius: 16, padding: 3, backgroundColor: colors.border, justifyContent: "center" },
  switchOn: { backgroundColor: colors.primary },
  switchKnob: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.surface },
  switchKnobOn: { alignSelf: "flex-end" },
  routineRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  quickChip: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, minHeight: 42 },
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
