/**
 * PageShell - Full page wrapper with header, content, and bottom nav spacing
 * 
 * Use this as the root wrapper for any page that needs consistent layout.
 * Provides sticky header, main content area, and space for bottom navigation.
 * 
 * @example
 * <PageShell title="My Page" onBack={() => navigate(-1)}>
 *   <Card>Page content</Card>
 * </PageShell>
 */

import React, { ReactNode, CSSProperties } from 'react';
import './PageShell.css';

export interface PageShellProps {
  /** Main content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom header content (replaces default header) */
  header?: ReactNode;
  /** Page title (alternative to custom header) */
  title?: string;
  /** Back button handler - if provided, shows back button */
  onBack?: () => void;
  /** Actions for the header right side */
  headerActions?: ReactNode;
  /** Add padding for bottom navigation (default: true) */
  hasBottomNav?: boolean;
  /** Background variant */
  variant?: 'default' | 'gradient' | 'plain';
  /** Max width for content area */
  maxWidth?: number | string;
  /** Additional inline styles */
  style?: CSSProperties;
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  className = '',
  header,
  title,
  onBack,
  headerActions,
  hasBottomNav = true,
  variant = 'default',
  maxWidth,
  style,
}) => {
  const showDefaultHeader = !header && (title || onBack || headerActions);

  const contentStyle: CSSProperties = {
    ...(maxWidth && {
      maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    }),
  };

  return (
    <div className={`ui-page-shell ui-page-shell--${variant} ${className}`} style={style}>
      {/* Custom header */}
      {header && (
        <header className="ui-page-shell-header ui-page-shell-header--custom">
          {header}
        </header>
      )}

      {/* Default header with title/back/actions */}
      {showDefaultHeader && (
        <header className="ui-page-shell-header">
          <div className="ui-page-shell-header-left">
            {onBack && (
              <button 
                className="ui-page-shell-back-btn"
                onClick={onBack}
                aria-label="Go back"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            {title && <h1 className="ui-page-shell-title">{title}</h1>}
          </div>
          {headerActions && (
            <div className="ui-page-shell-header-right">
              {headerActions}
            </div>
          )}
        </header>
      )}

      {/* Main content */}
      <main 
        className={`ui-page-shell-content ${hasBottomNav ? 'ui-page-shell-content--with-nav' : ''}`}
        style={contentStyle}
      >
        {children}
      </main>
    </div>
  );
};
