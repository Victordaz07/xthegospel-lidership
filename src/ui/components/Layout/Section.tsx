/**
 * Section - Content section with optional title
 * 
 * Groups related content with consistent spacing.
 * Optionally includes a header with title and subtitle.
 * 
 * @example
 * <Section>
 *   <Card>Content</Card>
 * </Section>
 * 
 * <Section title="My Section" subtitle="Description">
 *   <Card>Content</Card>
 * </Section>
 */

import React, { ReactNode, CSSProperties } from 'react';
import './Section.css';

export interface SectionProps {
  /** Content to render in the section */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  /** Gap between items in the content area */
  gap?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Gap values mapped to CSS variables
 */
const gapValues: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '0',
  sm: 'var(--spacing-2)',
  md: 'var(--spacing-4)',
  lg: 'var(--spacing-6)',
};

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  title,
  subtitle,
  gap = 'md',
  style,
}) => {
  const contentStyle: CSSProperties = {
    gap: gapValues[gap],
  };

  return (
    <section className={`ui-section ${className}`} style={style}>
      {(title || subtitle) && (
        <div className="ui-section-header">
          {title && <h2 className="ui-section-title">{title}</h2>}
          {subtitle && <p className="ui-section-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="ui-section-content" style={contentStyle}>
        {children}
      </div>
    </section>
  );
};
