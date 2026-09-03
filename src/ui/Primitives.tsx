import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type PressableProps, type TextInputProps, type TextStyle, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, shadow, spacing, typography } from "./theme";

export function Screen({ children, scroll = true, style }: { children: React.ReactNode; scroll?: boolean; style?: ViewStyle }) {
  const content = scroll ? <ScrollView contentContainerStyle={[styles.scroll, style]} showsVerticalScrollIndicator={false}>{children}</ScrollView> : <View style={[styles.scroll, style]}>{children}</View>;
  return <SafeAreaView style={styles.safe}>{content}</SafeAreaView>;
}

export function Card({ children, style, tone = "surface" }: { children: React.ReactNode; style?: ViewStyle; tone?: "surface" | "moss" | "sun" }) {
  return <View style={[styles.card, tone === "moss" && styles.cardMoss, tone === "sun" && styles.cardSun, style]}>{children}</View>;
}

export function Button({ children, variant = "primary", style, ...props }: Omit<PressableProps, "style"> & { children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; style?: ViewStyle }) {
  return <Pressable accessibilityRole="button" style={({ pressed }) => [styles.button, variant === "secondary" && styles.buttonSecondary, variant === "ghost" && styles.buttonGhost, variant === "danger" && styles.buttonDanger, pressed && styles.pressed, style]} {...props}><Text style={[styles.buttonText, variant !== "primary" && styles.buttonTextDark, variant === "danger" && styles.buttonTextDanger]}>{children}</Text></Pressable>;
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

export function Avatar({ emoji, size = 58 }: { emoji: string; size?: number }) {
  return <View accessible accessibilityLabel="Dog avatar" style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}><Text style={{ fontSize: size * 0.52 }}>{emoji}</Text></View>;
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return <Card tone="moss" style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text>{body ? <Text style={styles.emptyBody}>{body}</Text> : null}</Card>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
  avatar: { backgroundColor: colors.sun, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", gap: spacing.sm },
  emptyTitle: { ...typography.heading, color: colors.text, textAlign: "center" },
  emptyBody: { ...typography.body, color: colors.muted, textAlign: "center" },
});
