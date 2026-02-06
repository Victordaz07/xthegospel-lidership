/**
 * Flex - Flexbox layout component
 * 
 * A specialized Box for flexbox layouts.
 * Uses design system tokens exclusively via CSS variables.
 * 
 * @example
 * <Flex direction="row" align="center" justify="between" gap={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 */

import React, { CSSProperties, ReactNode, forwardRef } from 'react';
import { Box, BoxProps } from './Box';
import './Flex.css';

// Spacing tokens for gap
type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

// Flex-specific props
type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch';
type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

export interface FlexProps extends Omit<BoxProps, 'display'> {
  /** Flex direction */
  direction?: FlexDirection;
  /** Flex wrap behavior */
  wrap?: FlexWrap;
  /** Align items along the cross axis */
  align?: FlexAlign;
  /** Justify content along the main axis */
  justify?: FlexJustify;
  /** Gap between items (spacing token: 0-24) */
  gap?: SpacingValue;
  /** Row gap (spacing token: 0-24) */
  rowGap?: SpacingValue;
  /** Column gap (spacing token: 0-24) */
  columnGap?: SpacingValue;
  /** Make flex container inline */
  inline?: boolean;
}

/**
 * Map align values to CSS
 */
const getAlignValue = (align: FlexAlign | undefined): string | undefined => {
  if (!align) return undefined;
  const map: Record<FlexAlign, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    baseline: 'baseline',
    stretch: 'stretch',
  };
  return map[align];
};

/**
 * Map justify values to CSS
 */
const getJustifyValue = (justify: FlexJustify | undefined): string | undefined => {
  if (!justify) return undefined;
  const map: Record<FlexJustify, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };
  return map[justify];
};

/**
 * Get gap CSS variable
 */
const getGapVar = (value: SpacingValue | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return `var(--spacing-${value})`;
};

export const Flex = forwardRef<HTMLDivElement, FlexProps>(({
  children,
  className = '',
  style = {},
  direction,
  wrap,
  align,
  justify,
  gap,
  rowGap,
  columnGap,
  inline = false,
  ...boxProps
}, ref) => {
  // Build flex-specific styles
  const flexStyle: CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    ...(direction && { flexDirection: direction }),
    ...(wrap && { flexWrap: wrap }),
    ...(align && { alignItems: getAlignValue(align) }),
    ...(justify && { justifyContent: getJustifyValue(justify) }),
    ...(gap !== undefined && { gap: getGapVar(gap) }),
    ...(rowGap !== undefined && { rowGap: getGapVar(rowGap) }),
    ...(columnGap !== undefined && { columnGap: getGapVar(columnGap) }),
    ...style,
  };

  return (
    <Box
      ref={ref}
      className={`ui-flex ${className}`.trim()}
      style={flexStyle}
      {...boxProps}
    >
      {children}
    </Box>
  );
});

Flex.displayName = 'Flex';
