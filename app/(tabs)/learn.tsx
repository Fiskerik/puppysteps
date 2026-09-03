import React, { useMemo, useState } from "react";
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { LESSONS, type LessonContent } from "../../src/content/lessons";
import { ageInDays } from "../../src/content/puppyTimeline";
import { useAppStore } from "../../src/store/AppStore";
import { Button, Card, Field, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { colors, spacing, typography } from "../../src/ui/theme";

type LessonFilter = "all" | "current" | "start" | "toilet" | "social" | "calm" | "movement";
type ViewMode = "list" | "grid2" | "grid3";
type SortMode = "recommended" | "shortest";

// These ranges keep the quick age filter useful without changing the
// carefully reviewed, English-only lesson copy.
const AGE_RANGES: Record<string, { min: number; max: number }> = {
  lesson_first_days: { min: 0, max: 70 },
  lesson_reward: { min: 0, max: 365 },
  lesson_name: { min: 56, max: 365 },
  lesson_toilet: { min: 56, max: 730 },
  lesson_signals: { min: 56, max: 365 },
  lesson_handling: { min: 56, max: 730 },
  lesson_recall: { min: 56, max: 730 },
  lesson_leash: { min: 70, max: 730 },
  lesson_biting: { min: 56, max: 300 },
  lesson_rest: { min: 0, max: 730 },
  lesson_alone: { min: 70, max: 730 },
  lesson_social: { min: 56, max: 120 },
};

const matchesFilter = (lesson: LessonContent, filter: LessonFilter, ageDays: number | null): boolean => {
  if (filter === "all") return true;
  if (filter === "current") {
    const range = AGE_RANGES[lesson.id];
    return ageDays !== null && Boolean(range && ageDays >= range.min && ageDays <= range.max);
  }
  const tags = lesson.tags;
  if (filter === "start") return tags.some((tag) => ["start", "home", "settling", "sleep", "rest"].includes(tag));
  if (filter === "toilet") return tags.some((tag) => ["toilet", "pee", "poo", "signals", "routine"].includes(tag));
  if (filter === "social") return tags.some((tag) => ["socialisation", "environment", "people", "dogs"].includes(tag));
  if (filter === "calm") return tags.some((tag) => ["handling", "paws", "grooming", "vet", "settle", "rest", "sleep"].includes(tag));
  return tags.some((tag) => ["leash", "walk", "outdoors", "recall", "safety"].includes(tag));
};

const lessonDuration = (lesson: LessonContent): number => Number.parseInt(lesson.duration, 10) || 99;

export default function LearnScreen() {
  const { t } = useTranslation();
  const { snapshot, selectedDog, markLesson } = useAppStore();
  const { width: windowWidth } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<LessonFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sort, setSort] = useState<SortMode>("recommended");
  const ageDays = ageInDays(selectedDog.birthDate);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = LESSONS.filter((lesson) => {
      const searchable = `${lesson.title} ${lesson.summary} ${lesson.tags.join(" ")}`.toLowerCase();
      return (!normalizedQuery || searchable.includes(normalizedQuery)) && matchesFilter(lesson, filter, ageDays);
    });
    return sort === "shortest" ? [...result].sort((a, b) => lessonDuration(a) - lessonDuration(b)) : result;
  }, [ageDays, filter, query, sort]);

  const filters: [LessonFilter, string][] = [
    ["all", t("learn.filterAll")],
    ["current", t("learn.filterCurrent")],
    ["start", t("learn.filterStart")],
    ["toilet", t("learn.filterToilet")],
    ["social", t("learn.filterSocial")],
    ["calm", t("learn.filterCalm")],
    ["movement", t("learn.filterMovement")],
  ];
  const isGrid = viewMode !== "list";
  const columns = viewMode === "grid3" ? 3 : 2;
  const gridGap = columns === 3 ? spacing.xs : spacing.sm;
  const gridCardWidth = (windowWidth - spacing.lg * 2 - gridGap * (columns - 1)) / columns;
  const lessonContainerStyle = isGrid
    ? StyleSheet.flatten([styles.lessonGrid, { gap: gridGap }])
    : styles.lessonList;

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
    <View style={styles.filterBlock}>
      <Text style={styles.filterLabel}>{t("learn.filters")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map(([value, label]) => <Pill key={value} active={filter === value} onPress={() => { setFilter(value); setExpanded(null); }}>{label}</Pill>)}
      </ScrollView>
    </View>
    <View style={styles.toolbar}>
      <SectionTitle title={`${filtered.length} practical lessons`} />
      <View style={styles.toolbarControls}>
        <Pill active={sort === "recommended"} onPress={() => setSort("recommended")}>{t("learn.sortRecommended")}</Pill>
        <Pill active={sort === "shortest"} onPress={() => setSort("shortest")}>{t("learn.sortShortest")}</Pill>
      </View>
      <View style={styles.toolbarControls}>
        <Pill active={viewMode === "list"} onPress={() => setViewMode("list")}>{t("learn.listView")}</Pill>
        <Pill active={viewMode === "grid2"} onPress={() => setViewMode("grid2")}>{t("learn.grid2")}</Pill>
        <Pill active={viewMode === "grid3"} onPress={() => setViewMode("grid3")}>{t("learn.grid3")}</Pill>
      </View>
    </View>
    {filtered.length ? <View style={lessonContainerStyle}>{filtered.map((lesson) => {
      const state = snapshot.lessonProgress[lesson.id] ?? "not_started";
      const isOpen = expanded === lesson.id;
      const nextState = state === "not_started" ? "in_progress" : state === "in_progress" ? "completed" : "in_progress";
      const actionLabel = state === "not_started" ? "Start lesson" : state === "in_progress" ? "Mark complete" : t("learn.practice");
      return <Card key={lesson.id} style={isGrid ? StyleSheet.flatten([styles.lessonCard, styles.lessonCardGrid, { width: gridCardWidth }]) : styles.lessonCard}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${isOpen ? "Close" : "Open"} lesson: ${lesson.title}`} accessibilityState={{ expanded: isOpen }} onPress={() => setExpanded(isOpen ? null : lesson.id)}>
          <ImageBackground source={lesson.thumbnail} resizeMode="cover" imageStyle={styles.videoImage} style={[styles.video, isGrid && styles.videoGrid]} accessible accessibilityLabel={`Thumbnail for ${lesson.title}`}>
            <View style={styles.videoShade} />
            {!isGrid ? <View style={styles.openBadge}><Text style={styles.openBadgeText}>{isOpen ? "Hide steps" : "Open lesson"}</Text></View> : null}
            <Text style={styles.videoLabel}>Photo guide · {lesson.duration} {t("learn.minutes")}</Text>
          </ImageBackground>
          <View style={styles.lessonTop}>
            <View style={styles.lessonCopy}>
              <View style={styles.metaRow}><Text style={styles.ageGuide}>{lesson.ageGuide}</Text><Text style={styles.chevron}>{isOpen ? "⌃" : "⌄"}</Text></View>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              {!isGrid ? <Text style={styles.lessonSummary}>{lesson.summary}</Text> : null}
            </View>
            {!isGrid ? <Pill active={state === "completed"}>{state === "completed" ? "✓ Done" : state === "in_progress" ? "In practice" : "New"}</Pill> : null}
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
    })}</View> : <Card><Text style={styles.noResults}>{t("learn.noResults")}</Text></Card>}
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
  filterBlock: { gap: spacing.sm },
  filterLabel: { ...typography.small, color: colors.text, fontWeight: "800" },
  filterRow: { gap: spacing.sm, paddingRight: spacing.lg },
  toolbar: { gap: spacing.sm },
  toolbarControls: { flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" },
  lessonList: { gap: spacing.lg },
  lessonGrid: { flexDirection: "row", flexWrap: "wrap" },
  lessonCard: { gap: spacing.md },
  lessonCardGrid: { padding: spacing.sm, gap: spacing.sm },
  video: { height: 154, borderRadius: 18, overflow: "hidden", backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  videoGrid: { height: 104, borderRadius: 14 },
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
