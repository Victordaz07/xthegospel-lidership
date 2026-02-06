/**
 * Primitive Components
 * 
 * These are the foundational building blocks for the design system.
 * All other components should be built using these primitives.
 */

// Box - Base container
export { Box } from './Box';
export type { BoxProps } from './Box';

// Flex - Flexbox layout
export { Flex } from './Flex';
export type { FlexProps } from './Flex';

// Grid - CSS Grid layout
export { Grid } from './Grid';
export type { GridProps } from './Grid';

// Stack - Vertical/Horizontal stacking
export { Stack, VStack, HStack } from './Stack';
export type { StackProps } from './Stack';

// Text - Body text typography
export { Text, Caption, Label } from './Text';
export type { TextProps } from './Text';

// Heading - Heading typography
export { Heading, H1, H2, H3, H4, H5, H6 } from './Heading';
export type { HeadingProps } from './Heading';

// Container - Responsive container
export { Container } from './Container';
export type { ContainerProps } from './Container';

// Divider - Visual separator
export { Divider } from './Divider';
export type { DividerProps } from './Divider';
