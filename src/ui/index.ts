/**
 * UI Kit - Main Export
 * 
 * Import components and theme from this single entry point:
 * 
 * import { Card, Button, PageShell, theme } from '@/ui';
 */

// Design system tokens
export { designTokens, getToken, theme } from './design-system';
export type {
  DesignTokens,
  ColorToken,
  SpacingToken,
  RadiusToken,
  ShadowToken,
} from './design-system';

// Components
export * from './components';
