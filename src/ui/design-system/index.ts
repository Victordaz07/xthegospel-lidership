/**
 * Design System Entry Point
 * Export all design system utilities and tokens
 */

export { designTokens, getToken } from './tokens';
export type {
  DesignTokens,
  ColorToken,
  SpacingToken,
  RadiusToken,
  ShadowToken,
} from './tokens';

export { generateCSSVariables, generateCSSFile } from './generate-css-variables';

// Re-export for convenience
export { designTokens as theme } from './tokens';
