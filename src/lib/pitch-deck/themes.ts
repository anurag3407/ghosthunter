/**
 * ============================================================================
 * PITCH DECK STUDIO - THEME SYSTEM
 * ============================================================================
 * Predefined themes and design tokens for consistent, beautiful decks.
 */

import type { Theme, ThemeTokens, BrandingSettings } from "@/types/pitch-deck";

// ============================================================================
// DEFAULT THEME TOKENS
// ============================================================================

const baseTokens: Partial<ThemeTokens> = {
  fontTitle: "Inter",
  fontBody: "Inter",
  fontMono: "JetBrains Mono",
  spacingUnit: 8,
  borderRadius: 8,
  borderRadiusLarge: 16,
};

// ============================================================================
// PREDEFINED THEMES
// ============================================================================

export const THEMES: Theme[] = [
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Clean, professional dark theme with subtle accents",
    category: "dark",
    tokens: {
      ...baseTokens,
      background: "#0f172a",
      backgroundSecondary: "#1e293b",
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      accent: "#06b6d4",
      textPrimary: "#f8fafc",
      textSecondary: "#94a3b8",
      textMuted: "#64748b",
      border: "#334155",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      shadowSmall: "0 1px 2px rgba(0,0,0,0.3)",
      shadowMedium: "0 4px 6px rgba(0,0,0,0.3)",
      shadowLarge: "0 10px 15px rgba(0,0,0,0.4)",
    } as ThemeTokens,
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    description: "Clean, professional light theme",
    category: "light",
    tokens: {
      ...baseTokens,
      background: "#ffffff",
      backgroundSecondary: "#f8fafc",
      primary: "#2563eb",
      secondary: "#7c3aed",
      accent: "#0891b2",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      textMuted: "#94a3b8",
      border: "#e2e8f0",
      success: "#16a34a",
      warning: "#d97706",
      error: "#dc2626",
      shadowSmall: "0 1px 2px rgba(0,0,0,0.05)",
      shadowMedium: "0 4px 6px rgba(0,0,0,0.1)",
      shadowLarge: "0 10px 15px rgba(0,0,0,0.15)",
    } as ThemeTokens,
  },
  {
    id: "gradient-indigo",
    name: "Gradient Indigo",
    description: "Modern gradient with indigo/purple tones",
    category: "gradient",
    tokens: {
      ...baseTokens,
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
      backgroundSecondary: "#312e81",
      primary: "#818cf8",
      secondary: "#c4b5fd",
      accent: "#f0abfc",
      textPrimary: "#f8fafc",
      textSecondary: "#c7d2fe",
      textMuted: "#a5b4fc",
      border: "#4338ca",
      success: "#34d399",
      warning: "#fbbf24",
      error: "#f87171",
      shadowSmall: "0 1px 2px rgba(0,0,0,0.4)",
      shadowMedium: "0 4px 6px rgba(0,0,0,0.4)",
      shadowLarge: "0 10px 15px rgba(0,0,0,0.5)",
    } as ThemeTokens,
  },
  {
    id: "gradient-sunset",
    name: "Gradient Sunset",
    description: "Warm, energetic gradient theme",
    category: "gradient",
    tokens: {
      ...baseTokens,
      background: "linear-gradient(135deg, #1a0a0a 0%, #4a1d1d 50%, #7f1d1d 100%)",
      backgroundSecondary: "#4a1d1d",
      primary: "#fb923c",
      secondary: "#fbbf24",
      accent: "#f472b6",
      textPrimary: "#fef2f2",
      textSecondary: "#fecaca",
      textMuted: "#f87171",
      border: "#991b1b",
      success: "#4ade80",
      warning: "#fcd34d",
      error: "#fca5a5",
      shadowSmall: "0 1px 2px rgba(0,0,0,0.4)",
      shadowMedium: "0 4px 6px rgba(0,0,0,0.4)",
      shadowLarge: "0 10px 15px rgba(0,0,0,0.5)",
    } as ThemeTokens,
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    description: "Traditional corporate look with blue accents",
    category: "light",
    tokens: {
      ...baseTokens,
      background: "#ffffff",
      backgroundSecondary: "#f0f9ff",
      primary: "#0369a1",
      secondary: "#0284c7",
      accent: "#0ea5e9",
      textPrimary: "#0c4a6e",
      textSecondary: "#0369a1",
      textMuted: "#7dd3fc",
      border: "#bae6fd",
      success: "#15803d",
      warning: "#a16207",
      error: "#b91c1c",
      shadowSmall: "0 1px 2px rgba(0,0,0,0.05)",
      shadowMedium: "0 4px 6px rgba(0,0,0,0.1)",
      shadowLarge: "0 10px 15px rgba(0,0,0,0.15)",
    } as ThemeTokens,
  },
  {
    id: "playful",
    name: "Playful",
    description: "Vibrant and energetic for consumer products",
    category: "light",
    tokens: {
      ...baseTokens,
      background: "#fdf4ff",
      backgroundSecondary: "#fae8ff",
      primary: "#d946ef",
      secondary: "#a855f7",
      accent: "#ec4899",
      textPrimary: "#581c87",
      textSecondary: "#7e22ce",
      textMuted: "#c084fc",
      border: "#e879f9",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      shadowSmall: "0 1px 2px rgba(217,70,239,0.1)",
      shadowMedium: "0 4px 6px rgba(217,70,239,0.15)",
      shadowLarge: "0 10px 15px rgba(217,70,239,0.2)",
    } as ThemeTokens,
  },
  {
    id: "tech-modern",
    name: "Tech Modern",
    description: "Modern tech startup aesthetic",
    category: "dark",
    tokens: {
      ...baseTokens,
      background: "#030712",
      backgroundSecondary: "#111827",
      primary: "#10b981",
      secondary: "#06b6d4",
      accent: "#8b5cf6",
      textPrimary: "#f9fafb",
      textSecondary: "#d1d5db",
      textMuted: "#6b7280",
      border: "#374151",
      success: "#34d399",
      warning: "#fbbf24",
      error: "#f87171",
      shadowSmall: "0 1px 2px rgba(16,185,129,0.1)",
      shadowMedium: "0 4px 6px rgba(16,185,129,0.15)",
      shadowLarge: "0 10px 15px rgba(16,185,129,0.2)",
    } as ThemeTokens,
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep dark theme with cyan accents",
    category: "dark",
    tokens: {
      ...baseTokens,
      background: "#020617",
      backgroundSecondary: "#0f172a",
      primary: "#22d3ee",
      secondary: "#38bdf8",
      accent: "#a78bfa",
      textPrimary: "#f1f5f9",
      textSecondary: "#cbd5e1",
      textMuted: "#64748b",
      border: "#1e293b",
      success: "#4ade80",
      warning: "#facc15",
      error: "#fb7185",
      shadowSmall: "0 1px 2px rgba(34,211,238,0.1)",
      shadowMedium: "0 4px 6px rgba(34,211,238,0.15)",
      shadowLarge: "0 10px 15px rgba(34,211,238,0.2)",
    } as ThemeTokens,
  },
];

