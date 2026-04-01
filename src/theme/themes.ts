import { Colors, Shadows } from './tokens';

export type ThemeId = 'default' | 'midnight' | 'saffron' | 'minimal' | 'cartoon' | 'glass' | 'neu';

export interface ThemeColors {
  primary: string;
  primaryContainer: string;
  primaryFixed: string;
  secondary: string;
  secondaryContainer: string;
  secondaryFixed: string;
  surface: string;
  surfaceLowest: string;
  surfaceLow: string;
  surfaceHigh: string;
  surfaceHighest: string;
  green: string;
  greenContainer: string;
  greenBg: string;
  red: string;
  redContainer: string;
  ink: string;
  onPrimary: string;
  muted: string;
  mutedLight: string;
  border: string;
  overlay: string;
  // Extra for dark mode
  cardBg: string;
  heroBg: string[];
}

// Colors are extracted exactly from udharbook-final-v2.html CSS variables
// --bg→surface, --card→cardBg, --ink→ink, --p→primary, --p2→primaryContainer,
// --p-fix→primaryFixed, --green→green, --green-bg→greenBg, --red→red,
// --red-bg→redContainer, --muted→muted, --surf-low→surfaceLow, --surf-lowest→surfaceLowest

export const themeColors: Record<ThemeId, ThemeColors> = {
  // 1. Ledger-Luxe (DEFAULT) — matches :root in HTML
  default: {
    primary: '#000666',           // --p
    primaryContainer: '#1a237e',  // --p2
    primaryFixed: '#e0e0ff',      // --p-fix
    secondary: '#7e5700',         // --s
    secondaryContainer: '#feb300',// --s-con
    secondaryFixed: '#ffdeac',    // --s-fix
    surface: '#f7f9fc',           // --bg
    surfaceLowest: '#ffffff',     // --surf-lowest
    surfaceLow: '#f2f4f7',        // --surf-low
    surfaceHigh: '#e6e8eb',       // --surf-high
    surfaceHighest: '#dde0e3',
    green: '#5aa958',             // --green
    greenContainer: '#ccefcb',
    greenBg: '#003909',           // --green-bg
    red: '#93000a',               // --red
    redContainer: '#ffdad6',      // --red-bg
    ink: '#191c1e',               // --ink
    onPrimary: '#ffffff',
    muted: '#454652',             // --muted
    mutedLight: '#8b8d97',
    border: 'rgba(0,7,103,0.10)',
    overlay: 'rgba(0,7,103,0.04)',
    cardBg: '#ffffff',            // --card
    heroBg: ['#000666', '#1a237e'],
  },

  // 2. Cartoon — matches body.t-cartoon
  cartoon: {
    primary: '#FFD93D',           // --p
    primaryContainer: '#FF8C42',  // --p2
    primaryFixed: '#fff3b0',
    secondary: '#FF6B6B',         // --red used as accent
    secondaryContainer: '#ffd5d5',
    secondaryFixed: '#FFF8F0',
    surface: '#FFF8F0',           // --bg
    surfaceLowest: '#ffffff',     // --surf-lowest
    surfaceLow: '#f5f2ee',        // --surf-low
    surfaceHigh: '#ffe8d6',
    surfaceHighest: '#ffd6b8',
    green: '#00C77A',             // --green
    greenContainer: '#ccfcec',
    greenBg: '#005c38',
    red: '#FF6B6B',               // --red
    redContainer: '#ffd5d5',
    ink: '#1a1a2e',               // --ink
    onPrimary: '#1a1a2e',         // cartoon buttons have dark text
    muted: '#999999',             // --muted
    mutedLight: '#bbbbbb',
    border: 'rgba(26,26,46,0.15)',
    overlay: 'rgba(26,26,46,0.05)',
    cardBg: '#ffffff',            // --card
    heroBg: ['#FF8C42', '#FFD93D'],
  },

  // 3. Midnight — matches body.t-midnight
  midnight: {
    primary: '#7C3AED',           // --p
    primaryContainer: '#5B21B6',  // --p2
    primaryFixed: 'rgba(124,58,237,0.20)',
    secondary: '#10B981',         // --green as accent
    secondaryContainer: 'rgba(16,185,129,0.15)',
    secondaryFixed: 'rgba(16,185,129,0.08)',
    surface: '#13131A',           // --bg
    surfaceLowest: '#1E1E2C',     // --surf-lowest / --card
    surfaceLow: '#1a1a28',        // --surf-low
    surfaceHigh: '#25253a',
    surfaceHighest: '#2e2e48',
    green: '#10B981',             // --green
    greenContainer: 'rgba(16,185,129,0.15)',
    greenBg: 'rgba(16,185,129,0.25)',
    red: '#EF4444',               // --red
    redContainer: 'rgba(239,68,68,0.15)',
    ink: '#E8E8F0',               // --ink
    onPrimary: '#ffffff',
    muted: '#6B7280',             // --muted
    mutedLight: '#4B5563',
    border: 'rgba(124,58,237,0.20)',
    overlay: 'rgba(124,58,237,0.08)',
    cardBg: '#1E1E2C',            // --card
    heroBg: ['#0D0D14', '#7C3AED'],
  },

  // 4. Saffron — matches body.t-saffron
  saffron: {
    primary: '#FF6B00',           // --p
    primaryContainer: '#E85D04',  // --p2
    primaryFixed: 'rgba(255,107,0,0.10)',
    secondary: '#2D6A4F',         // --green as secondary
    secondaryContainer: 'rgba(45,106,79,0.15)',
    secondaryFixed: '#d1fae5',
    surface: '#FFF9F0',           // --bg
    surfaceLowest: '#ffffff',     // --surf-lowest
    surfaceLow: '#fef3e8',        // --surf-low
    surfaceHigh: '#fde4c8',
    surfaceHighest: '#fbd0a8',
    green: '#2D6A4F',             // --green
    greenContainer: '#d1fae5',
    greenBg: '#1b4332',
    red: '#C1121F',               // --red
    redContainer: '#fce0e0',
    ink: '#3D1C02',               // --ink
    onPrimary: '#ffffff',
    muted: '#9C6644',             // --muted
    mutedLight: '#c49a72',
    border: 'rgba(255,107,0,0.15)',
    overlay: 'rgba(255,107,0,0.05)',
    cardBg: '#ffffff',            // --card
    heroBg: ['#FF6B00', '#DC2F02'],
  },

  // 5. Glass — matches body.t-glass
  glass: {
    primary: '#FFD93D',           // --p
    primaryContainer: '#FF8C42',  // --p2
    primaryFixed: 'rgba(255,217,61,0.15)',
    secondary: '#00FF96',         // --green
    secondaryContainer: 'rgba(0,255,150,0.12)',
    secondaryFixed: 'rgba(0,255,150,0.06)',
    surface: '#0f0c1a',           // --bg
    surfaceLowest: 'rgba(255,255,255,0.07)', // --surf-lowest / --card
    surfaceLow: 'rgba(255,255,255,0.04)',    // --surf-low
    surfaceHigh: 'rgba(255,255,255,0.10)',
    surfaceHighest: 'rgba(255,255,255,0.15)',
    green: '#00FF96',             // --green
    greenContainer: 'rgba(0,255,150,0.12)',
    greenBg: 'rgba(0,255,150,0.25)',
    red: '#FF5064',               // --red
    redContainer: 'rgba(255,80,100,0.15)',
    ink: '#ffffff',               // --ink
    onPrimary: '#0f0c1a',
    muted: 'rgba(255,255,255,0.45)', // --muted
    mutedLight: 'rgba(255,255,255,0.28)',
    border: 'rgba(255,255,255,0.08)',
    overlay: 'rgba(255,255,255,0.03)',
    cardBg: 'rgba(255,255,255,0.07)', // --card
    heroBg: ['#1a0533', '#0d1f3c'],
  },

  // 6. Neu — matches body.t-neu
  neu: {
    primary: '#4A90D9',           // --p
    primaryContainer: '#2d3561',  // --p2
    primaryFixed: '#dce8f5',
    secondary: '#00a86b',         // --green as secondary
    secondaryContainer: '#ccf0e4',
    secondaryFixed: '#e8f7f2',
    surface: '#E4EBF5',           // --bg / --card (same)
    surfaceLowest: '#eef2f8',     // --surf-lowest
    surfaceLow: '#dde5f0',        // --surf-low
    surfaceHigh: '#cdd8ea',
    surfaceHighest: '#bdc9db',
    green: '#00a86b',             // --green
    greenContainer: '#ccf0e4',
    greenBg: '#005238',
    red: '#e05050',               // --red
    redContainer: '#fce0e0',
    ink: '#2d3561',               // --ink
    onPrimary: '#ffffff',
    muted: '#9baab8',             // --muted
    mutedLight: '#b8c5d6',
    border: 'rgba(74,144,217,0.18)',
    overlay: 'rgba(74,144,217,0.06)',
    cardBg: '#E4EBF5',            // --card (same as --bg in neu)
    heroBg: ['#2d3561', '#4A90D9'],
  },

  // 7. Minimal — matches body.t-minimal (iOS-like)
  minimal: {
    primary: '#007AFF',           // --p
    primaryContainer: '#5856D6',  // --p2
    primaryFixed: 'rgba(0,122,255,0.10)',
    secondary: '#34C759',         // --green as secondary
    secondaryContainer: 'rgba(52,199,89,0.15)',
    secondaryFixed: '#e8fdf0',
    surface: '#F2F2F7',           // --bg
    surfaceLowest: '#ffffff',     // --surf-lowest / --card
    surfaceLow: '#F2F2F7',        // --surf-low
    surfaceHigh: '#E5E5EA',
    surfaceHighest: '#D1D1D6',
    green: '#34C759',             // --green
    greenContainer: '#e8fdf0',
    greenBg: '#1a6b35',
    red: '#FF3B30',               // --red
    redContainer: '#ffe5e3',
    ink: '#1C1C1E',               // --ink
    onPrimary: '#ffffff',
    muted: '#8E8E93',             // --muted
    mutedLight: '#C7C7CC',
    border: 'rgba(0,0,0,0.08)',
    overlay: 'rgba(0,0,0,0.03)',
    cardBg: '#ffffff',            // --card
    heroBg: ['#007AFF', '#5856D6'],
  },
};

