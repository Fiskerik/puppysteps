import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { Dog, Locale } from "../../src/domain/models";
import { PREP_CHECKLIST } from "../../src/content/prepChecklist";
import { ageInDays } from "../../src/content/puppyTimeline";
import { supported } from "../../src/i18n";
import { buildCareReport, buildCareReportHtml, type CareReport, type CareReportLabels } from "../../src/reports/careReport";
import { useAppStore, type DogDraft } from "../../src/store/AppStore";
import { Avatar, Button, Card, DatePickerField, Field, Pill, Screen, SectionTitle } from "../../src/ui/Primitives";
import { pickLocalPhoto } from "../../src/ui/photoPicker";
import { colors, shadow, spacing, typography } from "../../src/ui/theme";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type Mission = { id: string; title: string; description: string; progress: number; target: number; reward: number; icon: IconName };
type Tool = { id: string; title: string; detail: string; icon: IconName; accent: "moss" | "sun" | "rose"; onPress: () => void };

const languageNames: Record<Locale, string> = { "sv-SE": "Svenska", "en-GB": "English", "fr-FR": "Français", "de-DE": "Deutsch", "da-DK": "Dansk", "fi-FI": "Suomi", "nb-NO": "Norsk" };
const emptyDraft: DogDraft = { name: "", breed: null, allergies: null, birthDate: null, arrivalDate: null, avatar: "🐶", photoUri: null, sex: "unknown", weightKg: null, chipNumber: null };

const REPORT_ICON: Record<string, IconName> = {
  dog: "dog", "scale-bathroom": "scale-bathroom", "alert-circle-outline": "alert-circle-outline", "barcode-scan": "barcode-scan",
  walk: "walk", "food-variant": "food-variant", "cup-water": "cup-water", "weather-night": "weather-night", paw: "paw",
  "notebook-outline": "notebook-outline", "school-outline": "school-outline", "medal-outline": "medal-outline",
};

