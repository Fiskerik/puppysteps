import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { PUPPY_TIMELINE, ageInDays, ageLabelForDays, type TimelineStage } from "../../src/content/puppyTimeline";
import { useAppStore } from "../../src/store/AppStore";
import { Button, Card, EmptyState, Field, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { colors, spacing, typography } from "../../src/ui/theme";

const shortDate = (iso: string, locale: string): string => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

type StageState = "complete" | "current" | "upcoming";

const stateForStage = (stage: TimelineStage, days: number | null): StageState => {
  if (days === null) return "upcoming";
  if (days >= stage.maxDays) return "complete";
  if (days >= stage.minDays) return "current";
  return "upcoming";
};

export default function JourneyScreen() {
  const { t } = useTranslation();
  const { snapshot, selectedDog, addMilestone, toggleMilestone } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const days = ageInDays(selectedDog.birthDate);
  const currentStage = useMemo(() => PUPPY_TIMELINE.find((stage) => days !== null && days >= stage.minDays && days < stage.maxDays) ?? null, [days]);
  const [expandedByDog, setExpandedByDog] = useState<Record<string, string | null>>({});
  const milestones = useMemo(() => snapshot.milestones.filter((item) => item.dogId === selectedDog.id), [selectedDog.id, snapshot.milestones]);
  const hasDog = selectedDog.id !== "no-dog";
  const progress = days === null ? 0 : Math.max(0, Math.min(1, days / 366));
  const hasExpandedPreference = Object.prototype.hasOwnProperty.call(expandedByDog, selectedDog.id);
  const expanded = hasExpandedPreference ? expandedByDog[selectedDog.id] ?? null : currentStage?.id ?? PUPPY_TIMELINE[0]?.id ?? null;
  const setExpanded = (stageId: string | null) => setExpandedByDog((current) => ({ ...current, [selectedDog.id]: stageId }));

  const save = () => {
    if (!addMilestone(title)) {
      Alert.alert(t("journey.saveError"));
      return;
    }
    setTitle("");
    setVisible(false);
  };
  const openSource = async (stage: TimelineStage) => {
    try {
      if (!(await Linking.canOpenURL(stage.sourceUrl))) throw new Error("Unsupported URL");
      await Linking.openURL(stage.sourceUrl);
    } catch (error) {
      console.warn("Could not open timeline source", error);
      Alert.alert("Could not open source", "Please check your connection and try again.");
    }
  };

  return <Screen>
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{t("nav.journey")}</Text>
      <Text style={styles.title}>{selectedDog.name}&apos;s first year</Text>
      <Text style={styles.subtitle}>A practical age-by-age guide. Repeat what helps, make hard steps easier, and follow your puppy rather than the calendar.</Text>
    </View>

    <Card tone="moss" style={styles.progressCard}>
      <View style={styles.progressTop}>
        <View style={styles.progressCopy}>
          <Text style={styles.progressEyebrow}>{ageLabelForDays(days)}</Text>
          <Text style={styles.progressTitle}>{currentStage?.title ?? (days === null ? "Add a birth date to personalise the plan" : "The first year is complete")}</Text>
        </View>
        <Text style={styles.progressPaw}>🐾</Text>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} /></View>
      <Text style={styles.progressHint}>{days === null ? "You can still browse every stage below." : `${Math.round(progress * 100)}% through the first-year guide · timing varies by breed and individual`}</Text>
    </Card>

    <View style={styles.notice}>
      <Text style={styles.noticeIcon}>♡</Text>
      <Text style={styles.noticeText}>Evidence-informed guidance for puppies in Sweden · Content review: September 2026 · Medical decisions belong with your veterinarian.</Text>
    </View>

    <SectionTitle eyebrow="AGE-BY-AGE" title="Puppy timeline" />
    <View style={styles.timeline}>
      {PUPPY_TIMELINE.map((stage, index) => {
        const stageState = stateForStage(stage, days);
        const isOpen = expanded === stage.id;
        return <View key={stage.id} style={styles.stageRow}>
          <View style={styles.rail}>
            {index < PUPPY_TIMELINE.length - 1 ? <View style={[styles.line, stageState === "complete" && styles.lineComplete]} /> : null}
            <View style={[styles.dot, stageState === "current" && styles.dotCurrent, stageState === "complete" && styles.dotComplete]}>
              <Text style={[styles.dotText, stageState === "current" && styles.dotTextCurrent]}>{stageState === "complete" ? "✓" : index + 1}</Text>
            </View>
          </View>
          <Card style={StyleSheet.flatten([styles.stageCard, stageState === "current" ? styles.stageCardCurrent : undefined])}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setExpanded(isOpen ? null : stage.id)}>
              <View style={styles.stageHeading}>
                <View style={styles.stageHeadingCopy}>
                  <Text style={styles.stageAge}>{stage.ageLabel}</Text>
                  <Text style={styles.stageTitle}>{stage.icon} {stage.title}</Text>
                </View>
                {stageState === "current" ? <Pill active>Now</Pill> : <Text style={styles.expandIcon}>{isOpen ? "−" : "+"}</Text>}
              </View>
              <Text style={styles.stageSummary}>{stage.summary}</Text>
            </Pressable>
            {isOpen ? <View style={styles.stageDetails}>
              <Text style={styles.actionLabel}>EASY NEXT STEPS</Text>
              {stage.actions.map((action, actionIndex) => <View key={action} style={styles.actionRow}>
                <View style={styles.actionNumber}><Text style={styles.actionNumberText}>{actionIndex + 1}</Text></View>
                <Text style={styles.actionText}>{action}</Text>
              </View>)}
              <View style={styles.safetyBox}><Text style={styles.safetyTitle}>Keep it safe</Text><Text style={styles.safetyText}>{stage.safety}</Text></View>
              <Pressable accessibilityRole="link" onPress={() => void openSource(stage)} hitSlop={6}>
                <Text style={styles.source}>Read the source · {stage.sourceLabel} ↗</Text>
              </Pressable>
            </View> : null}
          </Card>
        </View>;
      })}
    </View>

    <SectionTitle eyebrow="YOUR MEMORIES" title="Personal milestones" action={hasDog ? `＋ ${t("common.add")}` : undefined} onAction={() => setVisible(true)} />
    {milestones.length ? <View style={styles.memoryList}>{milestones.map((milestone) => <Pressable key={milestone.id} accessibilityRole="checkbox" accessibilityState={{ checked: milestone.completed }} onPress={() => { if (!toggleMilestone(milestone)) Alert.alert(t("journey.saveError")); }} style={styles.memoryRow}>
      <View style={[styles.memoryCheck, milestone.completed && styles.memoryCheckDone]}><Text style={styles.memoryCheckText}>{milestone.completed ? "✓" : ""}</Text></View>
      <View style={styles.memoryCopy}><Text style={styles.memoryDate}>{shortDate(milestone.date, snapshot.settings.locale)}</Text><Text style={styles.memoryTitle}>{milestone.title}</Text></View>
    </Pressable>)}</View> : <EmptyState title={t("journey.empty")} body={t("journey.emptyBody")} />}

    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}>
        <View style={styles.overlay}>
          <Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} style={styles.backdrop} onPress={() => setVisible(false)} />
          <View style={styles.sheet}>
            <Card style={styles.modal}>
              <Text style={styles.modalTitle}>{t("journey.add")}</Text>
              <Field label={t("journey.addPrompt")} value={title} onChangeText={setTitle} placeholder="First puppy class" autoFocus returnKeyType="done" onSubmitEditing={title.trim() ? save : undefined} />
              <View style={styles.modalActions}><Button variant="ghost" onPress={() => setVisible(false)}>{t("common.cancel")}</Button><Button onPress={save} disabled={!title.trim()}>{t("common.save")}</Button></View>
            </Card>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  eyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, maxWidth: 350, marginTop: 4 },
  progressCard: { gap: spacing.md },
  progressTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  progressCopy: { flex: 1, gap: 2 },
  progressEyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 0.8 },
  progressTitle: { ...typography.heading, color: colors.text },
  progressPaw: { fontSize: 32 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: "rgba(47,107,95,0.14)", overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  progressHint: { ...typography.small, color: colors.muted },
  notice: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start", paddingHorizontal: spacing.xs },
  noticeIcon: { fontSize: 20, color: colors.terracotta },
  noticeText: { ...typography.small, color: colors.muted, flex: 1 },
  timeline: { gap: 0 },
  stageRow: { flexDirection: "row", alignItems: "stretch" },
  rail: { width: 34, alignItems: "center" },
  line: { position: "absolute", top: 32, bottom: -2, width: 2, backgroundColor: colors.border },
  lineComplete: { backgroundColor: colors.primary },
  dot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", zIndex: 1 },
  dotCurrent: { borderColor: colors.terracotta, backgroundColor: colors.terracotta },
  dotComplete: { borderColor: colors.primary, backgroundColor: colors.primary },
  dotText: { ...typography.small, color: colors.muted },
  dotTextCurrent: { color: "#FFFFFF" },
  stageCard: { flex: 1, marginLeft: spacing.sm, marginBottom: spacing.md, gap: spacing.md, padding: spacing.md },
  stageCardCurrent: { borderWidth: 2, borderColor: colors.terracotta },
  stageHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  stageHeadingCopy: { flex: 1, gap: 2 },
  stageAge: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 0.7 },
  stageTitle: { ...typography.heading, color: colors.text },
  stageSummary: { ...typography.body, color: colors.muted, marginTop: spacing.sm },
  expandIcon: { fontSize: 24, color: colors.primary, fontWeight: "400" },
  stageDetails: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.sm },
  actionLabel: { ...typography.small, color: colors.primary, letterSpacing: 0.9 },
  actionRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  actionNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.moss, alignItems: "center", justifyContent: "center", marginTop: 1 },
  actionNumberText: { ...typography.small, color: colors.primaryDark },
  actionText: { ...typography.body, color: colors.text, flex: 1 },
  safetyBox: { backgroundColor: "#FFF4EC", borderRadius: 15, padding: spacing.md, gap: 3, marginTop: spacing.xs },
  safetyTitle: { ...typography.small, color: colors.attention, textTransform: "uppercase", letterSpacing: 0.7 },
  safetyText: { ...typography.body, color: colors.text },
  source: { ...typography.small, color: colors.primary, textDecorationLine: "underline", paddingVertical: spacing.xs },
  memoryList: { gap: spacing.sm },
  memoryRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: 18, padding: spacing.md },
  memoryCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  memoryCheckDone: { backgroundColor: colors.primary },
  memoryCheckText: { color: "#FFFFFF", fontWeight: "800" },
  memoryCopy: { flex: 1, gap: 2 },
  memoryDate: { ...typography.small, color: colors.primary },
  memoryTitle: { ...typography.heading, color: colors.text },
  keyboardView: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(32,51,43,0.28)", justifyContent: "flex-end" },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  sheet: { width: "100%" },
  modal: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, gap: spacing.lg, paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg },
  modalTitle: { ...typography.title, color: colors.text },
  modalActions: { flexDirection: "row", gap: spacing.sm },
});
