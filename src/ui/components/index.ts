/**
 * UI Components Library
 * xTheGospel Design System
 * 
 * All components use design system tokens from src/ui/design-system
 */

// ===========================================
// PRIMITIVES - Base building blocks
// ===========================================
export { Box } from './primitives/Box';
export type { BoxProps } from './primitives/Box';

export { Flex } from './primitives/Flex';
export type { FlexProps } from './primitives/Flex';

export { Grid } from './primitives/Grid';
export type { GridProps } from './primitives/Grid';

export { Stack, VStack, HStack } from './primitives/Stack';
export type { StackProps } from './primitives/Stack';

export { Text, Caption, Label } from './primitives/Text';
export type { TextProps } from './primitives/Text';

export { Heading, H1, H2, H3, H4, H5, H6 } from './primitives/Heading';
export type { HeadingProps } from './primitives/Heading';

export { Container } from './primitives/Container';
export type { ContainerProps } from './primitives/Container';

export { Divider } from './primitives/Divider';
export type { DividerProps } from './primitives/Divider';

// ===========================================
// LAYOUT - Page structure components
// ===========================================
export { Card } from './Layout/Card';
export type { CardProps } from './Layout/Card';

export { PageContainer } from './Layout/PageContainer';
export type { PageContainerProps } from './Layout/PageContainer';

export { PageShell } from './Layout/PageShell';
export type { PageShellProps } from './Layout/PageShell';

export { Section } from './Layout/Section';
export type { SectionProps } from './Layout/Section';

export { SectionTitle } from './Layout/SectionTitle';
export type { SectionTitleProps } from './Layout/SectionTitle';

export { TwoColumnLayout } from './Layout/TwoColumnLayout';
export type { TwoColumnLayoutProps } from './Layout/TwoColumnLayout';

// ===========================================
// CONTROLS - Interactive elements
// ===========================================
export { Button } from './Controls/Button';
export type { ButtonProps } from './Controls/Button';

export { ButtonPrimary } from './Controls/ButtonPrimary';
export type { ButtonPrimaryProps } from './Controls/ButtonPrimary';

export { ButtonSecondary } from './Controls/ButtonSecondary';
export type { ButtonSecondaryProps } from './Controls/ButtonSecondary';

export { IconButton } from './Controls/IconButton';
export type { IconButtonProps } from './Controls/IconButton';

// ===========================================
// FEEDBACK - Status and progress indicators
// ===========================================
export { ProgressBar } from './Feedback/ProgressBar';
export type { ProgressBarProps } from './Feedback/ProgressBar';

export { LevelCard } from './Feedback/LevelCard';
export type { LevelCardProps } from './Feedback/LevelCard';

export { StatPill } from './Feedback/StatPill';
export type { StatPillProps } from './Feedback/StatPill';

export { EmptyState } from './Feedback/EmptyState';
export type { EmptyStateProps } from './Feedback/EmptyState';

// ===========================================
// CONTENT - Display components
// ===========================================
export { LessonCard } from './Content/LessonCard';
export type { LessonCardProps } from './Content/LessonCard';

export { ActivityCard } from './Content/ActivityCard';
export type { ActivityCardProps } from './Content/ActivityCard';

export { CommitCard } from './Content/CommitCard';
export type { CommitCardProps } from './Content/CommitCard';

export { PersonCard } from './Content/PersonCard';
export type { PersonCardProps } from './Content/PersonCard';

export { DevotionalCard } from './Content/DevotionalCard';
export type { DevotionalCardProps } from './Content/DevotionalCard';

// ===========================================
// NAVIGATION - Navigation components
// ===========================================
export { TopBar } from './Navigation/TopBar';
export type { TopBarProps } from './Navigation/TopBar';

export { BottomNav } from './Navigation/BottomNav';
export type { BottomNavProps, BottomNavItem } from './Navigation/BottomNav';

export { TabBar } from './Navigation/TabBar';
export type { TabBarProps, TabItem } from './Navigation/TabBar';

export { RoleBadge } from './Navigation/RoleBadge';
export type { RoleBadgeProps } from './Navigation/RoleBadge';

export { FloatingMenu } from './Navigation/FloatingMenu';
export type { FloatingMenuTab } from './Navigation/FloatingMenu';
