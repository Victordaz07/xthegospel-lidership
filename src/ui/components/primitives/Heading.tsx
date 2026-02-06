/**
 * Heading - Typography component for headings
 * 
 * For page titles, section headers, and other heading text.
 * Uses design system typography tokens exclusively.
 * 
 * @example
 * <Heading as="h1">Page Title</Heading>
 * <Heading as="h2" size="2xl">Section Title</Heading>
 * <Heading as="h3" size="lg" color="secondary">Subsection</Heading>
 */

import React, { CSSProperties, ReactNode, forwardRef } from 'react';
import './Heading.css';

// Heading size tokens
type HeadingSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type HeadingColor = 'primary' | 'secondary' | 'tertiary' | 'inverse';
type HeadingAlign = 'left' | 'center' | 'right';

// Heading level
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface HeadingProps {
  /** Content to render */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles (use sparingly) */
  style?: CSSProperties;
  /** HTML heading element to render */
  as?: HeadingLevel;
  
  // Typography props
  /** Font size (typography token) - overrides default based on `as` */
  size?: HeadingSize;
  /** Font weight (typography token) */
  weight?: HeadingWeight;
  /** Text color (semantic color) */
  color?: HeadingColor;
  /** Line height */
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal';
  /** Text alignment */
  align?: HeadingAlign;
  
  // Layout props
  /** Truncate text with ellipsis */
  truncate?: boolean;
  
  // Accessibility
  /** ID for the element (useful for anchors) */
  id?: string;
}

/**
 * Default sizes for heading levels
 */
const defaultSizes: Record<HeadingLevel, HeadingSize> = {
  h1: '4xl',
  h2: '3xl',
  h3: '2xl',
  h4: 'xl',
  h5: 'lg',
  h6: 'base',
};

/**
 * Map color to CSS variable
 */
const getColorVar = (color: HeadingColor | undefined): string | undefined => {
  if (!color) return undefined;
  
  const colorMap: Record<HeadingColor, string> = {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
    inverse: 'var(--color-text-inverse)',
  };
  
  return colorMap[color];
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(({
  children,
  className = '',
  style = {},
  as: Component = 'h2',
  size,
  weight = 'semibold',
  color,
  lineHeight = 'tight',
  align,
  truncate,
  id,
}, ref) => {
  // Use provided size or default based on heading level
  const effectiveSize = size || defaultSizes[Component];
  
  // Build computed styles
  const computedStyle: CSSProperties = {
    fontSize: `var(--font-font-size-${effectiveSize})`,
    fontWeight: `var(--font-font-weight-${weight})`,
    lineHeight: `var(--font-line-height-${lineHeight})`,
    ...(color && { color: getColorVar(color) }),
    ...(align && { textAlign: align }),
    ...style,
  };

  // Build class names
  const classes = [
    'ui-heading',
    `ui-heading--${Component}`,
    truncate ? 'ui-heading--truncate' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component
      ref={ref}
      className={classes}
      style={computedStyle}
      id={id}
    >
      {children}
    </Component>
  );
});

Heading.displayName = 'Heading';

// Convenience components for specific heading levels
export const H1 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'as'>>((props, ref) => (
  <Heading ref={ref} as="h1" {...props} />
));
H1.displayName = 'H1';

export const H2 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'as'>>((props, ref) => (
  <Heading ref={ref} as="h2" {...props} />
));
H2.displayName = 'H2';

export const H3 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'as'>>((props, ref) => (
  <Heading ref={ref} as="h3" {...props} />
));
H3.displayName = 'H3';

export const H4 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'as'>>((props, ref) => (
  <Heading ref={ref} as="h4" {...props} />
));
H4.displayName = 'H4';

export const H5 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'as'>>((props, ref) => (
  <Heading ref={ref} as="h5" {...props} />
));
H5.displayName = 'H5';

export const H6 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'as'>>((props, ref) => (
  <Heading ref={ref} as="h6" {...props} />
));
H6.displayName = 'H6';
