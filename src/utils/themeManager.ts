import { ThemeMode } from '../types';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  description: string;
  bgMain: string;
  bgCard: string;
  bgSurface: string;
  border: string;
  textPrimary: string;
  textMuted: string;
  accent: string;
  accentGlow: string;
  inputBg: string;
  previewClass: string;
}

export const THEME_CONFIGS: Record<Exclude<ThemeMode, 'system' | 'light'>, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Dark Cyber',
    description: 'Neon cyan on deep obsidian, optimized for low-light coding.',
    bgMain: '#0B0F1A',
    bgCard: '#131926',
    bgSurface: '#070A12',
    border: '#1e293b',
    textPrimary: '#f8fafc',
    textMuted: '#94a3b8',
    accent: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    inputBg: '#070A12',
    previewClass: 'from-[#070A12] via-[#0B0F1A] to-[#131926]',
  },
  'cyber-light': {
    id: 'cyber-light',
    name: 'Cyber Light',
    description: 'Ultra-crisp luminescent daylight theme with vivid sky accents.',
    bgMain: '#f1f5f9',
    bgCard: '#ffffff',
    bgSurface: '#f8fafc',
    border: '#cbd5e1',
    textPrimary: '#0f172a',
    textMuted: '#475569',
    accent: '#0284c7',
    accentGlow: 'rgba(2, 132, 199, 0.2)',
    inputBg: '#ffffff',
    previewClass: 'from-slate-200 via-white to-slate-100',
  },
  'midnight-blue': {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Deep oceanic navy with radiant azure cyber highlights.',
    bgMain: '#060e24',
    bgCard: '#0b193d',
    bgSurface: '#040918',
    border: '#1a3066',
    textPrimary: '#f0f9ff',
    textMuted: '#7dd3fc',
    accent: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    inputBg: '#071333',
    previewClass: 'from-[#040918] via-[#060e24] to-[#0b193d]',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Amethyst',
    description: 'Royal synthwave violet & obsidian with glowing purple accents.',
    bgMain: '#120722',
    bgCard: '#1e0d38',
    bgSurface: '#0a0414',
    border: '#3b1c68',
    textPrimary: '#faf5ff',
    textMuted: '#d8b4fe',
    accent: '#c084fc',
    accentGlow: 'rgba(192, 132, 252, 0.25)',
    inputBg: '#190a30',
    previewClass: 'from-[#0a0414] via-[#120722] to-[#1e0d38]',
  },
};

/**
 * Resolves effective theme config based on system preferences if needed
 */
export function resolveThemeConfig(theme: ThemeMode): ThemeConfig {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return THEME_CONFIGS['cyber-light'];
    }
    return THEME_CONFIGS['dark'];
  }
  if (theme === 'light') {
    return THEME_CONFIGS['cyber-light'];
  }
  return THEME_CONFIGS[theme] || THEME_CONFIGS['dark'];
}

/**
 * Applies CSS variables and data attributes to document root and body
 */
export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const resolved = resolveThemeConfig(theme);
  const root = document.documentElement;
  const body = document.body;

  // Set data-theme attribute on root and body
  root.setAttribute('data-theme', theme);
  body.setAttribute('data-theme', theme);

  // Set CSS variables for fine-grained dynamic styling
  const vars: Record<string, string> = {
    '--theme-bg-main': resolved.bgMain,
    '--theme-bg-card': resolved.bgCard,
    '--theme-bg-surface': resolved.bgSurface,
    '--theme-border': resolved.border,
    '--theme-text-primary': resolved.textPrimary,
    '--theme-text-muted': resolved.textMuted,
    '--theme-accent': resolved.accent,
    '--theme-accent-glow': resolved.accentGlow,
    '--theme-input-bg': resolved.inputBg,
  };

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
    body.style.setProperty(key, value);
  });

  // Ensure body background and font color are immediately refreshed
  body.style.backgroundColor = resolved.bgMain;
  body.style.color = resolved.textPrimary;
}
