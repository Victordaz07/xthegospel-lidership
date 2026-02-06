/**
 * Container - Responsive container component
 * 
 * Centers content and applies max-width constraints.
 * Uses design system tokens exclusively.
 * 
 * @example
 * <Container>
 *   <h1>Page content</h1>
 * </Container>
 * 
 * <Container maxWidth="sm" padding={6}>
 *   <form>Form content</form>
 * </Container>
 */

import React, { CSSProperties, ReactNode, forwardRef } from 'react';
import { Box, BoxProps } from './Box';
import './Container.css';

// Spacing tokens for padding
type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

// Container max-width presets
type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'prose';

export interface ContainerProps extends Omit<BoxProps, 'maxWidth'> {
  /** Max width preset or custom value */
  maxWidth?: ContainerSize | string | number;
  /** Center the container */
  center?: boolean;
  /** Horizontal padding (spacing token: 0-24) */
  paddingX?: SpacingValue;
}

/**
 * Container max-width presets (matches breakpoints)
 */
const containerSizes: Record<ContainerSize, string> = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
  prose: '65ch', // Optimal reading width
};

/**
 * Get max-width value
 */
const getMaxWidth = (size: ContainerSize | string | number | undefined): string | undefined => {
  if (size === undefined) return undefined;
  if (typeof size === 'number') return `${size}px`;
  if (size in containerSizes) return containerSizes[size as ContainerSize];
  return size;
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(({
  children,
  className = '',
  style = {},
  maxWidth = 'lg',
  center = true,
  paddingX = 4,
  ...boxProps
}, ref) => {
  // Build container-specific styles
  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: getMaxWidth(maxWidth),
    ...(center && { marginLeft: 'auto', marginRight: 'auto' }),
    paddingLeft: `var(--spacing-${paddingX})`,
    paddingRight: `var(--spacing-${paddingX})`,
    ...style,
  };

  return (
    <Box
      ref={ref}
      className={`ui-container ${className}`.trim()}
      style={containerStyle}
      {...boxProps}
    >
      {children}
    </Box>
  );
});

Container.displayName = 'Container';
