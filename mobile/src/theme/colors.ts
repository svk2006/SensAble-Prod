export const colors = {
  // Background & Surfaces
  background: '#FBF9F4',
  surface: '#FFFFFF',
  surfaceContainer: '#F0EEE9',

  // Primary Brand Accent (Teal)
  primaryTeal: '#00A8A8',
  darkTealText: '#006A6A',

  // Secondary Brand Accent (Coral)
  warmCoral: '#FF7F6B',
  darkCoralText: '#A43B2D',

  // Sensory & Active Success Indicator (Green)
  brightGreen: '#2ECC71',
  darkGreenText: '#006D37',

  // Semantic Warning (Amber)
  warning: '#F59E0B',
  darkWarningText: '#B45309',

  // Semantic Error
  error: '#BA1A1A',
  darkErrorText: '#93000A',

  // Typography & Neutral Text
  primaryBodyText: '#1B1C19',
  secondaryBodyText: '#3C4949',

  // Interactive States & Borders
  disabledBackground: '#E4E2DD',
  disabledText: '#6C7A79',
  border: '#BBC9C8',
  overlay: 'rgba(27, 28, 25, 0.4)',
} as const;

export type ColorToken = keyof typeof colors;
