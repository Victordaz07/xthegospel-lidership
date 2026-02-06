/**
 * Stack - Vertical or horizontal stack component
 * 
 * A simplified Flex for common stack layouts with consistent spacing.
 * Uses design system tokens exclusively via CSS variables.
 * 
 * @example
 * // Vertical stack (default)
 * <Stack spacing={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * 
 * // Horizontal stack
 * <Stack direction="horizontal" spacing={2} align="center">
 *   <Icon />
 *   <span>Label</span>
 * </Stack>
 */

import React, { CSSProperties, forwardRef } from 'react';
import { Box, BoxProps } from './Box';
import './Stack.css';

// Spacing tokens for gap
type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

// Stack alignment options
type StackAlign = 'start' | 'end' | 'center' | 'stretch';
type StackJustify = 'start' | 'end' | 'center' | 'between' | 'around';

export interface StackProps extends Omit<BoxProps, 'display'> {
  /** Stack direction */
  direction?: 'vertical' | 'horizontal';
  /** Space between items (spacing token: 0-24) */
  spacing?: SpacingValue;
  /** Align items along the cross axis */
  align?: StackAlign;
  /** Justify content along the main axis */
  justify?: StackJustify;
  /** Allow items to wrap */
  wrap?: boolean;
  /** Divider between items - renders a separator element */
  divider?: React.ReactNode;
}

/**
 * Map align values to CSS
 */
const getAlignValue = (align: StackAlign | undefined): string | undefined => {
  if (!align) return undefined;
  const map: Record<StackAlign, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
  };
  return map[align];
};

/**
 * Map justify values to CSS
 */
const getJustifyValue = (justify: StackJustify | undefined): string | undefined => {
  if (!justify) return undefined;
  const map: Record<StackJustify, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    between: 'space-between',
    around: 'space-around',
  };
  return map[justify];
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(({
  children,
  className = '',
  style = {},
  direction = 'vertical',
  spacing = 2,
  align,
  justify,
  wrap = false,
  divider,
  ...boxProps
}, ref) => {
  // Build stack-specific styles
  const stackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    gap: `var(--spacing-${spacing})`,
    ...(align && { alignItems: getAlignValue(align) }),
    ...(justify && { justifyContent: getJustifyValue(justify) }),
    ...(wrap && { flexWrap: 'wrap' }),
    ...style,
  };

  // If divider is provided, interleave it between children
  const renderChildren = () => {
    if (!divider) return children;

    const childArray = React.Children.toArray(children).filter(Boolean);
    const result: React.ReactNode[] = [];

    childArray.forEach((child, index) => {
      result.push(
        <React.Fragment key={`item-${index}`}>
          {child}
        </React.Fragment>
      );
      if (index < childArray.length - 1) {
        result.push(
          <React.Fragment key={`divider-${index}`}>
            {divider}
          </React.Fragment>
        );
      }
    });

    return result;
  };

  return (
    <Box
      ref={ref}
      className={`ui-stack ui-stack--${direction} ${className}`.trim()}
      style={stackStyle}
      {...boxProps}
    >
      {renderChildren()}
    </Box>
  );
});

Stack.displayName = 'Stack';

// Convenience components for common use cases
export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="vertical" {...props} />
));
VStack.displayName = 'VStack';

export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="horizontal" {...props} />
));
HStack.displayName = 'HStack';
