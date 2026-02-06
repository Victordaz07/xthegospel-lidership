/**
 * PageContainer - Page-level content wrapper
 * 
 * Centers content with consistent max-width and padding.
 * Designed for main page content areas.
 * 
 * @example
 * <PageContainer>
 *   <h1>Page Title</h1>
 *   <p>Page content...</p>
 * </PageContainer>
 */

import React, { ReactNode, CSSProperties } from 'react';
import './PageContainer.css';

export interface PageContainerProps {
  /** Content to render */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Max width override (number = px, string = CSS value) */
  maxWidth?: number | string;
  /** Remove default padding */
  noPadding?: boolean;
  /** Disable entrance animation */
  noAnimation?: boolean;
  /** Additional inline styles */
  style?: CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth,
  noPadding = false,
  noAnimation = false,
  style,
}) => {
  const containerStyle: CSSProperties = {
    ...(maxWidth && {
      maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    }),
    ...(noPadding && {
      padding: 0,
    }),
    ...style,
  };

  const classes = [
    'ui-page-container',
    noAnimation ? '' : 'ui-page-container--animate',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={containerStyle}>
      {children}
    </div>
  );
};
