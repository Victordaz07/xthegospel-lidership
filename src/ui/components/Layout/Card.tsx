/**
 * Card - Content container with multiple variants
 * 
 * A versatile card component for displaying content in a contained,
 * visually distinct container. Uses design system tokens exclusively.
 * 
 * @example
 * <Card>Basic card content</Card>
 * <Card variant="elevated" padding="lg">Elevated card</Card>
 * <Card variant="gradient" onClick={() => {}}>Clickable gradient card</Card>
 */

import React, { ReactNode, CSSProperties } from 'react';
import './Card.css';

export interface CardProps {
  /** Content to render inside the card */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Click handler - if provided, adds hover effects and pointer cursor */
  onClick?: () => void;
  /** Visual variant of the card */
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  /** Padding size using design system tokens */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Padding values mapped to CSS variables
 */
const paddingValues: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '0',
  sm: 'var(--spacing-2)',
  md: 'var(--spacing-4)',
  lg: 'var(--spacing-6)',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const cardClasses = [
    'ui-card',
    `ui-card--${variant}`,
    onClick ? 'ui-card--clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cardStyle: CSSProperties = {
    padding: paddingValues[padding],
    ...style,
  };

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={cardStyle}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
};
