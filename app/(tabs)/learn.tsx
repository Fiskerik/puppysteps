import React, { useMemo, useState } from "react";
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { LESSONS } from "../../src/content/lessons";
import { useAppStore } from "../../src/store/AppStore";
import { Button, Card, Field, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { colors, spacing, typography } from "../../src/ui/theme";

export default function LearnScreen() {
  const { t } = useTranslation();
  const { snapshot, markLesson } = useAppStore();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = useMemo(() => LESSONS.filter((lesson) => `${lesson.title} ${lesson.summary} ${lesson.tags.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())), [query]);

  return <Screen>
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{t("nav.learn")}</Text>
      <Text style={styles.title}>{t("learn.title")}</Text>
      <Text style={styles.subtitle}>{t("learn.subtitle")}</Text>
    </View>
    <Card tone="moss" style={styles.betaNote}>
      <Text style={styles.betaTitle}>Evidence-informed beta library</Text>
      <Text style={styles.betaBody}>Training content is English-only until each translation is reviewed. Health and vaccination plans should always be agreed with your veterinarian.</Text>
    </Card>
    <Field label={t("learn.search")} value={query} onChangeText={setQuery} placeholder="toilet, leash, rest, biting" returnKeyType="search" />
    <SectionTitle title={`${filtered.length} practical lessons`} />
    {filtered.length ? filtered.map((lesson) => {
      const state = snapshot.lessonProgress[lesson.id] ?? "not_started";
      const isOpen = expanded === lesson.id;
      const nextState = state === "not_started" ? "in_progress" : state === "in_progress" ? "completed" : "in_progress";
      const actionLabel = state === "not_started" ? "Start lesson" : state === "in_progress" ? "Mark complete" : t("learn.practice");
      return <Card key={lesson.id} style={styles.lessonCard}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${isOpen ? "Close" : "Open"} lesson: ${lesson.title}`} accessibilityState={{ expanded: isOpen }} onPress={() => setExpanded(isOpen ? null : lesson.id)}>
          <ImageBackground source={lesson.thumbnail} resizeMode="cover" imageStyle={styles.videoImage} style={styles.video} accessible accessibilityLabel={`Thumbnail for ${lesson.title}`}>
            <View style={styles.videoShade} />
            <View style={styles.openBadge}><Text style={styles.openBadgeText}>{isOpen ? "Hide steps" : "Open lesson"}</Text></View>
            <Text style={styles.videoLabel}>Photo guide · {lesson.duration} {t("learn.minutes")}</Text>
          </ImageBackground>
          <View style={styles.lessonTop}>
            <View style={styles.lessonCopy}>
              <View style={styles.metaRow}><Text style={styles.ageGuide}>{lesson.ageGuide}</Text><Text style={styles.chevron}>{isOpen ? "⌃" : "⌄"}</Text></View>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonSummary}>{lesson.summary}</Text>
            </View>
            <Pill active={state === "completed"}>{state === "completed" ? "✓ Done" : state === "in_progress" ? "In practice" : "New"}</Pill>
          </View>
        </Pressable>
        {isOpen ? <View style={styles.details}>
          <View style={styles.goalBox}><Text style={styles.goalLabel}>GOAL</Text><Text style={styles.goalText}>{lesson.goal}</Text></View>
          <Text style={styles.detailLabel}>TRY IT LIKE THIS</Text>
          {lesson.steps.map((step, index) => <View key={step} style={styles.step}><Text style={styles.stepNumber}>{index + 1}</Text><Text style={styles.stepText}>{step}</Text></View>)}
          <View style={styles.stopBox}><Text style={styles.stopTitle}>When to pause</Text><Text style={styles.stopText}>{lesson.whenToStop}</Text></View>
          <Button variant={state === "completed" ? "secondary" : "primary"} onPress={() => { if (!markLesson(lesson, nextState)) Alert.alert("Progress could not be saved", "Please try again."); }}>{actionLabel}</Button>
        </View> : null}
      </Card>;
    }) : <Card><Text style={styles.noResults}>{t("learn.noResults")}</Text></Card>}
  </Screen>;
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  eyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, maxWidth: 320, marginTop: 4 },
  betaNote: { gap: spacing.xs },
  betaTitle: { ...typography.heading, color: colors.primaryDark },
  betaBody: { ...typography.body, color: colors.text },
  lessonCard: { gap: spacing.md },
  video: { height: 154, borderRadius: 18, overflow: "hidden", backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  videoImage: { borderRadius: 18 },
  videoShade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(25,42,35,0.24)" },
  openBadge: { minHeight: 42, paddingHorizontal: spacing.md, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.94)" },
  openBadgeText: { ...typography.body, color: colors.primaryDark, fontWeight: "800" },
  videoLabel: { ...typography.small, color: "#FFFFFF", backgroundColor: "rgba(32,51,43,0.72)", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12, overflow: "hidden" },
  lessonTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginTop: spacing.md },
  lessonCopy: { flex: 1, gap: 3 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ageGuide: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 0.7 },
  chevron: { ...typography.heading, color: colors.primary },
  lessonTitle: { ...typography.heading, color: colors.text },
  lessonSummary: { ...typography.body, color: colors.muted },
  details: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.sm },
  detailLabel: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1 },
  goalBox: { borderRadius: 16, padding: spacing.md, backgroundColor: colors.moss, gap: 3 },
  goalLabel: { ...typography.small, color: colors.primary, letterSpacing: 0.8 },
  goalText: { ...typography.body, color: colors.text },
  step: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  stepNumber: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.moss, color: colors.primaryDark, textAlign: "center", textAlignVertical: "center", fontWeight: "800" },
  stepText: { ...typography.body, color: colors.text, flex: 1 },
  stopBox: { borderLeftWidth: 3, borderLeftColor: colors.terracotta, paddingLeft: spacing.md, paddingVertical: spacing.xs, gap: 2 },
  stopTitle: { ...typography.small, color: colors.attention, textTransform: "uppercase" },
  stopText: { ...typography.body, color: colors.text },
  noResults: { ...typography.body, color: colors.muted, textAlign: "center" },
});
