import { Platform } from "react-native";

export const colors = {
  background: "#F7F4ED",
  surface: "#FFFFFF",
  surfaceAlt: "#EAF1EC",
  text: "#20332B",
  muted: "#6F7C75",
  primary: "#2F6B5F",
  primaryDark: "#235247",
  moss: "#DDEBE5",
  terracotta: "#D97C59",
  sun: "#E9C568",
  success: "#2F7D5D",
  attention: "#A94F48",
  border: "#E3E8E2",
  shadow: "rgba(32, 51, 43, 0.08)",
};

export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30, xxl: 42 };

export const typography = {
  display: { fontSize: 31, lineHeight: 36, fontWeight: "800" as const, letterSpacing: -0.7 },
  title: { fontSize: 23, lineHeight: 29, fontWeight: "800" as const, letterSpacing: -0.3 },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: "700" as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "500" as const },
  small: { fontSize: 12, lineHeight: 17, fontWeight: "600" as const },
};

export const shadow = Platform.select({
  ios: { shadowColor: colors.text, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  android: { elevation: 3 },
  default: {},
});
