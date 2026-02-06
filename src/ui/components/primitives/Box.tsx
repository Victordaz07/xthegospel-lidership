/**
 * Box - Primitive container component
 * 
 * The foundational building block for layout composition.
 * Uses design system tokens exclusively via CSS variables.
 * 
 * @example
 * <Box padding="4" radius="lg" shadow="sm" bg="--color-background-card">
 *   Content here
 * </Box>
 */

import React, { CSSProperties, ReactNode, forwardRef } from 'react';
import './Box.css';

// Spacing tokens available in the design system
type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

// Radius tokens available in the design system
type RadiusValue = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

// Shadow tokens available in the design system
type ShadowValue = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';

export interface BoxProps {
  /** Content to render inside the box */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles (use sparingly, prefer tokens) */
  style?: CSSProperties;
  /** HTML element to render as */
  as?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'nav' | 'span';
  
  // Spacing props - use token values
  /** Padding on all sides (spacing token: 0-24) */
  padding?: SpacingValue;
  /** Horizontal padding (spacing token: 0-24) */
  paddingX?: SpacingValue;
  /** Vertical padding (spacing token: 0-24) */
  paddingY?: SpacingValue;
  /** Top padding (spacing token: 0-24) */
  paddingTop?: SpacingValue;
  /** Bottom padding (spacing token: 0-24) */
  paddingBottom?: SpacingValue;
  /** Left padding (spacing token: 0-24) */
  paddingLeft?: SpacingValue;
  /** Right padding (spacing token: 0-24) */
  paddingRight?: SpacingValue;
  
  /** Margin on all sides (spacing token: 0-24) */
  margin?: SpacingValue;
  /** Horizontal margin (spacing token: 0-24) */
  marginX?: SpacingValue;
  /** Vertical margin (spacing token: 0-24) */
  marginY?: SpacingValue;
  /** Top margin (spacing token: 0-24) */
  marginTop?: SpacingValue;
  /** Bottom margin (spacing token: 0-24) */
  marginBottom?: SpacingValue;
  /** Left margin (spacing token: 0-24) */
  marginLeft?: SpacingValue;
  /** Right margin (spacing token: 0-24) */
  marginRight?: SpacingValue;
  
  // Sizing
  /** Width - can be CSS value or 'full' for 100% */
  width?: string | number | 'full';
  /** Height - can be CSS value or 'full' for 100% */
  height?: string | number | 'full';
  /** Maximum width */
  maxWidth?: string | number;
  /** Minimum width */
  minWidth?: string | number;
  /** Maximum height */
  maxHeight?: string | number;
  /** Minimum height */
  minHeight?: string | number;
  
  // Visual props
  /** Background color - CSS variable name (e.g., '--color-background-card') */
  bg?: string;
  /** Border - CSS value (e.g., '1px solid var(--color-border-default)') */
  border?: string;
  /** Border radius (radius token) */
  radius?: RadiusValue;
  /** Box shadow (shadow token) */
  shadow?: ShadowValue;
  /** Overflow behavior */
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  /** Position */
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  
  // Interaction
  /** Click handler - if provided, adds pointer cursor */
  onClick?: () => void;
  /** Makes the element focusable */
  tabIndex?: number;
  /** Role for accessibility */
  role?: string;
  /** Aria label for accessibility */
  'aria-label'?: string;
}

/**
 * Convert spacing token to CSS variable
 */
const getSpacingVar = (value: SpacingValue | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return `var(--spacing-${value})`;
};

/**
 * Convert size value to CSS value
 */
const getSizeValue = (value: string | number | 'full' | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (value === 'full') return '100%';
  if (typeof value === 'number') return `${value}px`;
  return value;
};

export const Box = forwardRef<HTMLDivElement, BoxProps>(({
  children,
  className = '',
  style = {},
  as: Component = 'div',
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  margin,
  marginX,
  marginY,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  width,
  height,
  maxWidth,
  minWidth,
  maxHeight,
  minHeight,
  bg,
  border,
  radius,
  shadow,
  overflow,
  position,
  onClick,
  tabIndex,
  role,
  'aria-label': ariaLabel,
}, ref) => {
  // Build computed styles from props
  const computedStyle: CSSProperties = {
    ...style,
    // Padding
    ...(padding !== undefined && { padding: getSpacingVar(padding) }),
    ...(paddingX !== undefined && { 
      paddingLeft: getSpacingVar(paddingX), 
      paddingRight: getSpacingVar(paddingX) 
    }),
    ...(paddingY !== undefined && { 
      paddingTop: getSpacingVar(paddingY), 
      paddingBottom: getSpacingVar(paddingY) 
    }),
    ...(paddingTop !== undefined && { paddingTop: getSpacingVar(paddingTop) }),
    ...(paddingBottom !== undefined && { paddingBottom: getSpacingVar(paddingBottom) }),
    ...(paddingLeft !== undefined && { paddingLeft: getSpacingVar(paddingLeft) }),
    ...(paddingRight !== undefined && { paddingRight: getSpacingVar(paddingRight) }),
    
    // Margin
    ...(margin !== undefined && { margin: getSpacingVar(margin) }),
    ...(marginX !== undefined && { 
      marginLeft: getSpacingVar(marginX), 
      marginRight: getSpacingVar(marginX) 
    }),
    ...(marginY !== undefined && { 
      marginTop: getSpacingVar(marginY), 
      marginBottom: getSpacingVar(marginY) 
    }),
    ...(marginTop !== undefined && { marginTop: getSpacingVar(marginTop) }),
    ...(marginBottom !== undefined && { marginBottom: getSpacingVar(marginBottom) }),
    ...(marginLeft !== undefined && { marginLeft: getSpacingVar(marginLeft) }),
    ...(marginRight !== undefined && { marginRight: getSpacingVar(marginRight) }),
    
    // Sizing
    ...(width !== undefined && { width: getSizeValue(width) }),
    ...(height !== undefined && { height: getSizeValue(height) }),
    ...(maxWidth !== undefined && { maxWidth: getSizeValue(maxWidth) }),
    ...(minWidth !== undefined && { minWidth: getSizeValue(minWidth) }),
    ...(maxHeight !== undefined && { maxHeight: getSizeValue(maxHeight) }),
    ...(minHeight !== undefined && { minHeight: getSizeValue(minHeight) }),
    
    // Visual
    ...(bg && { backgroundColor: bg.startsWith('--') ? `var(${bg})` : bg }),
    ...(border && { border }),
    ...(radius && { borderRadius: `var(--radius-${radius})` }),
    ...(shadow && { boxShadow: `var(--shadow-${shadow})` }),
    ...(overflow && { overflow }),
    ...(position && { position }),
    
    // Interaction
    ...(onClick && { cursor: 'pointer' }),
  };

  return (
    <Component
      ref={ref as any}
      className={`ui-box ${className}`.trim()}
      style={computedStyle}
      onClick={onClick}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  );
});

Box.displayName = 'Box';
