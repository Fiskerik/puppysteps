import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { Lesson } from "../../src/domain/models";
import { useAppStore } from "../../src/store/AppStore";
import { Button, Card, Field, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { colors, spacing, typography } from "../../src/ui/theme";

const LESSONS: Lesson[] = [
  { id: "lesson_first_days", title: "Första dagarna och trygghet", summary: "Gör hemkomsten lugn och begriplig.", duration: "3", steps: ["Välj en lugn plats", "Låt valpen sova ostört", "Belöna frivillig kontakt"], tags: ["start", "trygghet"], status: "reviewed" },
  { id: "lesson_reward", title: "Belöning och timing", summary: "Så fångar du rätt ögonblick utan press.", duration: "4", steps: ["Ha belöningen nära", "Markera lugnt", "Belöna direkt när valpen lyckas"], tags: ["grunder"], status: "reviewed" },
  { id: "lesson_name", title: "Namn och frivillig kontakt", summary: "Bygg en trygg kommunikation i vardagen.", duration: "3", steps: ["Säg namnet en gång", "Vänta på en blick", "Belöna och pausa"], tags: ["kontakt"], status: "reviewed" },
  { id: "lesson_toilet", title: "Rumsrenhet i vardagen", summary: "En enkel rytm efter sömn, mat och lek.", duration: "4", steps: ["Gå ut efter viktiga triggers", "Belöna ute direkt", "Hantera olyckor neutralt"], tags: ["rumsrenhet"], status: "reviewed" },
  { id: "lesson_signals", title: "Läs valpens signaler", summary: "Se de små tecknen innan det blir bråttom.", duration: "3", steps: ["Titta efter rastlöshet", "Följ mönster i loggen", "Gå ut lugnt"], tags: ["rumsrenhet"], status: "reviewed" },
  { id: "lesson_handling", title: "Lugn hantering", summary: "Förbered klokt för kloklippning och vardag.", duration: "4", steps: ["Börja med en kort beröring", "Belöna avslappning", "Avsluta medan det går bra"], tags: ["vardag"], status: "reviewed" },
  { id: "lesson_recall", title: "Inkallning från grunden", summary: "Gör det lätt och roligt att komma tillbaka.", duration: "3", steps: ["Välj en lugn miljö", "Backa från valpen", "Belöna stort"], tags: ["utomhus"], status: "reviewed" },
  { id: "lesson_leash", title: "Koppel utan dragkamp", summary: "Belöna slackt koppel och frivilliga blickar.", duration: "4", steps: ["Börja hemma", "Belöna när kopplet hänger", "Pausa vid drag"], tags: ["promenad"], status: "reviewed" },
  { id: "lesson_biting", title: "Bitande och rätt tugg", summary: "Möt valpens behov utan att skälla.", duration: "3", steps: ["Byt till en leksak", "Gör en kort paus", "Sov och lek i balans"], tags: ["valp"], status: "reviewed" },
  { id: "lesson_rest", title: "Trygg viloplats", summary: "Lär valpen att vila frivilligt och säkert.", duration: "3", steps: ["Gör platsen frivillig", "Lägg dit något gott", "Stäng aldrig in som standard"], tags: ["vila"], status: "reviewed" },
  { id: "lesson_alone", title: "Ensamhet steg för steg", summary: "Öka avstånd och tid mycket gradvis.", duration: "4", steps: ["Börja med sekunder", "Kom tillbaka innan oro", "Öka bara när det känns lätt"], tags: ["hemma"], status: "reviewed" },
  { id: "lesson_social", title: "Miljöträning utan stress", summary: "Små, positiva möten med världen.", duration: "4", steps: ["Välj lagom svår miljö", "Observera avstånd", "Backa när valpen behöver"], tags: ["socialisering"], status: "reviewed" },
];

export default function LearnScreen() {
  const { t } = useTranslation();
  const { snapshot, markLesson } = useAppStore();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = useMemo(() => LESSONS.filter((lesson) => `${lesson.title} ${lesson.summary} ${lesson.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <Screen><View style={styles.header}><Text style={styles.eyebrow}>{t("nav.learn")}</Text><Text style={styles.title}>{t("learn.title")}</Text><Text style={styles.subtitle}>{t("learn.subtitle")}</Text></View><Field label={t("learn.search")} value={query} onChangeText={setQuery} placeholder="rumsrenhet, koppel, vila" /><SectionTitle title={`${filtered.length} övningar`} />{filtered.length ? filtered.map((lesson) => { const state = snapshot.lessonProgress[lesson.id] ?? "not_started"; const isOpen = expanded === lesson.id; return <Card key={lesson.id} style={styles.lessonCard}><Pressable accessibilityRole="button" onPress={() => setExpanded(isOpen ? null : lesson.id)}><View style={styles.video}><Text style={styles.play}>▶</Text><Text style={styles.videoLabel}>{t("learn.video")} · {lesson.duration} {t("learn.minutes")}</Text></View><View style={styles.lessonTop}><View style={styles.lessonCopy}><Text style={styles.lessonTitle}>{lesson.title}</Text><Text style={styles.lessonSummary}>{lesson.summary}</Text></View><Pill active={state === "completed"}>{state === "completed" ? "✓" : lesson.status === "reviewed" ? t("learn.reviewed") : "Utkast"}</Pill></View></Pressable>{isOpen ? <View style={styles.details}><Text style={styles.detailLabel}>Gör så här</Text>{lesson.steps.map((step, index) => <View key={step} style={styles.step}><Text style={styles.stepNumber}>{index + 1}</Text><Text style={styles.stepText}>{step}</Text></View>)}<Button variant={state === "completed" ? "secondary" : "primary"} onPress={() => markLesson(lesson, state === "completed" ? "in_progress" : "completed")}>{state === "completed" ? t("learn.practice") : t("learn.start")}</Button></View> : null}</Card>; }) : <Card><Text style={styles.noResults}>{t("learn.noResults")}</Text></Card>}</Screen>;
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  eyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, maxWidth: 320, marginTop: 4 },
  lessonCard: { gap: spacing.md },
  video: { height: 126, borderRadius: 18, backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  play: { fontSize: 32, color: colors.sun },
  videoLabel: { ...typography.small, color: "#FFFFFF" },
  lessonTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  lessonCopy: { flex: 1, gap: 3 },
  lessonTitle: { ...typography.heading, color: colors.text },
  lessonSummary: { ...typography.body, color: colors.muted },
  details: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.sm },
  detailLabel: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1 },
  step: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  stepNumber: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.moss, color: colors.primaryDark, textAlign: "center", textAlignVertical: "center", fontWeight: "800" },
  stepText: { ...typography.body, color: colors.text, flex: 1 },
  noResults: { ...typography.body, color: colors.muted, textAlign: "center" },
});
