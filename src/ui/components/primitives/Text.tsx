/**
 * Text - Typography component for body text
 * 
 * For paragraph text, labels, captions, and other non-heading text.
 * Uses design system typography tokens exclusively.
 * 
 * @example
 * <Text>Default body text</Text>
 * <Text size="sm" color="secondary">Small secondary text</Text>
 * <Text weight="semibold" truncate>Truncated bold text...</Text>
 */

import React, { CSSProperties, ReactNode, forwardRef } from 'react';
import './Text.css';

// Typography tokens
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'success' | 'error' | 'warning' | 'info';
type TextAlign = 'left' | 'center' | 'right' | 'justify';
type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export interface TextProps {
  /** Content to render */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles (use sparingly) */
  style?: CSSProperties;
  /** HTML element to render as */
  as?: 'p' | 'span' | 'div' | 'label' | 'strong' | 'em' | 'small' | 'time';
  
  // Typography props
  /** Font size (typography token) */
  size?: TextSize;
  /** Font weight (typography token) */
  weight?: TextWeight;
  /** Text color (semantic color) */
  color?: TextColor;
  /** Line height */
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  /** Letter spacing */
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  /** Text alignment */
  align?: TextAlign;
  /** Text transform */
  transform?: TextTransform;
  
  // Layout props
  /** Truncate text with ellipsis (single line) */
  truncate?: boolean;
  /** Limit to N lines with ellipsis */
  lineClamp?: number;
  /** Prevent text from wrapping */
  noWrap?: boolean;
  /** Allow text to break words */
  breakWord?: boolean;
  
  // Accessibility
  /** ID for the element */
  id?: string;
  /** For label elements - the ID of the associated input */
  htmlFor?: string;
}

/**
 * Map color to CSS variable
 */
const getColorVar = (color: TextColor | undefined): string | undefined => {
  if (!color) return undefined;
  
  const colorMap: Record<TextColor, string> = {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
    disabled: 'var(--color-text-disabled)',
    inverse: 'var(--color-text-inverse)',
    success: 'var(--color-semantic-success-default)',
    error: 'var(--color-semantic-error-default)',
    warning: 'var(--color-semantic-warning-default)',
    info: 'var(--color-semantic-info-default)',
  };
  
  return colorMap[color];
};

export const Text = forwardRef<HTMLElement, TextProps>(({
  children,
  className = '',
  style = {},
  as: Component = 'span',
  size = 'base',
  weight,
  color,
  lineHeight,
  letterSpacing,
  align,
  transform,
  truncate,
  lineClamp,
  noWrap,
  breakWord,
  id,
  htmlFor,
}, ref) => {
  // Build computed styles
  const computedStyle: CSSProperties = {
    fontSize: `var(--font-font-size-${size})`,
    ...(weight && { fontWeight: `var(--font-font-weight-${weight})` }),
    ...(color && { color: getColorVar(color) }),
    ...(lineHeight && { lineHeight: `var(--font-line-height-${lineHeight})` }),
    ...(letterSpacing && { letterSpacing: `var(--font-letter-spacing-${letterSpacing})` }),
    ...(align && { textAlign: align }),
    ...(transform && { textTransform: transform }),
    ...(noWrap && { whiteSpace: 'nowrap' }),
    ...(breakWord && { wordBreak: 'break-word' }),
    ...style,
  };

  // Build class names
  const classes = [
    'ui-text',
    `ui-text--${size}`,
    truncate ? 'ui-text--truncate' : '',
    lineClamp ? 'ui-text--line-clamp' : '',
    className,
  ].filter(Boolean).join(' ');

  // Add line clamp CSS variable if needed
  if (lineClamp) {
    (computedStyle as any)['--line-clamp'] = lineClamp;
  }

  return (
    <Component
      ref={ref as any}
      className={classes}
      style={computedStyle}
      id={id}
      {...(Component === 'label' && htmlFor ? { htmlFor } : {})}
    >
      {children}
    </Component>
  );
});

Text.displayName = 'Text';

// Convenience components for common variants
export const Caption = forwardRef<HTMLElement, Omit<TextProps, 'size'>>((props, ref) => (
  <Text ref={ref} size="xs" color="secondary" {...props} />
));
Caption.displayName = 'Caption';

export const Label = forwardRef<HTMLElement, Omit<TextProps, 'as'>>((props, ref) => (
  <Text ref={ref} as="label" size="sm" weight="medium" {...props} />
));
Label.displayName = 'Label';
