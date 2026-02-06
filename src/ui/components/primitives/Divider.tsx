/**
 * Divider - Visual separator component
 * 
 * For separating content sections.
 * Uses design system tokens exclusively.
 * 
 * @example
 * <Divider />
 * <Divider orientation="vertical" />
 * <Divider spacing={4} color="subtle" />
 */

import React, { CSSProperties, forwardRef } from 'react';
import './Divider.css';

// Spacing tokens
type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

// Divider color options
type DividerColor = 'subtle' | 'default' | 'strong';

export interface DividerProps {
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Divider orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Margin around the divider (spacing token) */
  spacing?: SpacingValue;
  /** Divider color */
  color?: DividerColor;
  /** Divider thickness */
  thickness?: number;
}

/**
 * Map color to CSS variable
 */
const getColorVar = (color: DividerColor): string => {
  const colorMap: Record<DividerColor, string> = {
    subtle: 'var(--color-border-subtle)',
    default: 'var(--color-border-default)',
    strong: 'var(--color-border-strong)',
  };
  return colorMap[color];
};

export const Divider = forwardRef<HTMLHRElement, DividerProps>(({
  className = '',
  style = {},
  orientation = 'horizontal',
  spacing = 0,
  color = 'default',
  thickness = 1,
}, ref) => {
  const isHorizontal = orientation === 'horizontal';
  
  // Build computed styles
  const computedStyle: CSSProperties = {
    border: 'none',
    backgroundColor: getColorVar(color),
    ...(isHorizontal ? {
      width: '100%',
      height: `${thickness}px`,
      marginTop: spacing ? `var(--spacing-${spacing})` : 0,
      marginBottom: spacing ? `var(--spacing-${spacing})` : 0,
    } : {
      width: `${thickness}px`,
      height: '100%',
      marginLeft: spacing ? `var(--spacing-${spacing})` : 0,
      marginRight: spacing ? `var(--spacing-${spacing})` : 0,
    }),
    ...style,
  };

  return (
    <hr
      ref={ref}
      className={`ui-divider ui-divider--${orientation} ${className}`.trim()}
      style={computedStyle}
      aria-orientation={orientation}
    />
  );
});

Divider.displayName = 'Divider';
