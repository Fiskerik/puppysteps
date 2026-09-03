import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../src/store/AppStore";
import { Button, Card, EmptyState, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { LogSheet } from "../../src/ui/LogSheet";
import { colors, spacing, typography } from "../../src/ui/theme";

const dateTime = (iso: string, locale: string): string => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default function LogScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ dogId?: string }>();
  const { snapshot, selectedDog, selectedDogId, setSelectedDogId, removeCheckIn } = useAppStore();
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (params.dogId && snapshot.dogs.some((dog) => dog.id === params.dogId)) setSelectedDogId(params.dogId); }, [params.dogId, setSelectedDogId, snapshot.dogs]);
  const dogEvents = useMemo(() => snapshot.eliminations.filter((event) => event.dogId === selectedDogId), [selectedDogId, snapshot.eliminations]);
  const dogCheckIns = useMemo(() => snapshot.checkIns.filter((checkIn) => checkIn.dogId === selectedDogId), [selectedDogId, snapshot.checkIns]);
  const hasDog = selectedDog.id !== "no-dog";
  const deleteEvent = (checkInId: string) => Alert.alert(t("log.deleteConfirm"), undefined, [{ text: t("common.cancel"), style: "cancel" }, { text: t("log.deleteAction"), style: "destructive", onPress: () => { if (!removeCheckIn(checkInId)) Alert.alert(t("today.saveError")); } }]);
  return <Screen>
    <View style={styles.header}><View><Text style={styles.eyebrow}>{t("nav.log")}</Text><Text style={styles.title}>{selectedDog.name}</Text><Text style={styles.subtle}>{t("today.subtle")}</Text></View></View>
    <View style={styles.dogRow}>{snapshot.dogs.map((dog) => <Pill key={dog.id} active={dog.id === selectedDogId} onPress={() => setSelectedDogId(dog.id)}>{dog.name}</Pill>)}</View>
    {hasDog ? <Button onPress={() => setVisible(true)}>{t("today.log")}</Button> : <><EmptyState title={t("onboarding.title")} body={t("onboarding.body")} /><Button onPress={() => router.push("/onboarding")}>{t("profile.addDog")}</Button></>}
    <SectionTitle title={t("log.history")} />
    {dogCheckIns.length ? <Card>{dogCheckIns.map((checkIn) => { const events = dogEvents.filter((event) => event.checkInId === checkIn.id); return <Pressable key={checkIn.id} accessibilityRole="button" accessibilityLabel={`${t("log.deleteAction")}: ${dateTime(checkIn.occurredAt, snapshot.settings.locale)}`} onPress={() => deleteEvent(checkIn.id)} style={styles.item}><View style={styles.itemIcon}><Text>{checkIn.nothing ? "…" : events.some((event) => event.location === "inside") ? "!" : "✓"}</Text></View><View style={styles.itemCopy}><Text style={styles.itemTitle}>{checkIn.nothing ? t("log.nothing") : events.map((event) => `${event.kind === "pee" ? t("log.pee") : t("log.poo")} ${event.location === "outside" ? t("common.outside") : t("common.inside")}`).join(" · ")}</Text><Text style={styles.itemMeta}>{dateTime(checkIn.occurredAt, snapshot.settings.locale)}{checkIn.notes ? ` · ${checkIn.notes}` : ""}</Text></View>{checkIn.photoUri ? <Image source={{ uri: checkIn.photoUri }} style={styles.photoThumb} /> : null}<Text style={styles.more}>⋯</Text></Pressable>; })}<Text style={styles.hint}>{t("log.hint")}</Text></Card> : <EmptyState title={t("log.emptyTitle")} body={t("log.emptyBody")} />}
    <LogSheet visible={visible} onClose={() => setVisible(false)} />
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md },
  eyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { ...typography.display, color: colors.text, marginTop: 3 },
  subtle: { ...typography.body, color: colors.muted, marginTop: 5, maxWidth: 250 },
  dogRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  item: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.moss, alignItems: "center", justifyContent: "center" },
  itemIconText: { ...typography.heading, color: colors.primary },
  itemCopy: { flex: 1, gap: 3 },
  itemTitle: { ...typography.body, color: colors.text, fontWeight: "800" },
  itemMeta: { ...typography.small, color: colors.muted },
  photoThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.surfaceAlt },
  more: { fontSize: 24, color: colors.muted },
  hint: { ...typography.small, color: colors.muted, marginTop: spacing.md },
});
