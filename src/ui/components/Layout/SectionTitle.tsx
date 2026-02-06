/**
 * SectionTitle - Standalone section header
 * 
 * Use when you need just the title without the Section wrapper.
 * Supports an optional action element on the right side.
 * 
 * @example
 * <SectionTitle>My Section</SectionTitle>
 * 
 * <SectionTitle subtitle="Description here" action={<Button>See All</Button>}>
 *   My Section
 * </SectionTitle>
 */

import React, { ReactNode, CSSProperties } from 'react';
import './SectionTitle.css';

export interface SectionTitleProps {
  /** Title text */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional action element (button, link, etc.) aligned to the right */
  action?: ReactNode;
  /** Heading level */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Additional inline styles */
  style?: CSSProperties;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  className = '',
  subtitle,
  action,
  as: Heading = 'h2',
  style,
}) => {
  return (
    <div className={`ui-section-title-wrapper ${className}`} style={style}>
      <div className="ui-section-title-left">
        <Heading className="ui-section-title-heading">{children}</Heading>
        {subtitle && <p className="ui-section-title-subtitle">{subtitle}</p>}
      </div>
      {action && (
        <div className="ui-section-title-action">
          {action}
        </div>
      )}
    </div>
  );
};
