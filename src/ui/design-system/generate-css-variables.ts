/**
 * Generate CSS variables from design tokens
 * This ensures TypeScript tokens and CSS variables stay in sync
 */

import { designTokens } from './tokens';

/**
 * Flatten nested token objects into CSS variable names
 */
function flattenTokens(
  obj: Record<string, any>,
  prefix = '',
  result: Record<string, string> = {}
): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle objects with DEFAULT property (e.g., colors.primary.DEFAULT)
      if ('DEFAULT' in value) {
        result[newKey] = value.DEFAULT;
        // Also add nested properties
        flattenTokens(value, newKey, result);
      } else {
        flattenTokens(value, newKey, result);
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      result[newKey] = String(value);
    }
  }

  return result;
}

/**
 * Generate CSS variables string from design tokens
 */
export function generateCSSVariables(): string {
  const variables: Record<string, string> = {};

  // Colors
  const colorVars = flattenTokens(designTokens.colors, 'color');
  Object.assign(variables, colorVars);

  // Typography
  const typographyVars = flattenTokens(designTokens.typography, 'font');
  Object.assign(variables, typographyVars);

  // Spacing
  const spacingVars = flattenTokens(designTokens.spacing, 'spacing');
  Object.assign(variables, spacingVars);

  // Radius
  const radiusVars = flattenTokens(designTokens.radius, 'radius');
  Object.assign(variables, radiusVars);

  // Shadows
  const shadowVars = flattenTokens(designTokens.shadows, 'shadow');
  Object.assign(variables, shadowVars);

  // Transitions
  const transitionVars = flattenTokens(designTokens.transitions, 'transition');
  Object.assign(variables, transitionVars);

  // Z-index
  const zIndexVars = flattenTokens(designTokens.zIndex, 'z');
  Object.assign(variables, zIndexVars);

  // Generate CSS string
  const cssLines = Object.entries(variables)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  --${cssKey}: ${value};`;
    })
    .sort();

  return `:root {\n${cssLines.join('\n')}\n}`;
}

/**
 * Generate CSS file content with all variables
 */
export function generateCSSFile(): string {
  return `/**
 * Auto-generated CSS variables from design tokens
 * DO NOT EDIT MANUALLY - This file is generated from src/ui/design-system/tokens.ts
 * 
 * To regenerate: Run the generateCSSVariables() function
 */

${generateCSSVariables()}

/* Legacy variable mappings for backward compatibility */
:root {
  /* Color aliases */
  --color-primary: var(--color-primary-default);
  --color-primary-light: var(--color-primary-light);
  --color-primary-dark: var(--color-primary-dark);
  --color-secondary: var(--color-secondary-default);
  --color-accent: var(--color-accent-default);
  
  /* Background aliases */
  --color-background: var(--color-background-page);
  --color-surface: var(--color-background-card);
  
  /* Text aliases */
  --color-text: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-text-tertiary: var(--color-text-tertiary);
  
  /* Border aliases */
  --color-border: var(--color-border-default);
  --color-border-subtle: var(--color-border-subtle);
  
  /* Status colors */
  --color-success: var(--color-semantic-success-default);
  --color-error: var(--color-semantic-error-default);
  --color-warning: var(--color-semantic-warning-default);
  --color-info: var(--color-semantic-info-default);
  
  /* Spacing aliases (using perfect measure) */
  --perfect-padding-horizontal: var(--spacing-4);
  --perfect-padding-vertical: var(--spacing-3);
  --perfect-margin-bottom: var(--spacing-2);
  --perfect-gap: var(--spacing-2);
  --perfect-header-padding: var(--spacing-4);
  
  /* Typography aliases */
  --font-family: var(--font-font-family-primary);
  --font-size-xs: var(--font-font-size-xs);
  --font-size-sm: var(--font-font-size-sm);
  --font-size-base: var(--font-font-size-base);
  --font-size-lg: var(--font-font-size-lg);
  --font-size-xl: var(--font-font-size-xl);
  --font-size-xxl: var(--font-font-size-2xl);
  --font-size-xxxl: var(--font-font-size-3xl);
  --font-size-display: var(--font-font-size-4xl);
  
  --font-weight-normal: var(--font-font-weight-normal);
  --font-weight-medium: var(--font-font-weight-medium);
  --font-weight-semibold: var(--font-font-weight-semibold);
  --font-weight-bold: var(--font-font-weight-bold);
  
  /* Radius aliases */
  --border-radius-sm: var(--radius-sm);
  --border-radius-md: var(--radius-md);
  --border-radius-lg: var(--radius-lg);
  --border-radius-xl: var(--radius-xl);
  --border-radius-xxl: var(--radius-2xl);
  --border-radius-full: var(--radius-full);
  
  /* Shadow aliases */
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
  
  /* Transition aliases */
  --transition-fast: var(--transition-fast);
  --transition-base: var(--transition-base);
  --transition-slow: var(--transition-slow);
}
`;
}
