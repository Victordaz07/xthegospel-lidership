/**
 * Unified Design System Tokens
 * Single source of truth for all design tokens
 * These tokens are used to generate CSS variables automatically
 */

export const designTokens = {
  // Colors - Semantic naming (palette: teal primary + amber accent; change here for other colors)
  colors: {
    // Primary brand colors (reverent deep blue)
    primary: {
      50: '#EEF3FA',
      100: '#DDE7F5',
      200: '#B8CAE9',
      300: '#8FAAD9',
      400: '#5F82C2',
      500: '#355E9B',
      600: '#2C4F83',
      700: '#243F6B',
      800: '#1F3358',
      900: '#162541',
      DEFAULT: '#1F3A5F',
      light: '#3A4F7A',
      dark: '#162541',
    },

    // Secondary colors (blue-gray)
    secondary: {
      50: '#F0F3F8',
      100: '#E1E7F0',
      200: '#C3CFE0',
      300: '#A3B2CB',
      400: '#7F8FB1',
      500: '#3A4F7A',
      600: '#314366',
      700: '#283653',
      800: '#1F2A41',
      900: '#162032',
      DEFAULT: '#3A4F7A',
      light: '#7F8FB1',
      dark: '#283653',
    },

    // Accent colors (muted brass / old gold — should whisper, not shout)
    accent: {
      50: '#F8F3ED',
      100: '#EFE4D8',
      200: '#DCC7AE',
      300: '#C9A882',
      400: '#B88F63',
      500: '#A67C52',
      600: '#8C6340',
      700: '#6F4D32',
      800: '#523826',
      900: '#3A271B',
      DEFAULT: '#A67C52',
      light: '#C9A882',
      dark: '#8C6340',
    },

    // Neutral colors
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAF7',
      100: '#F5F3EE',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#0F172A',
    },

    // Semantic colors
    semantic: {
      success: {
        DEFAULT: '#10B981',
        light: '#D1FAE5',
        dark: '#059669',
      },
      warning: {
        DEFAULT: '#F59E0B',
        light: '#FEF3C7',
        dark: '#D97706',
      },
      error: {
        DEFAULT: '#EF4444',
        light: '#FEE2E2',
        dark: '#DC2626',
      },
      info: {
        DEFAULT: '#3B82F6',
        light: '#DBEAFE',
        dark: '#2563EB',
      },
    },

    // Background colors
    background: {
      page: '#FAFAF7',
      card: '#FFFFFF',
      elevated: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Text colors
    text: {
      primary: '#1C2430',
      secondary: '#465365',
      tertiary: '#7B8796',
      disabled: '#B9C1CC',
      inverse: '#FFFFFF',
    },

    // Border colors
    border: {
      subtle: '#E6E0D8',
      default: '#ECECEC',
      strong: '#D8D2C8',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },

    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '40px',
      '5xl': '48px',
    },

    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Spacing scale (8px base)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  // Border radius
  radius: {
    none: '0px',
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Transitions
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
    slower: '500ms ease',
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Breakpoints (for JS usage)
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type exports
export type DesignTokens = typeof designTokens;
export type ColorToken = keyof typeof designTokens.colors;
export type SpacingToken = keyof typeof designTokens.spacing;
export type RadiusToken = keyof typeof designTokens.radius;
export type ShadowToken = keyof typeof designTokens.shadows;

// Helper function to get token value
export function getToken(path: string): string {
  const keys = path.split('.');
  let value: any = designTokens;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      throw new Error(`Token not found: ${path}`);
    }
  }

  return typeof value === 'string' ? value : value.DEFAULT || value;
}
