/**
 * TwoColumnLayout - Responsive two-column grid
 * 
 * Displays content in two columns on desktop, stacks on mobile.
 * Uses design system tokens for spacing.
 * 
 * @example
 * <TwoColumnLayout
 *   left={<Card>Left content</Card>}
 *   right={<Card>Right content</Card>}
 * />
 */

import React, { ReactNode, CSSProperties } from 'react';
import './TwoColumnLayout.css';

// Spacing tokens for gap
type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

export interface TwoColumnLayoutProps {
  /** Content for the left column */
  left: ReactNode;
  /** Content for the right column */
  right: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Gap between columns (spacing token) */
  gap?: SpacingValue;
  /** Ratio of columns (e.g., '1:2', '2:1', '1:1') */
  ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1';
  /** Vertical alignment of columns */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Reverse column order on mobile */
  reverseOnMobile?: boolean;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Map ratio to grid template columns
 */
const ratioMap: Record<string, string> = {
  '1:1': '1fr 1fr',
  '1:2': '1fr 2fr',
  '2:1': '2fr 1fr',
  '1:3': '1fr 3fr',
  '3:1': '3fr 1fr',
};

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  left,
  right,
  className = '',
  gap = 4,
  ratio = '1:1',
  align = 'start',
  reverseOnMobile = false,
  style,
}) => {
  const layoutStyle: CSSProperties = {
    gap: `var(--spacing-${gap})`,
    gridTemplateColumns: ratioMap[ratio],
    alignItems: align,
    ...style,
  };

  const classes = [
    'ui-two-column-layout',
    reverseOnMobile ? 'ui-two-column-layout--reverse-mobile' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={layoutStyle}>
      <div className="ui-two-column-layout__left">{left}</div>
      <div className="ui-two-column-layout__right">{right}</div>
    </div>
  );
};
