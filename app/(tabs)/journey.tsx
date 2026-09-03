import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../src/store/AppStore";
import { Button, Card, EmptyState, Field, Screen, SectionTitle } from "../../src/ui/Primitives";
import { colors, spacing, typography } from "../../src/ui/theme";

const shortDate = (iso: string, locale: string): string => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

export default function JourneyScreen() {
  const { t } = useTranslation();
  const { snapshot, selectedDog, addMilestone, toggleMilestone } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const milestones = useMemo(() => snapshot.milestones.filter((item) => item.dogId === selectedDog.id), [selectedDog.id, snapshot.milestones]);
  const hasDog = selectedDog.id !== "no-dog";
  const save = () => { addMilestone(title); setTitle(""); setVisible(false); };
    return <Screen><View style={styles.header}><Text style={styles.eyebrow}>{t("nav.journey")}</Text><Text style={styles.title}>{t("journey.title")}</Text><Text style={styles.subtitle}>{t("journey.subtitle")}</Text></View><Card tone="moss" style={styles.intro}><Text style={styles.introEmoji}>🌱</Text><View style={styles.introCopy}><Text style={styles.introTitle}>{selectedDog.name} {t("journey.growthTitle")}</Text><Text style={styles.introBody}>{t("journey.growthBody")}</Text></View></Card><SectionTitle title={t("journey.milestones")} action={hasDog ? `＋ ${t("common.add")}` : undefined} onAction={() => setVisible(true)} />{milestones.length ? <View style={styles.timeline}>{milestones.map((milestone, index) => <Pressable key={milestone.id} accessibilityRole="checkbox" accessibilityState={{ checked: milestone.completed }} onPress={() => toggleMilestone(milestone)} style={styles.milestone}><View style={styles.rail}>{index < milestones.length - 1 ? <View style={styles.line} /> : null}<View style={[styles.dot, milestone.completed && styles.dotCompleted]}><Text style={styles.dotText}>{milestone.completed ? "✓" : ""}</Text></View></View><View style={styles.milestoneCard}><Text style={styles.milestoneDate}>{shortDate(milestone.date, snapshot.settings.locale)}</Text><Text style={[styles.milestoneTitle, milestone.completed && styles.completed]}>{milestone.title}</Text>{milestone.custom ? <Text style={styles.custom}>{t("journey.custom")}</Text> : null}</View></Pressable>)}</View> : <EmptyState title={t("journey.empty")} body={t("journey.emptyBody")} />}
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}><View style={styles.overlay}><Card style={styles.modal}><Text style={styles.modalTitle}>{t("journey.add")}</Text><Field label={t("journey.addPrompt")} value={title} onChangeText={setTitle} placeholder="Första valpkursen" autoFocus /><View style={styles.modalActions}><Button variant="ghost" onPress={() => setVisible(false)}>{t("common.cancel")}</Button><Button onPress={save} disabled={!title.trim()}>{t("common.save")}</Button></View></Card></View></Modal>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  eyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, maxWidth: 330, marginTop: 4 },
  intro: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  introEmoji: { fontSize: 35 },
  introCopy: { flex: 1, gap: 3 },
  introTitle: { ...typography.heading, color: colors.text },
  introBody: { ...typography.body, color: colors.muted },
  timeline: { gap: 0 },
  milestone: { flexDirection: "row", minHeight: 86 },
  rail: { width: 30, alignItems: "center" },
  line: { position: "absolute", top: 28, bottom: -2, width: 2, backgroundColor: colors.border },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", zIndex: 1 },
  dotCompleted: { backgroundColor: colors.primary },
  dotText: { color: "#FFFFFF", fontWeight: "800" },
  milestoneCard: { flex: 1, paddingLeft: spacing.md, paddingBottom: spacing.lg, gap: 3 },
  milestoneDate: { ...typography.small, color: colors.primary },
  milestoneTitle: { ...typography.heading, color: colors.text },
  completed: { color: colors.text },
  custom: { ...typography.small, color: colors.muted },
  overlay: { flex: 1, backgroundColor: "rgba(32,51,43,0.28)", justifyContent: "flex-end" },
  modal: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, gap: spacing.lg },
  modalTitle: { ...typography.title, color: colors.text },
  modalActions: { flexDirection: "row", gap: spacing.sm },
});