// ============================================================================
// THEME UTILITIES
// ============================================================================

/**
 * Get a theme by ID
 */
export function getTheme(themeId: string): Theme | undefined {
  return THEMES.find((t) => t.id === themeId);
}

/**
 * Get the default theme
 */
export function getDefaultTheme(): Theme {
  return THEMES.find((t) => t.id === "minimal-dark") || THEMES[0];
}

/**
 * Apply custom branding to a theme
 */
export function applyBranding(
  theme: Theme,
  branding: BrandingSettings
): Theme {
  const customTokens: Partial<ThemeTokens> = {};

  if (branding.primaryColor) {
    customTokens.primary = branding.primaryColor;
  }
  if (branding.secondaryColor) {
    customTokens.secondary = branding.secondaryColor;
  }
  if (branding.accentColor) {
    customTokens.accent = branding.accentColor;
  }
  if (branding.titleFont) {
    customTokens.fontTitle = branding.titleFont;
  }
  if (branding.bodyFont) {
    customTokens.fontBody = branding.bodyFont;
  }

  return {
    ...theme,
    id: `${theme.id}-custom`,
    name: `${theme.name} (Custom)`,
    tokens: {
      ...theme.tokens,
      ...customTokens,
      ...branding.customTokens,
    },
  };
}

/**
 * Get CSS variables from theme tokens
 */
export function getThemeCSSVariables(tokens: ThemeTokens): Record<string, string> {
  return {
    "--deck-bg": tokens.background,
    "--deck-bg-secondary": tokens.backgroundSecondary,
    "--deck-primary": tokens.primary,
    "--deck-secondary": tokens.secondary,
    "--deck-accent": tokens.accent,
    "--deck-text-primary": tokens.textPrimary,
    "--deck-text-secondary": tokens.textSecondary,
    "--deck-text-muted": tokens.textMuted,
    "--deck-border": tokens.border,
    "--deck-success": tokens.success,
    "--deck-warning": tokens.warning,
    "--deck-error": tokens.error,
    "--deck-font-title": tokens.fontTitle,
    "--deck-font-body": tokens.fontBody,
    "--deck-font-mono": tokens.fontMono,
    "--deck-spacing": `${tokens.spacingUnit}px`,
    "--deck-radius": `${tokens.borderRadius}px`,
    "--deck-radius-lg": `${tokens.borderRadiusLarge}px`,
    "--deck-shadow-sm": tokens.shadowSmall,
    "--deck-shadow-md": tokens.shadowMedium,
    "--deck-shadow-lg": tokens.shadowLarge,
  };
}

/**
 * Get slide background style from theme
 */
export function getSlideBackgroundStyle(tokens: ThemeTokens): React.CSSProperties {
  const bg = tokens.background;
  
  if (bg.startsWith("linear-gradient") || bg.startsWith("radial-gradient")) {
    return { background: bg };
  }
  
  return { backgroundColor: bg };
}

/**
 * Check if theme is dark
 */
export function isDarkTheme(theme: Theme): boolean {
  return theme.category === "dark" || theme.category === "gradient";
}

/**
 * Get contrast text color for a background
 */
export function getContrastColor(backgroundColor: string): string {
  // Simple luminance check (works for hex colors)
  if (backgroundColor.startsWith("#")) {
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#0f172a" : "#f8fafc";
  }
  
  // Default to light text for gradients and other backgrounds
  return "#f8fafc";
}
