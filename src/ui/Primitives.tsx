import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import { Image, Keyboard, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type PressableProps, type TextInputProps, type TextStyle, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, shadow, spacing, typography } from "./theme";

export function Screen({ children, scroll = true, style, scrollRef }: { children: React.ReactNode; scroll?: boolean; style?: ViewStyle; scrollRef?: React.RefObject<ScrollView | null> }) {
  const content = scroll ? <ScrollView ref={scrollRef} contentContainerStyle={[styles.scroll, style]} showsVerticalScrollIndicator={false}>{children}</ScrollView> : <View style={[styles.fill, styles.scroll, style]}>{children}</View>;
  return <SafeAreaView style={styles.safe}>{content}</SafeAreaView>;
}

export function Card({ children, style, tone = "surface" }: { children: React.ReactNode; style?: ViewStyle; tone?: "surface" | "moss" | "sun" }) {
  return <View style={[styles.card, tone === "moss" && styles.cardMoss, tone === "sun" && styles.cardSun, style]}>{children}</View>;
}

export function Button({ children, variant = "primary", style, disabled = false, ...props }: Omit<PressableProps, "style"> & { children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; style?: ViewStyle }) {
  const isDisabled = disabled === true;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: isDisabled }} disabled={isDisabled} style={({ pressed }) => [styles.button, variant === "secondary" && styles.buttonSecondary, variant === "ghost" && styles.buttonGhost, variant === "danger" && styles.buttonDanger, isDisabled && styles.disabled, pressed && !isDisabled && styles.pressed, style]} {...props}><Text style={[styles.buttonText, variant !== "primary" && styles.buttonTextDark, variant === "danger" && styles.buttonTextDanger]}>{children}</Text></Pressable>;
}

export function IconButton({ label, children, style, ...props }: Omit<PressableProps, "style"> & { label: string; children: React.ReactNode; style?: ViewStyle }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed, style]} {...props}><Text style={styles.iconButtonText}>{children}</Text></Pressable>;
}

export function Pill({ children, active = false, onPress, style }: { children: React.ReactNode; active?: boolean; onPress?: () => void; style?: ViewStyle }) {
  const body = <View style={[styles.pill, active && styles.pillActive, style]}><Text style={[styles.pillText, active && styles.pillTextActive]}>{children}</Text></View>;
  return onPress ? <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress}>{body}</Pressable> : body;
}

export function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow?: string | undefined; title: string; action?: string | undefined; onAction?: (() => void) | undefined }) {
  return <View style={styles.sectionTitle}><View style={styles.sectionTitleCopy}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.sectionHeading}>{title}</Text></View>{action && onAction ? <Pressable accessibilityRole="button" onPress={onAction}><Text style={styles.actionText}>{action}</Text></Pressable> : null}</View>;
}

export function Field({ label, style, ...props }: TextInputProps & { label: string; style?: TextStyle }) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput placeholderTextColor={colors.muted} style={[styles.field, style]} {...props} /></View>;
}

type PickerMode = "date" | "datetime";

const dateFromValue = (value: string | null): Date => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const serializePickerDate = (value: Date, dateOnly: boolean): string => {
  if (!dateOnly) return value.toISOString();
  // Store date-only values at noon UTC so the selected calendar day is stable
  // when formatted in Swedish, English, or another user timezone.
  return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate(), 12)).toISOString();
};

