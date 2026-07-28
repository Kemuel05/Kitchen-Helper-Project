export const colors = {
  transparent: "transparent",

  // Background fallbacks
  background: "#F6E3B5",
  backgroundSoft: "#FFF3D4",

  // Cards, forms, and panels
  surface: "#FFF8E7",
  surfaceMuted: "#EED3A0",
  cardBackground: "rgba(255, 248, 231, 0.94)",
  inputBackground: "rgba(255, 248, 231, 0.96)",

  // Main farm-inspired colors
  primary: "#527A3D",
  primaryDark: "#34552B",
  primaryLight: "#B8D28E",

  secondary: "#B96832",
  secondaryLight: "#E0A268",

  accent: "#E5B94E",
  accentLight: "#F6D982",

  // Text
  textPrimary: "#3D2E24",
  textSecondary: "#715D4C",
  textMuted: "#8A7868",
  textOnPrimary: "#FFF8E7",

  // Borders
  border: "#8C5B32",
  borderSoft: "#D4B585",

  // Tabs
  tabBarBackground: "#F1D59D",
  tabActive: "#3E682F",
  tabInactive: "#7A6858",

  // Destructive actions
  danger: "#A84E42",
  dangerSoft: "#F2D3CB",

  // Overlays and shadows
  overlay: "rgba(35, 26, 19, 0.48)",
  shadow: "#2B1D15",
} as const;

export type AppColors = typeof colors;