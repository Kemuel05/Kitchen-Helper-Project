export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,

  screenHorizontal: 24,
  screenTop: 70,
  screenBottom: 120,

  cardPadding: 16,
  sectionGap: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
  round: 999,
} as const;

export const sizes = {
  iconSmall: 24,
  iconMedium: 42,
  iconLarge: 58,

  buttonHeight: 50,
  tabBarHeight: 85,
} as const;

export type AppSpacing = typeof spacing;
export type AppRadius = typeof radius;
export type AppSizes = typeof sizes;