const imageDataUri = async (uri: string | null): Promise<string | null> => {
  if (!uri) return null;
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const fileName = uri.split("?")[0]?.toLowerCase() ?? "";
    const mimeType = fileName.endsWith(".png") ? "image/png" : fileName.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    // A report is still useful after a local image has been removed. The HTML
    // renderer falls back to the chosen dog avatar in that case.
    console.warn("Could not embed dog photo in care report", error);
    return null;
  }
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { snapshot, selectedDogId, selectedDog, setSelectedDogId, addDog, updateDog, togglePrepItem, updateSettings, enableReminders, toggleResponsible, exportData, deleteLocalData } = useAppStore();
  const [checklistVisible, setChecklistVisible] = useState(false);
  const [faqVisible, setFaqVisible] = useState(false);
  const [missionsVisible, setMissionsVisible] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportIncludeMicrochip, setReportIncludeMicrochip] = useState(false);
  const [reportSharing, setReportSharing] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [draft, setDraft] = useState<DogDraft>(emptyDraft);
  const [photoBusy, setPhotoBusy] = useState(false);

  const text = (key: string, fallback: string): string => t(key, { defaultValue: fallback });
  const openAddDog = () => { setEditingDog(null); setDraft({ ...emptyDraft }); setEditorVisible(true); };
  const openEditDog = (dog: Dog) => {
    setEditingDog(dog);
    setDraft({ name: dog.name, breed: dog.breed, allergies: dog.allergies, birthDate: dog.birthDate, arrivalDate: dog.arrivalDate, avatar: dog.avatar, photoUri: dog.photoUri, sex: dog.sex, weightKg: dog.weightKg, chipNumber: dog.chipNumber });
    setEditorVisible(true);
  };
  const closeEditor = () => { setEditorVisible(false); setEditingDog(null); setDraft({ ...emptyDraft }); };
  const patchDraft = (patch: Partial<DogDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const saveDog = () => {
    const normalized: DogDraft = {
      name: draft.name.trim(), breed: draft.breed?.trim() || null, allergies: draft.allergies?.trim() || null, birthDate: draft.birthDate,
      arrivalDate: draft.arrivalDate ?? null, avatar: draft.avatar, photoUri: draft.photoUri ?? null, sex: draft.sex ?? "unknown",
      weightKg: draft.weightKg === null || draft.weightKg === undefined || Number.isNaN(draft.weightKg) ? null : draft.weightKg,
      chipNumber: draft.chipNumber?.trim() || null,
    };
    const saved = editingDog ? updateDog({ ...editingDog, ...normalized }) : addDog(normalized);
    if (!saved) { Alert.alert(snapshot.dogs.length >= 2 && !editingDog ? t("dog.limit") : t("dog.saveError")); return; }
    closeEditor();
  };
  const chooseDogPhoto = async (source: "camera" | "library") => {
    setPhotoBusy(true);
    try { const uri = await pickLocalPhoto(source); if (uri) patchDraft({ photoUri: uri }); }
    catch (error) { console.warn("Could not attach dog photo", error); Alert.alert(t("log.photoError")); }
    finally { setPhotoBusy(false); }
  };
  const openPhotoOptions = () => Alert.alert(t("dog.photo"), undefined, [
    { text: t("log.takePhoto"), onPress: () => void chooseDogPhoto("camera") },
    { text: t("log.choosePhoto"), onPress: () => void chooseDogPhoto("library") },
    ...(draft.photoUri ? [{ text: t("log.removePhoto"), onPress: () => patchDraft({ photoUri: null }) }] : []),
    { text: t("common.cancel"), style: "cancel" },
  ]);
  const exportFile = async (format: "csv" | "json") => {
    try {
      const directory = FileSystem.cacheDirectory;
      if (!directory) throw new Error("No cache directory available");
      const path = `${directory}puppysteps-export.${format}`;
      await FileSystem.writeAsStringAsync(path, exportData(format), { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path, { mimeType: format === "csv" ? "text/csv" : "application/json", dialogTitle: t("profile.export") });
      else Alert.alert(`${t("profile.export")}: ${path}`);
    } catch (error) { console.warn("Could not export local data", error); Alert.alert(t("profile.exportError")); }
  };
  const toggleReminders = async () => {
    if (snapshot.settings.remindersEnabled) { updateSettings({ remindersEnabled: false }); return; }
    if (!(await enableReminders())) Alert.alert(t("notifications.disabled"));
  };
  const confirmDelete = () => Alert.alert(t("profile.delete"), t("profile.deleteConfirm"), [{ text: t("common.cancel"), style: "cancel" }, { text: t("profile.deleteAction"), style: "destructive", onPress: () => void deleteLocalData() }]);

  const completedPrep = useMemo(() => PREP_CHECKLIST.filter((item) => snapshot.prepChecklist[item.id]).length, [snapshot.prepChecklist]);
  const dogCheckIns = useMemo(() => snapshot.checkIns.filter((item) => item.dogId === selectedDog.id), [selectedDog.id, snapshot.checkIns]);
  const dogEvents = useMemo(() => snapshot.eliminations.filter((item) => item.dogId === selectedDog.id), [selectedDog.id, snapshot.eliminations]);
  const dogRoutine = useMemo(() => snapshot.routineEvents.filter((item) => item.dogId === selectedDog.id), [selectedDog.id, snapshot.routineEvents]);
  const completedLessons = Object.values(snapshot.lessonProgress).filter((state) => state === "completed").length;
  const points = dogCheckIns.length * 5 + dogRoutine.length * 3 + completedLessons * 20 + completedPrep * 5 + snapshot.milestones.filter((item) => item.dogId === selectedDog.id && item.completed).length * 10;
  const tiers = [
    { name: text("profile.tier.newArrival", "New arrival"), min: 0 },
    { name: text("profile.tier.calmCompanion", "Calm companion"), min: 100 },
    { name: text("profile.tier.confidentGuide", "Confident guide"), min: 250 },
    { name: text("profile.tier.puppyPro", "Puppy pro"), min: 500 },
  ];
  const tierIndex = Math.max(0, tiers.reduce((index, tier, current) => points >= tier.min ? current : index, 0));
  const currentTier = tiers[tierIndex] ?? tiers[0];
  const nextTier = tiers[tierIndex + 1];
  const tierProgress = nextTier && currentTier ? Math.min(1, (points - currentTier.min) / (nextTier.min - currentTier.min)) : 1;

  const missions: Mission[] = [
    { id: "safety", title: text("profile.mission.safety", "Safety starter"), description: text("profile.mission.safetyDetail", "Prepare three essentials before your puppy comes home."), progress: completedPrep, target: 3, reward: 25, icon: "shield-check-outline" },
    { id: "doer", title: text("profile.mission.doer", "The doer"), description: text("profile.mission.doerDetail", "Log five small moments to begin seeing your dog’s rhythm."), progress: dogCheckIns.length, target: 5, reward: 40, icon: "clipboard-check-outline" },
    { id: "walker", title: text("profile.mission.walker", "Walk explorer"), description: text("profile.mission.walkerDetail", "Capture five walks so the care report can describe the usual routine."), progress: dogRoutine.filter((event) => event.kind === "walk").length, target: 5, reward: 50, icon: "walk" },
    { id: "learner", title: text("profile.mission.learner", "Lesson learner"), description: text("profile.mission.learnerDetail", "Finish three gentle, practical lessons together."), progress: completedLessons, target: 3, reward: 60, icon: "school-outline" },
  ];
  const selectedMission = missions.find((mission) => mission.id === selectedMissionId) ?? null;

  const reportLabels: Partial<CareReportLabels> = {
    title: text("profile.report.title", "Puppysteps care report"), profile: text("profile.report.profile", "Profile"), routine: text("profile.report.routine", "Usual routine"), progress: text("profile.report.progress", "Recent progress"),
    breed: text("profile.report.breed", "Breed"), weight: text("profile.report.weight", "Weight"), allergies: text("profile.report.allergies", "Allergies"), microchip: text("profile.report.microchip", "Microchip"),
    walks: text("profile.report.walks", "Walks"), meals: text("profile.report.meals", "Meals"), drinks: text("profile.report.drinks", "Drinks"), sleep: text("profile.report.sleep", "Sleep"),
    outdoorPottyWins: text("profile.report.outdoorWins", "Outdoor potty wins"), loggedMoments: text("profile.report.loggedMoments", "Logged moments"), lessonsCompleted: text("profile.report.lessons", "Lessons completed"), points: text("profile.report.points", "Points"),
    notRecorded: text("profile.report.notRecorded", "Not recorded"), noneRecorded: text("profile.report.noneRecorded", "None recorded"), notEnoughData: text("profile.report.notEnoughData", "Not enough data yet"),
  };
  const buildReport = (photoDataUri: string | null = null): CareReport => buildCareReport({
    dog: selectedDog, locale: snapshot.settings.locale, routineEvents: dogRoutine, eliminationEvents: dogEvents, checkIns: dogCheckIns,
    completedLessons, points, tierName: currentTier?.name ?? text("profile.tier.newArrival", "New arrival"), includeMicrochip: reportIncludeMicrochip,
    photoDataUri, labels: reportLabels,
  });
  const careReport = buildReport();
  const shareReport = async () => {
    setReportSharing(true);
    try {
      const photoDataUri = await imageDataUri(selectedDog.photoUri);
      const pdf = await Print.printToFileAsync({ html: buildCareReportHtml(buildReport(photoDataUri), snapshot.settings.locale) });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(pdf.uri, { mimeType: "application/pdf", dialogTitle: text("profile.report.share", "Share care report") });
      else Alert.alert(text("profile.report.title", "Care report"), `${text("profile.report.saved", "The PDF was created at")}: ${pdf.uri}`);
    } catch (error) {
      console.warn("Could not share care report", error);
      Alert.alert(t("profile.exportError"));
    } finally { setReportSharing(false); }
  };

  const tools: Tool[] = [
    { id: "lessons", icon: "school-outline", title: text("profile.tool.lessons", "Lessons"), detail: text("profile.tool.lessonsDetail", "Short courses"), accent: "moss", onPress: () => router.push("/(tabs)/learn") },
    { id: "journey", icon: "timeline-outline", title: text("profile.tool.journey", "Journey"), detail: text("profile.tool.journeyDetail", "Age guidance"), accent: "sun", onPress: () => router.push("/(tabs)/journey") },
    { id: "pickup", icon: "clipboard-check-outline", title: text("profile.tool.pickup", "Pick-up"), detail: `${completedPrep}/${PREP_CHECKLIST.length} ${text("profile.tool.ready", "ready")}`, accent: "rose", onPress: () => setChecklistVisible(true) },
    { id: "routine", icon: "clock-outline", title: text("profile.tool.routine", "Routine"), detail: text("profile.tool.routineDetail", "Log a moment"), accent: "moss", onPress: () => router.push("/(tabs)") },
    { id: "faq", icon: "chat-question-outline", title: text("profile.tool.faq", "FAQ"), detail: text("profile.tool.faqDetail", "Quick answers"), accent: "sun", onPress: () => setFaqVisible(true) },
    { id: "report", icon: "file-document-outline", title: text("profile.tool.report", "Care report"), detail: text("profile.tool.reportDetail", "Share routine"), accent: "rose", onPress: () => { setReportIncludeMicrochip(false); setReportVisible(true); } },
  ];

  return <Screen density="compact">
    <View style={styles.header}><Text style={styles.eyebrow}>{t("nav.profile")}</Text><Text style={styles.title}>{t("profile.title")}</Text><Text style={styles.subtitle}>{t("profile.localBody")}</Text></View>
    <SectionTitle title={t("profile.dogs")} action={snapshot.dogs.length < 2 ? `＋ ${t("common.add")}` : undefined} onAction={openAddDog} />
    {snapshot.dogs.length ? <Card style={styles.dogsCard}>{snapshot.dogs.map((dog) => <Pressable key={dog.id} accessibilityRole="button" accessibilityLabel={`${dog.name}. ${t("profile.holdToEdit")}`} onPress={() => setSelectedDogId(dog.id)} onLongPress={() => openEditDog(dog)} delayLongPress={350} style={styles.dogRow}><Avatar emoji={dog.avatar} photoUri={dog.photoUri} size={45} /><View style={styles.dogCopy}><Text style={styles.dogName}>{dog.name}</Text><Text style={styles.dogMeta}>{dog.breed ?? t("dog.unknown")}{dog.chipNumber ? ` · ${dog.chipNumber}` : ""}</Text></View><View style={[styles.selectCircle, dog.id === selectedDogId && styles.selectCircleActive]}><MaterialCommunityIcons name={dog.id === selectedDogId ? "check" : "chevron-right"} size={18} color={dog.id === selectedDogId ? "#FFFFFF" : colors.muted} /></View></Pressable>)}</Card> : <Card tone="moss" style={styles.emptyDogCard}><Text style={styles.cardTitle}>{t("profile.addFirstDog")}</Text><Button onPress={openAddDog}>{t("profile.addDog")}</Button></Card>}
    <Text style={styles.hint}>{t("profile.holdToEdit")}</Text>

    <SectionTitle title={text("profile.stats", "Puppy at a glance")} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>{[
      { value: String(dogEvents.filter((event) => event.location === "outside").length), label: text("profile.stat.outdoor", "Potty wins"), icon: "paw" as IconName },
      { value: String(dogCheckIns.length + dogRoutine.length), label: text("profile.stat.logged", "Logged"), icon: "notebook-outline" as IconName },
      { value: String(dogRoutine.filter((event) => event.kind === "walk").length), label: text("profile.stat.walks", "Walks"), icon: "walk" as IconName },
      { value: selectedDog.weightKg ? `${selectedDog.weightKg} kg` : "—", label: selectedDog.breed ?? text("profile.stat.breed", "Breed"), icon: "scale-bathroom" as IconName },
      { value: ageInDays(selectedDog.birthDate) === null ? "—" : `${Math.floor((ageInDays(selectedDog.birthDate) ?? 0) / 7)} wk`, label: text("profile.stat.age", "Puppy age"), icon: "cake-variant" as IconName },
    ].map((stat) => <Card key={stat.label} style={styles.statCard}><View style={styles.statIcon}><MaterialCommunityIcons name={stat.icon} size={18} color={colors.primary} /></View><Text style={styles.statValue}>{stat.value}</Text><Text numberOfLines={1} style={styles.statLabel}>{stat.label}</Text></Card>)}</ScrollView>

    <SectionTitle title={text("profile.tools", "Tools")} />
    <View style={styles.toolsGrid}>{tools.map((tool) => <Pressable key={tool.id} accessibilityRole="button" accessibilityLabel={`${tool.title}. ${tool.detail}`} onPress={tool.onPress} style={[styles.toolTile, tool.accent === "moss" && styles.toolTileMoss, tool.accent === "sun" && styles.toolTileSun, tool.accent === "rose" && styles.toolTileRose]}><View style={styles.toolIcon}><MaterialCommunityIcons name={tool.icon} size={24} color={colors.primaryDark} /></View><Text numberOfLines={1} style={styles.toolTitle}>{tool.title}</Text><Text numberOfLines={1} style={styles.toolDetail}>{tool.detail}</Text></Pressable>)}</View>

    <SectionTitle title={text("profile.missions", "Missions & rewards")} action={text("profile.seeAll", "See all")} onAction={() => setMissionsVisible(true)} />
    <Card tone="sun" style={styles.tierCard}><View style={styles.tierTop}><View style={styles.tierMedal}><MaterialCommunityIcons name="medal-outline" size={25} color={colors.primaryDark} /></View><View style={styles.tierCopy}><Text style={styles.cardTitle}>{currentTier?.name ?? text("profile.tier.newArrival", "New arrival")}</Text><Text style={styles.cardBody}>{points} {text("profile.points", "points")}{nextTier ? ` · ${Math.max(0, nextTier.min - points)} ${text("profile.toNext", "to next tier")}` : ` · ${text("profile.topTier", "top tier")}`}</Text></View></View><View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(tierProgress * 100) }} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round(tierProgress * 100)}%` }]} /></View></Card>
    <View style={styles.missionGrid}>{missions.map((mission) => { const completed = mission.progress >= mission.target; return <Pressable key={mission.id} accessibilityRole="button" accessibilityLabel={`${mission.title}. ${Math.min(mission.progress, mission.target)} of ${mission.target}`} onPress={() => setSelectedMissionId(mission.id)} style={styles.missionBadgeTile}><View style={[styles.missionIcon, completed && styles.missionIconDone]}><MaterialCommunityIcons name={completed ? "check" : mission.icon} size={21} color={completed ? "#FFFFFF" : colors.primary} /></View><Text numberOfLines={2} style={styles.missionName}>{mission.title}</Text><Text style={styles.missionCount}>{Math.min(mission.progress, mission.target)}/{mission.target}</Text></Pressable>; })}</View>

    <SectionTitle title={t("profile.reminders")} />
    <Card style={styles.settingsCard}><View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.cardTitle}>{snapshot.settings.remindersEnabled ? t("profile.notificationOn") : t("profile.notificationOff")}</Text><Text style={styles.cardBody}>{snapshot.settings.remindersEnabled ? t("today.reason") : t("notifications.body")}</Text></View><Pill active={snapshot.settings.remindersEnabled} onPress={() => void toggleReminders()}>{snapshot.settings.remindersEnabled ? t("common.on") : t("common.off")}</Pill></View><View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.cardTitle}>{snapshot.settings.responsible ? t("today.responsible") : t("today.away")}</Text><Text style={styles.cardBody}>{t("profile.quiet")}: {snapshot.settings.quietStart}–{snapshot.settings.quietEnd}</Text></View><Pill active={snapshot.settings.responsible} onPress={toggleResponsible}>{snapshot.settings.responsible ? t("common.on") : t("common.off")}</Pill></View><View style={styles.quietRow}><Field label={`${t("profile.quiet")} ${t("profile.quietStart")}`} value={snapshot.settings.quietStart} onChangeText={(quietStart) => updateSettings({ quietStart })} placeholder="22:00" /><Field label={`${t("profile.quiet")} ${t("profile.quietEnd")}`} value={snapshot.settings.quietEnd} onChangeText={(quietEnd) => updateSettings({ quietEnd })} placeholder="07:00" /></View></Card>
    <SectionTitle title={t("profile.language")} />
    <Card style={styles.compactCard}><View style={styles.languageGrid}>{supported.map((locale) => <Pill key={locale} active={locale === snapshot.settings.locale} onPress={() => updateSettings({ locale })}>{languageNames[locale]}</Pill>)}</View><Text style={styles.hint}>{t("profile.localeHint")}</Text></Card>
    <SectionTitle title={t("profile.privacy")} />
    <Card style={styles.settingsCard}><Text style={styles.cardTitle}>{t("profile.local")}</Text><Text style={styles.cardBody}>{t("profile.localBody")}</Text><View style={styles.exportRow}><Button variant="secondary" onPress={() => void exportFile("csv")}>CSV</Button><Button variant="secondary" onPress={() => void exportFile("json")}>JSON</Button></View><Button variant="danger" onPress={confirmDelete}>{t("profile.delete")}</Button><Text style={styles.hint}>{t("profile.supportHint")}</Text></Card>

    <Modal visible={editorVisible} animationType="slide" transparent onRequestClose={closeEditor}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}><View style={styles.modalBackdrop}><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} style={styles.backdrop} onPress={closeEditor} /><ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}><Card style={styles.modal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{editingDog ? t("profile.editDog") : t("profile.addDog")}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={closeEditor}><Text style={styles.close}>×</Text></Pressable></View><Pressable accessibilityRole="button" onPress={openPhotoOptions} disabled={photoBusy} style={styles.photoChooser}><Avatar emoji={draft.avatar} photoUri={draft.photoUri} size={82} /><Text style={styles.photoChooserText}>{photoBusy ? t("log.photoAdding") : draft.photoUri ? t("dog.changePhoto") : t("dog.addPhoto")}</Text></Pressable><Field label={t("dog.name")} value={draft.name} onChangeText={(name) => patchDraft({ name })} placeholder="Milo" autoFocus /><Field label={t("dog.breed")} value={draft.breed ?? ""} onChangeText={(breed) => patchDraft({ breed })} placeholder={t("dog.unknown")} /><Text style={styles.fieldLabel}>{t("dog.sex")}</Text><View style={styles.pills}><Pill active={draft.sex === "female"} onPress={() => patchDraft({ sex: "female" })}>{t("dog.female")}</Pill><Pill active={draft.sex === "male"} onPress={() => patchDraft({ sex: "male" })}>{t("dog.male")}</Pill><Pill active={draft.sex === "unknown"} onPress={() => patchDraft({ sex: "unknown" })}>{t("dog.unknown")}</Pill></View><DatePickerField label={t("dog.birth")} value={draft.birthDate} onChange={(birthDate) => patchDraft({ birthDate })} locale={snapshot.settings.locale} placeholder={t("dog.birthPlaceholder")} doneLabel={t("common.done")} maximumDate={new Date()} /><DatePickerField label={t("dog.arrival")} value={draft.arrivalDate ?? null} onChange={(arrivalDate) => patchDraft({ arrivalDate })} locale={snapshot.settings.locale} placeholder={t("dog.birthPlaceholder")} doneLabel={t("common.done")} maximumDate={new Date()} /><Field label={t("dog.weight")} value={draft.weightKg === null || draft.weightKg === undefined ? "" : String(draft.weightKg)} onChangeText={(value) => patchDraft({ weightKg: value.trim() ? Number.parseFloat(value.replace(",", ".")) : null })} keyboardType="decimal-pad" placeholder="8.5" /><Field label={t("dog.chip")} value={draft.chipNumber ?? ""} onChangeText={(chipNumber) => patchDraft({ chipNumber })} keyboardType="number-pad" placeholder="985..." /><Field label={t("dog.allergies")} value={draft.allergies ?? ""} onChangeText={(allergies) => patchDraft({ allergies })} placeholder="Food, medication, seasonal…" /><View style={styles.modalActions}><Button variant="ghost" onPress={closeEditor}>{t("common.cancel")}</Button><Button onPress={saveDog} disabled={!draft.name.trim() || photoBusy}>{t("common.save")}</Button></View></Card></ScrollView></View></KeyboardAvoidingView></Modal>

    <Modal visible={checklistVisible} animationType="slide" transparent onRequestClose={() => setChecklistVisible(false)}><View style={styles.modalBackdrop}><Pressable style={styles.backdrop} onPress={() => setChecklistVisible(false)} /><Card style={styles.infoModal}><View style={styles.modalHeader}><View><Text style={styles.modalTitle}>{t("profile.preparation")}</Text><Text style={styles.cardBody}>{completedPrep}/{PREP_CHECKLIST.length} {text("profile.tool.ready", "ready")}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={() => setChecklistVisible(false)}><Text style={styles.close}>×</Text></Pressable></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>{PREP_CHECKLIST.map((item) => { const checked = Boolean(snapshot.prepChecklist[item.id]); return <Pressable key={item.id} accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => { if (!togglePrepItem(item.id)) Alert.alert(t("today.saveError")); }} style={styles.checkItem}><View style={[styles.checkCircle, checked && styles.checkCircleDone]}><MaterialCommunityIcons name={checked ? "check" : "circle-outline"} size={18} color={checked ? "#FFFFFF" : colors.primary} /></View><Text style={styles.checkIcon}>{item.icon}</Text><View style={styles.checkCopy}><Text style={styles.checkTitle}>{t(`prep.${item.id}`, { defaultValue: item.title })}</Text><Text style={styles.checkDetail}>{item.detail}</Text></View></Pressable>; })}</ScrollView><Button onPress={() => setChecklistVisible(false)}>{t("common.done")}</Button></Card></View></Modal>

    <Modal visible={faqVisible} animationType="slide" transparent onRequestClose={() => setFaqVisible(false)}><View style={styles.modalBackdrop}><Pressable style={styles.backdrop} onPress={() => setFaqVisible(false)} /><Card style={styles.infoModal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{text("profile.tool.faq", "Puppy FAQ")}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={() => setFaqVisible(false)}><Text style={styles.close}>×</Text></Pressable></View><Text style={styles.cardTitle}>{text("profile.faq.outings", "How often should we go out?")}</Text><Text style={styles.cardBody}>{text("profile.faq.outingsBody", "Use the age-based reminder as a starting point, then let clean successes gradually lengthen the interval. Always go out after waking, eating, drinking, and active play.")}</Text><Text style={styles.cardTitle}>{text("profile.faq.accident", "What if there is an accident?")}</Text><Text style={styles.cardBody}>{text("profile.faq.accidentBody", "Stay neutral, clean thoroughly, and shorten the next interval. Accidents are information—not a setback.")}</Text><Button onPress={() => setFaqVisible(false)}>{t("common.done")}</Button></Card></View></Modal>

    <Modal visible={missionsVisible} animationType="slide" transparent onRequestClose={() => setMissionsVisible(false)}><View style={styles.modalBackdrop}><Pressable style={styles.backdrop} onPress={() => setMissionsVisible(false)} /><Card style={styles.infoModal}><View style={styles.modalHeader}><View><Text style={styles.modalTitle}>{text("profile.missions", "Missions & rewards")}</Text><Text style={styles.cardBody}>{points} {text("profile.points", "points")} · {currentTier?.name ?? text("profile.tier.newArrival", "New arrival")}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={() => setMissionsVisible(false)}><Text style={styles.close}>×</Text></Pressable></View><Text style={styles.missionIntro}>{text("profile.mission.intro", "Small useful habits unlock the next tier. Tap a badge to see what counts.")}</Text><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.missionSheetGrid}>{missions.map((mission) => <Pressable key={mission.id} accessibilityRole="button" onPress={() => setSelectedMissionId(mission.id)} style={styles.missionSheetTile}><View style={[styles.missionSheetIcon, mission.progress >= mission.target && styles.missionIconDone]}><MaterialCommunityIcons name={mission.progress >= mission.target ? "check" : mission.icon} size={23} color={mission.progress >= mission.target ? "#FFFFFF" : colors.primary} /></View><Text style={styles.missionName}>{mission.title}</Text><Text style={styles.missionCount}>{Math.min(mission.progress, mission.target)}/{mission.target} · +{mission.reward}</Text></Pressable>)}</ScrollView><Button onPress={() => setMissionsVisible(false)}>{text("profile.keepGoing", "Keep going")}</Button></Card></View></Modal>

    <Modal visible={selectedMission !== null} animationType="slide" transparent onRequestClose={() => setSelectedMissionId(null)}><View style={styles.modalBackdrop}><Pressable style={styles.backdrop} onPress={() => setSelectedMissionId(null)} />{selectedMission ? <Card style={styles.infoModal}><View style={styles.modalHeader}><View style={styles.missionDetailTitle}><View style={[styles.missionSheetIcon, selectedMission.progress >= selectedMission.target && styles.missionIconDone]}><MaterialCommunityIcons name={selectedMission.progress >= selectedMission.target ? "check" : selectedMission.icon} size={23} color={selectedMission.progress >= selectedMission.target ? "#FFFFFF" : colors.primary} /></View><Text style={styles.modalTitle}>{selectedMission.title}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={() => setSelectedMissionId(null)}><Text style={styles.close}>×</Text></Pressable></View><Text style={styles.cardBody}>{selectedMission.description}</Text><View style={styles.missionDetailReward}><Text style={styles.reportLabel}>{text("profile.reward", "Reward")}</Text><Text style={styles.rewardText}>+{selectedMission.reward} {text("profile.points", "points")}</Text></View><Text style={styles.cardTitle}>{Math.min(selectedMission.progress, selectedMission.target)}/{selectedMission.target} {text("profile.complete", "complete")}</Text><View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: selectedMission.target, now: Math.min(selectedMission.progress, selectedMission.target) }} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, Math.round((selectedMission.progress / selectedMission.target) * 100))}%` }]} /></View><Button onPress={() => setSelectedMissionId(null)}>{t("common.done")}</Button></Card> : null}</View></Modal>

    <Modal visible={reportVisible} animationType="slide" transparent onRequestClose={() => setReportVisible(false)}><View style={styles.modalBackdrop}><Pressable style={styles.backdrop} onPress={() => setReportVisible(false)} /><Card style={styles.infoModal}><View style={styles.modalHeader}><View><Text style={styles.modalTitle}>{text("profile.report.title", "Care report")}</Text><Text style={styles.cardBody}>{text("profile.report.subtitle", "A clear handover for a sitter, trainer, or breeder.")}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={t("common.close")} onPress={() => setReportVisible(false)}><Text style={styles.close}>×</Text></Pressable></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.reportBody}><View style={styles.reportHeader}><Avatar emoji={selectedDog.avatar} photoUri={selectedDog.photoUri} size={52} /><View style={styles.reportCopy}><Text style={styles.cardTitle}>{careReport.dogName}</Text><Text style={styles.cardBody}>{selectedDog.breed ?? text("profile.report.notRecorded", "Breed not recorded")}</Text></View></View><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: reportIncludeMicrochip }} onPress={() => setReportIncludeMicrochip((current) => !current)} style={styles.microchipToggle}><View style={[styles.checkCircle, reportIncludeMicrochip && styles.checkCircleDone]}><MaterialCommunityIcons name={reportIncludeMicrochip ? "check" : "circle-outline"} size={17} color={reportIncludeMicrochip ? "#FFFFFF" : colors.primary} /></View><View style={styles.settingCopy}><Text style={styles.reportLabel}>{text("profile.report.includeChip", "Include microchip number")}</Text><Text style={styles.smallMuted}>{text("profile.report.includeChipHint", "Off by default for a more private handover.")}</Text></View></Pressable>{careReport.sections.map((section) => <View key={section.title} style={styles.reportSection}><Text style={styles.reportHeading}>{section.title}</Text>{section.rows.map((row) => <View key={row.label} style={styles.reportRow}><MaterialCommunityIcons name={REPORT_ICON[row.icon] ?? "circle-small"} size={17} color={colors.primary} /><Text style={styles.reportLabel}>{row.label}</Text><Text style={styles.reportValue}>{row.value}</Text></View>)}</View>)}</ScrollView><Button onPress={() => void shareReport()} disabled={reportSharing}>{reportSharing ? text("profile.report.creating", "Creating PDF…") : text("profile.report.share", "Share PDF report")}</Button><Button variant="ghost" onPress={() => setReportVisible(false)}>{t("common.done")}</Button></Card></View></Modal>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { gap: 4 }, eyebrow: { ...typography.small, color: colors.primary, letterSpacing: 0.2 }, title: { ...typography.display, color: colors.text }, subtitle: { ...typography.body, color: colors.muted, maxWidth: 340, marginTop: 4 },
  dogsCard: { paddingVertical: spacing.xs }, emptyDogCard: { gap: spacing.sm }, dogRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }, dogCopy: { flex: 1, gap: 1 }, dogName: { ...typography.heading, color: colors.text }, dogMeta: { ...typography.small, color: colors.muted }, selectCircle: { width: 31, height: 31, borderRadius: 16, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" }, selectCircleActive: { backgroundColor: colors.primary }, hint: { ...typography.small, color: colors.muted, marginTop: -spacing.sm },
  statsRow: { gap: spacing.sm, paddingVertical: spacing.xs }, statCard: { width: 112, minHeight: 94, gap: 3, padding: spacing.sm }, statIcon: { width: 29, height: 29, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.moss }, statValue: { ...typography.heading, color: colors.text }, statLabel: { ...typography.small, color: colors.muted, fontSize: 11 },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, toolTile: { width: "31%", minHeight: 98, borderRadius: 18, padding: spacing.sm, gap: 2, ...shadow }, toolTileMoss: { backgroundColor: colors.moss }, toolTileSun: { backgroundColor: "#FFF2CE" }, toolTileRose: { backgroundColor: "#F8E9E3" }, toolIcon: { height: 29, justifyContent: "center" }, toolTitle: { ...typography.small, color: colors.text, fontWeight: "800" }, toolDetail: { ...typography.small, color: colors.muted, fontSize: 10, lineHeight: 13 },
  tierCard: { gap: spacing.sm, padding: spacing.md }, tierTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, tierMedal: { width: 43, height: 43, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(47,107,95,0.12)" }, tierCopy: { flex: 1, gap: 1 }, progressTrack: { height: 7, borderRadius: 4, backgroundColor: "rgba(47,107,95,0.16)", overflow: "hidden" }, progressFill: { height: 7, borderRadius: 4, backgroundColor: colors.primary },
  missionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, missionBadgeTile: { width: "48%", minHeight: 108, alignItems: "center", gap: 4, paddingHorizontal: 4, paddingVertical: spacing.sm, borderRadius: 18, backgroundColor: colors.surface, ...shadow }, missionIcon: { width: 39, height: 39, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.moss }, missionIconDone: { backgroundColor: colors.primary }, missionName: { ...typography.small, color: colors.text, fontWeight: "800", textAlign: "center" }, missionCount: { ...typography.small, color: colors.muted, textAlign: "center" },
  settingsCard: { gap: spacing.md }, compactCard: { gap: spacing.sm, padding: spacing.md }, settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, paddingVertical: spacing.xs }, settingCopy: { flex: 1, gap: 2 }, cardTitle: { ...typography.heading, color: colors.text }, cardBody: { ...typography.body, color: colors.muted }, languageGrid: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }, exportRow: { flexDirection: "row", gap: spacing.sm }, quietRow: { gap: spacing.sm },
  overlay: { flex: 1 }, modalBackdrop: { flex: 1, backgroundColor: "rgba(32,51,43,0.28)", justifyContent: "flex-end" }, backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }, modalScroll: { flexGrow: 1, justifyContent: "flex-end", paddingTop: spacing.lg }, modal: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, gap: spacing.md, paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg }, modalHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }, modalTitle: { ...typography.title, color: colors.text }, close: { fontSize: 33, lineHeight: 33, color: colors.muted, fontWeight: "300" }, photoChooser: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs }, photoChooserText: { ...typography.small, color: colors.primary, fontWeight: "800" }, fieldLabel: { ...typography.small, color: colors.text }, pills: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, modalActions: { flexDirection: "row", gap: spacing.sm },
  infoModal: { margin: spacing.lg, gap: spacing.md, borderRadius: 24, maxHeight: "86%" }, sheetBody: { gap: 0 }, checkItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }, checkCircle: { width: 27, height: 27, borderRadius: 14, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center", justifyContent: "center" }, checkCircleDone: { backgroundColor: colors.primary }, checkIcon: { fontSize: 21 }, checkCopy: { flex: 1, gap: 1 }, checkTitle: { ...typography.body, color: colors.text, fontWeight: "800" }, checkDetail: { ...typography.small, color: colors.muted },
  missionIntro: { ...typography.body, color: colors.muted }, missionSheetGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, missionSheetTile: { width: "48%", minHeight: 115, alignItems: "center", justifyContent: "center", gap: 5, padding: spacing.sm, borderRadius: 18, backgroundColor: colors.surfaceAlt }, missionSheetIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: colors.moss }, missionDetailTitle: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 }, missionDetailReward: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.sm, borderRadius: 14, backgroundColor: colors.moss }, rewardText: { ...typography.small, color: colors.primaryDark, fontWeight: "800" },
  reportBody: { gap: spacing.sm }, reportHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingBottom: spacing.sm }, reportCopy: { flex: 1, gap: 1 }, microchipToggle: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: 14, backgroundColor: colors.surfaceAlt }, smallMuted: { ...typography.small, color: colors.muted }, reportSection: { gap: 5, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }, reportHeading: { ...typography.heading, color: colors.primaryDark, fontWeight: "800" }, reportRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 }, reportLabel: { ...typography.small, color: colors.text, fontWeight: "800" }, reportValue: { ...typography.small, color: colors.muted, flex: 1, textAlign: "right" },
});
