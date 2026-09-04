import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { PUPPY_TIMELINE, ageInDays, ageLabelForDays, type TimelineStage } from "../../src/content/puppyTimeline";
import { useAppStore } from "../../src/store/AppStore";
import type { Milestone } from "../../src/domain/models";
import { Button, Card, DatePickerField, EmptyState, Field, InfoButton, InfoSheet, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { pickLocalPhoto } from "../../src/ui/photoPicker";
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
  const { snapshot, selectedDog, addMilestone, updateMilestone, toggleMilestone } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [milestoneDate, setMilestoneDate] = useState(new Date().toISOString());
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const days = ageInDays(selectedDog.birthDate);
  const currentStage = useMemo(() => PUPPY_TIMELINE.find((stage) => days !== null && days >= stage.minDays && days < stage.maxDays) ?? null, [days]);
  const [expandedByDog, setExpandedByDog] = useState<Record<string, string | null>>({});
  const milestones = useMemo(() => snapshot.milestones.filter((item) => item.dogId === selectedDog.id), [selectedDog.id, snapshot.milestones]);
  const hasDog = selectedDog.id !== "no-dog";
  const progress = days === null ? 0 : Math.max(0, Math.min(1, days / 366));
  const hasExpandedPreference = Object.prototype.hasOwnProperty.call(expandedByDog, selectedDog.id);
  const expanded = hasExpandedPreference ? expandedByDog[selectedDog.id] ?? null : currentStage?.id ?? PUPPY_TIMELINE[0]?.id ?? null;
  const setExpanded = (stageId: string | null) => setExpandedByDog((current) => ({ ...current, [selectedDog.id]: stageId }));

  const openAddMilestone = () => { setEditingMilestone(null); setTitle(""); setDescription(""); setMilestoneDate(new Date().toISOString()); setPhotoUri(null); setVisible(true); };
  const openEditMilestone = (milestone: Milestone) => { setEditingMilestone(milestone); setTitle(milestone.title); setDescription(milestone.description ?? ""); setMilestoneDate(milestone.date); setPhotoUri(milestone.photoUri); setVisible(true); };
  const closeMilestoneEditor = () => { setVisible(false); setEditingMilestone(null); setTitle(""); setDescription(""); setPhotoUri(null); };
  const chooseMilestonePhoto = async (source: "camera" | "library") => { setPhotoBusy(true); try { const uri = await pickLocalPhoto(source); if (uri) setPhotoUri(uri); } catch (error) { console.warn("Could not attach milestone photo", error); Alert.alert(t("log.photoError")); } finally { setPhotoBusy(false); } };
  const openPhotoOptions = () => Alert.alert(t("journey.photo"), undefined, [{ text: t("log.takePhoto"), onPress: () => void chooseMilestonePhoto("camera") }, { text: t("log.choosePhoto"), onPress: () => void chooseMilestonePhoto("library") }, ...(photoUri ? [{ text: t("log.removePhoto"), onPress: () => setPhotoUri(null) }] : []), { text: t("common.cancel"), style: "cancel" }]);
  const save = () => {
    const input = { title, date: milestoneDate, description: description.trim() || null, photoUri };
    const saved = editingMilestone ? updateMilestone({ ...editingMilestone, ...input }) : addMilestone(input);
    if (!saved) {
      Alert.alert(t("journey.saveError"));
      return;
    }
    closeMilestoneEditor();
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

  return <Screen density="compact">
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{t("nav.journey")}</Text>
      <Text style={styles.title}>{t("journey.firstYear", { defaultValue: "{{name}}'s first year", name: selectedDog.name })}</Text>
    </View>

    <Card tone="moss" density="compact" style={styles.progressCard}>
      <View style={styles.progressTop}>
        <MaterialCommunityIcons name="calendar-heart-outline" size={24} color={colors.primary} />
        <View style={styles.progressCopy}>
          <Text style={styles.progressEyebrow}>{ageLabelForDays(days)}</Text>
          <Text numberOfLines={1} style={styles.progressTitle}>{currentStage?.title ?? (days === null ? t("journey.progressMissingBirthDate", { defaultValue: "Add a birth date to personalise" }) : t("journey.progressComplete", { defaultValue: "The first year is complete" }))}</Text>
        </View>
        <Text style={styles.progressValue}>{days === null ? "—" : `${Math.round(progress * 100)}%`}</Text>
        <InfoButton label={t("journey.guideInfoLabel", { defaultValue: "About this guidance" })} onPress={() => setInfoVisible(true)} />
      </View>
      <View accessible accessibilityLabel={days === null ? t("journey.guideInfoLabel", { defaultValue: "First-year guide" }) : `${Math.round(progress * 100)}% ${t("journey.firstYear", { defaultValue: "through the first-year guide", name: selectedDog.name })}`} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} /></View>
    </Card>

    <SectionTitle eyebrow={t("journey.timelineEyebrow", { defaultValue: "Age by age" })} title={t("journey.timelineTitle", { defaultValue: "Puppy timeline" })} />
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
              <Text style={styles.actionLabel}>{t("journey.easyNextSteps", { defaultValue: "Easy next steps" })}</Text>
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

    <SectionTitle eyebrow={t("journey.memoriesEyebrow", { defaultValue: "Your memories" })} title={t("journey.milestones")} action={hasDog ? `＋ ${t("common.add")}` : undefined} onAction={openAddMilestone} />
    {milestones.length ? <View style={styles.memoryList}>{milestones.map((milestone) => <Pressable key={milestone.id} accessibilityRole="checkbox" accessibilityState={{ checked: milestone.completed }} onPress={() => { if (!toggleMilestone(milestone)) Alert.alert(t("journey.saveError")); }} onLongPress={() => openEditMilestone(milestone)} delayLongPress={350} style={styles.memoryRow}>
      <View style={[styles.memoryCheck, milestone.completed && styles.memoryCheckDone]}><Text style={styles.memoryCheckText}>{milestone.completed ? "✓" : ""}</Text></View>
      <View style={styles.memoryCopy}><Text style={styles.memoryDate}>{shortDate(milestone.date, snapshot.settings.locale)}</Text><Text style={styles.memoryTitle}>{milestone.title}</Text>{milestone.description ? <Text style={styles.memoryDescription}>{milestone.description}</Text> : null}</View>{milestone.photoUri ? <Image source={{ uri: milestone.photoUri }} style={styles.memoryPhoto} /> : null}
    </Pressable>)}</View> : <EmptyState title={t("journey.empty")} body={t("journey.emptyBody")} />}

    <Modal visible={visible} animationType="slide" transparent onRequestClose={closeMilestoneEditor}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}>
        <View style={styles.overlay}>
          <Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} style={styles.backdrop} onPress={closeMilestoneEditor} />
          <View style={styles.sheet}>
            <Card style={styles.modal}>
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>{editingMilestone ? t("journey.edit") : t("journey.add")}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={closeMilestoneEditor}><Text style={styles.modalClose}>×</Text></Pressable></View>
              <Field label={t("journey.addPrompt")} value={title} onChangeText={setTitle} placeholder="First puppy class" autoFocus returnKeyType="done" onSubmitEditing={title.trim() ? save : undefined} />
              <DatePickerField label={t("journey.date")} value={milestoneDate} onChange={setMilestoneDate} locale={snapshot.settings.locale} doneLabel={t("common.done")} maximumDate={new Date()} />
              <Field label={t("journey.description")} value={description} onChangeText={setDescription} multiline numberOfLines={3} style={styles.descriptionField} />
              <View style={styles.photoRow}><Text style={styles.fieldLabel}>{t("journey.photo")}</Text><Button variant="secondary" onPress={() => openPhotoOptions()} disabled={photoBusy}>{photoBusy ? t("log.photoAdding") : t("journey.attachPhoto")}</Button></View>
              {photoUri ? <View style={styles.milestonePreview}><Image source={{ uri: photoUri }} style={styles.milestoneImage} /><Pressable accessibilityRole="button" accessibilityLabel={t("log.removePhoto")} onPress={() => setPhotoUri(null)} style={styles.photoRemove}><Text style={styles.photoRemoveText}>×</Text></Pressable></View> : <Text style={styles.photoHint}>{t("journey.photoHint")}</Text>}
              <View style={styles.modalActions}><Button variant="ghost" onPress={closeMilestoneEditor}>{t("common.cancel")}</Button><Button onPress={save} disabled={!title.trim() || photoBusy}>{t("common.save")}</Button></View>
            </Card>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    <InfoSheet visible={infoVisible} onClose={() => setInfoVisible(false)} title={t("journey.guideInfoTitle", { defaultValue: "About this guide" })} doneLabel={t("common.done")} closeLabel={t("common.close")}>
      <View style={styles.guidanceIntro}>
        <MaterialCommunityIcons name="heart-outline" size={24} color={colors.terracotta} />
        <Text style={styles.guidanceText}>{t("journey.guideInfoBody", { defaultValue: "This guide is evidence-informed and adapted for puppies in Sweden. It is a calm reference, not a race to finish." })}</Text>
      </View>
      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceText}>{t("journey.guideInfoHeart", { defaultValue: "Save the small moments that matter to your family. Repeat what helps and make difficult steps easier." })}</Text>
      </View>
      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceText}>{t("journey.guideInfoSafety", { defaultValue: "Timing varies by breed and individual. Agree health, vaccination, exercise, and care plans with your veterinarian." })}</Text>
      </View>
    </InfoSheet>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  eyebrow: { ...typography.small, color: colors.primary, letterSpacing: 0.5 },
  title: { ...typography.display, color: colors.text },
  progressCard: { gap: spacing.sm },
  progressTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  progressCopy: { flex: 1, gap: 2 },
  progressEyebrow: { ...typography.small, color: colors.primary, letterSpacing: 0.5 },
  progressTitle: { ...typography.body, color: colors.text, fontWeight: "800" },
  progressValue: { ...typography.small, color: colors.primaryDark, fontWeight: "800" },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: "rgba(47,107,95,0.14)", overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: colors.primary },
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
  stageAge: { ...typography.small, color: colors.primary, letterSpacing: 0.4 },
  stageTitle: { ...typography.heading, color: colors.text },
  stageSummary: { ...typography.body, color: colors.muted, marginTop: spacing.sm },
  expandIcon: { fontSize: 24, color: colors.primary, fontWeight: "400" },
  stageDetails: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.sm },
  actionLabel: { ...typography.small, color: colors.primary, letterSpacing: 0.5 },
  actionRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  actionNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.moss, alignItems: "center", justifyContent: "center", marginTop: 1 },
  actionNumberText: { ...typography.small, color: colors.primaryDark },
  actionText: { ...typography.body, color: colors.text, flex: 1 },
  safetyBox: { backgroundColor: "#FFF4EC", borderRadius: 15, padding: spacing.md, gap: 3, marginTop: spacing.xs },
  safetyTitle: { ...typography.small, color: colors.attention, letterSpacing: 0.3 },
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
  memoryDescription: { ...typography.small, color: colors.muted, marginTop: 2 },
  memoryPhoto: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.surfaceAlt },
  keyboardView: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(32,51,43,0.28)", justifyContent: "flex-end" },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  sheet: { width: "100%" },
  modal: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, gap: spacing.lg, paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg },
  modalHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  modalTitle: { ...typography.title, color: colors.text },
  modalClose: { fontSize: 33, lineHeight: 33, color: colors.muted, fontWeight: "300" },
  descriptionField: { minHeight: 84, textAlignVertical: "top", paddingTop: 12 },
  fieldLabel: { ...typography.small, color: colors.text },
  photoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  photoHint: { ...typography.small, color: colors.muted },
  milestonePreview: { height: 150, borderRadius: 18, overflow: "hidden", backgroundColor: colors.surfaceAlt, position: "relative" },
  milestoneImage: { width: "100%", height: "100%" },
  photoRemove: { position: "absolute", top: 8, right: 8, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  photoRemoveText: { fontSize: 26, lineHeight: 28, color: colors.text },
  modalActions: { flexDirection: "row", gap: spacing.sm },
  guidanceIntro: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  guidanceSection: { gap: 3 },
  guidanceText: { ...typography.body, color: colors.muted, flex: 1 },
});