// HTML body class for each theme (matches udharbook-final-v2.html)
export const themeHtmlClass: Record<ThemeId, string> = {
  default:  't-luxe',
  midnight: 't-midnight',
  saffron:  't-saffron',
  minimal:  't-minimal',
  cartoon:  't-cartoon',
  glass:    't-glass',
  neu:      't-neu',
};

export const themeMeta: Record<ThemeId, { label: string; emoji: string; preview: string; previewBg: string }> = {
  default:  { label: 'Indigo',   emoji: '💙', preview: '#000666', previewBg: '#e0e0ff' },
  midnight: { label: 'Midnight', emoji: '🌙', preview: '#818cf8', previewBg: '#1e1b4b' },
  saffron:  { label: 'Saffron',  emoji: '🧡', preview: '#b45309', previewBg: '#fef3c7' },
  minimal:  { label: 'Minimal',  emoji: '🤍', preview: '#18181b', previewBg: '#f4f4f5' },
  cartoon:  { label: 'Cartoon',  emoji: '🎨', preview: '#FF8C42', previewBg: '#FFF8F0' },
  glass:    { label: 'Glass',    emoji: '✨', preview: '#FFD93D', previewBg: '#0f0c1a' },
  neu:      { label: 'Neu',      emoji: '🫧', preview: '#4A90D9', previewBg: '#E4EBF5' },
};

export const themeShadows = (colors: ThemeColors) => ({
  sm: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  md: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 6,
  },
  lg: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 10,
  },
});
