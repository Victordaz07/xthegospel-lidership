/**
 * Grid - CSS Grid layout component
 * 
 * A specialized Box for grid layouts.
 * Uses design system tokens exclusively via CSS variables.
 * 
 * @example
 * <Grid cols={3} gap={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 */

import React, { CSSProperties, forwardRef } from 'react';
import { Box, BoxProps } from './Box';
import './Grid.css';

// Spacing tokens for gap
type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

// Grid alignment options
type GridAlign = 'start' | 'end' | 'center' | 'stretch';
type GridJustify = 'start' | 'end' | 'center' | 'stretch' | 'between' | 'around' | 'evenly';
type GridPlaceItems = 'start' | 'end' | 'center' | 'stretch';

export interface GridProps extends Omit<BoxProps, 'display'> {
  /** Number of columns (creates equal-width columns) */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Number of rows (creates equal-height rows) */
  rows?: number;
  /** Custom grid-template-columns value */
  templateCols?: string;
  /** Custom grid-template-rows value */
  templateRows?: string;
  /** Gap between grid items (spacing token: 0-24) */
  gap?: SpacingValue;
  /** Row gap (spacing token: 0-24) */
  rowGap?: SpacingValue;
  /** Column gap (spacing token: 0-24) */
  columnGap?: SpacingValue;
  /** Align items along the block (column) axis */
  alignItems?: GridAlign;
  /** Justify items along the inline (row) axis */
  justifyItems?: GridJustify;
  /** Align content (for grid container) */
  alignContent?: GridAlign | 'between' | 'around' | 'evenly';
  /** Justify content (for grid container) */
  justifyContent?: GridJustify;
  /** Shorthand for align-items and justify-items */
  placeItems?: GridPlaceItems;
  /** Make grid container inline */
  inline?: boolean;
  /** Auto-flow direction */
  autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  /** Auto-generated column size */
  autoColumns?: string;
  /** Auto-generated row size */
  autoRows?: string;
}

/**
 * Get gap CSS variable
 */
const getGapVar = (value: SpacingValue | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return `var(--spacing-${value})`;
};

/**
 * Map alignment values to CSS
 */
const getAlignValue = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const map: Record<string, string> = {
    start: 'start',
    end: 'end',
    center: 'center',
    stretch: 'stretch',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };
  return map[value] || value;
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(({
  children,
  className = '',
  style = {},
  cols,
  rows,
  templateCols,
  templateRows,
  gap,
  rowGap,
  columnGap,
  alignItems,
  justifyItems,
  alignContent,
  justifyContent,
  placeItems,
  inline = false,
  autoFlow,
  autoColumns,
  autoRows,
  ...boxProps
}, ref) => {
  // Build grid-specific styles
  const gridStyle: CSSProperties = {
    display: inline ? 'inline-grid' : 'grid',
    // Template columns - either custom or auto-generated from cols
    ...(templateCols && { gridTemplateColumns: templateCols }),
    ...(cols && !templateCols && { gridTemplateColumns: `repeat(${cols}, 1fr)` }),
    // Template rows - either custom or auto-generated from rows
    ...(templateRows && { gridTemplateRows: templateRows }),
    ...(rows && !templateRows && { gridTemplateRows: `repeat(${rows}, 1fr)` }),
    // Gap
    ...(gap !== undefined && { gap: getGapVar(gap) }),
    ...(rowGap !== undefined && { rowGap: getGapVar(rowGap) }),
    ...(columnGap !== undefined && { columnGap: getGapVar(columnGap) }),
    // Alignment
    ...(alignItems && { alignItems: getAlignValue(alignItems) }),
    ...(justifyItems && { justifyItems: getAlignValue(justifyItems) }),
    ...(alignContent && { alignContent: getAlignValue(alignContent) }),
    ...(justifyContent && { justifyContent: getAlignValue(justifyContent) }),
    ...(placeItems && { placeItems: getAlignValue(placeItems) }),
    // Auto properties
    ...(autoFlow && { gridAutoFlow: autoFlow }),
    ...(autoColumns && { gridAutoColumns: autoColumns }),
    ...(autoRows && { gridAutoRows: autoRows }),
    ...style,
  };

  return (
    <Box
      ref={ref}
      className={`ui-grid ${className}`.trim()}
      style={gridStyle}
      {...boxProps}
    >
      {children}
    </Box>
  );
});

Grid.displayName = 'Grid';