const displayDate = (value: string | null, locale: string, dateOnly: boolean): string => {
  if (!value) return "";
  const parsed = dateFromValue(value);
  return new Intl.DateTimeFormat(locale, dateOnly ? { day: "numeric", month: "short", year: "numeric" } : { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(parsed);
};

/** A native date/date-time field that never asks the user to type a date string. */
export function DatePickerField({ label, value, onChange, locale = "en-GB", placeholder = "Select a date", doneLabel = "Done", mode = "date", maximumDate, minimumDate }: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  locale?: string;
  placeholder?: string;
  doneLabel?: string;
  mode?: PickerMode;
  maximumDate?: Date;
  minimumDate?: Date;
}) {
  const [visible, setVisible] = useState(false);
  const [androidMode, setAndroidMode] = useState<"date" | "time">("date");
  const [draft, setDraft] = useState(() => dateFromValue(value));
  const dateOnly = mode === "date";
  const labelValue = useMemo(() => displayDate(value, locale, dateOnly), [dateOnly, locale, value]);
  const open = () => {
    Keyboard.dismiss();
    setDraft(dateFromValue(value));
    setAndroidMode("date");
    setVisible(true);
  };
  const close = () => {
    setVisible(false);
    setAndroidMode("date");
  };
  const commit = (next: Date) => {
    setDraft(next);
    onChange(serializePickerDate(next, dateOnly));
  };
  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed") {
      close();
      return;
    }
    if (!selected) return;
    if (Platform.OS === "android" && mode === "datetime" && androidMode === "date") {
      const next = new Date(draft);
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDraft(next);
      setVisible(false);
      setAndroidMode("time");
      // Android presents date and time as separate native dialogs.
      setTimeout(() => setVisible(true), 0);
      return;
    }
    let next = selected;
    if (Platform.OS === "android" && mode === "datetime" && androidMode === "time") {
      // Android's time dialog may return today's date; keep the date chosen in
      // the preceding dialog and only replace its clock portion.
      next = new Date(draft);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    }
    if (Platform.OS === "android") {
      commit(next);
      close();
    } else {
      setDraft(next);
    }
  };
  const finishIos = () => {
    commit(draft);
    close();
  };
  const pickerBounds = maximumDate && minimumDate
    ? { maximumDate, minimumDate }
    : maximumDate
      ? { maximumDate }
      : minimumDate
        ? { minimumDate }
        : {};
  return <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={open} style={styles.dateField}>
      <Text style={[styles.dateFieldText, !labelValue && styles.dateFieldPlaceholder]}>{labelValue || placeholder}</Text>
    </Pressable>
    {visible && Platform.OS === "android" ? <DateTimePicker value={draft} mode={androidMode} display="default" onChange={onPickerChange} {...pickerBounds} /> : null}
    {visible && Platform.OS === "ios" ? <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={styles.dateOverlay}>
        <View style={styles.dateDialog}>
          <Text style={styles.dateDialogTitle}>{label}</Text>
          <DateTimePicker value={draft} mode={mode} display={mode === "date" ? "inline" : "spinner"} locale={locale} onChange={onPickerChange} {...pickerBounds} />
          <Button variant="secondary" onPress={finishIos}>{doneLabel}</Button>
        </View>
      </View>
    </Modal> : null}
  </View>;
}

export function Avatar({ emoji, photoUri, size = 58 }: { emoji: string; photoUri?: string | null | undefined; size?: number }) {
  return <View accessible accessibilityLabel="Dog avatar" style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>{photoUri ? <Image source={{ uri: photoUri }} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <Text style={{ fontSize: size * 0.52 }}>{emoji}</Text>}</View>;
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return <Card tone="moss" style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text>{body ? <Text style={styles.emptyBody}>{body}</Text> : null}</Card>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 112, gap: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: spacing.lg, ...shadow },
  cardMoss: { backgroundColor: colors.moss },
  cardSun: { backgroundColor: "#FFF7DA" },
  button: { minHeight: 50, paddingHorizontal: spacing.lg, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.moss },
  buttonGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  buttonDanger: { backgroundColor: "#F7E5E2" },
  buttonText: { ...typography.body, color: "#FFFFFF", fontWeight: "800" },
  buttonTextDark: { color: colors.primaryDark },
  buttonTextDanger: { color: colors.attention },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", ...shadow },
  iconButtonText: { fontSize: 20, color: colors.text },
  pill: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 20, backgroundColor: colors.surfaceAlt },
  pillActive: { backgroundColor: colors.primary },
  pillText: { ...typography.small, color: colors.muted },
  pillTextActive: { color: "#FFFFFF" },
  sectionTitle: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md },
  sectionTitleCopy: { gap: 4, flex: 1 },
  eyebrow: { ...typography.small, color: colors.primary, textTransform: "uppercase", letterSpacing: 1.2 },
  sectionHeading: { ...typography.heading, color: colors.text },
  actionText: { ...typography.small, color: colors.primary, fontWeight: "800" },
  fieldWrap: { gap: 7 },
  fieldLabel: { ...typography.small, color: colors.text },
  field: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 15, paddingHorizontal: 15, color: colors.text, backgroundColor: colors.surface, ...typography.body },
  dateField: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 15, paddingHorizontal: 15, backgroundColor: colors.surface, justifyContent: "center" },
  dateFieldText: { ...typography.body, color: colors.text, lineHeight: 22 },
  dateFieldPlaceholder: { color: colors.muted },
  dateOverlay: { flex: 1, backgroundColor: "rgba(32,51,43,0.28)", justifyContent: "center", padding: spacing.lg },
  dateDialog: { backgroundColor: colors.surface, borderRadius: 24, padding: spacing.lg, gap: spacing.md, ...shadow },
  dateDialogTitle: { ...typography.heading, color: colors.text },
  avatar: { backgroundColor: colors.sun, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", gap: spacing.sm },
  emptyTitle: { ...typography.heading, color: colors.text, textAlign: "center" },
  emptyBody: { ...typography.body, color: colors.muted, textAlign: "center" },
});
