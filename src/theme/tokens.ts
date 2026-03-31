/**
 * Design Tokens — "Digital Ledger-Luxe"
 * Source: stitch-5/DESIGN.md + udharbook-final-v2.html
 *
 * Rules:
 * - No 1px borders → use surface color shifts
 * - No pure black → use ink (#191c1e)
 * - Min 16px radius, max 48px
 * - Shadows: indigo-tinted rgba(0,7,103,x)
 * - Manrope for display/amounts, Inter for body/labels
 */

export const Colors = {
  // Primary — Deep Indigo
  primary: '#000666',
  primaryContainer: '#1a237e',
  primaryFixed: '#e0e0ff',

  // Secondary — Saffron (Pro/premium)
  secondary: '#7e5700',
  secondaryContainer: '#feb300',
  secondaryFixed: '#ffdeac',

  // Surfaces
  surface: '#f7f9fc',
  surfaceLowest: '#ffffff',
  surfaceLow: '#f2f4f7',
  surfaceHigh: '#e6e8eb',
  surfaceHighest: '#dde0e3',

  // Semantic
  green: '#5aa958',
  greenContainer: '#ccefcb',
  greenBg: '#003909',
  red: '#93000a',
  redContainer: '#ffdad6',

  // Text
  ink: '#191c1e',
  onPrimary: '#ffffff',
  muted: '#454652',
  mutedLight: '#8b8d97',

  // Misc
  border: 'rgba(0,7,103,0.10)',
  overlay: 'rgba(0,7,103,0.04)',
};

export const Shadows = {
  // Indigo-tinted, never pure black
  sm: {
    shadowColor: '#000766',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  md: {
    shadowColor: '#000766',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000766',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 10,
  },
};

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  full: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const FontFamily = {
  display: 'Manrope-Bold',
  displaySemiBold: 'Manrope-SemiBold',
  displayExtraBold: 'Manrope-ExtraBold',
  body: 'Inter',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const LineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
};
