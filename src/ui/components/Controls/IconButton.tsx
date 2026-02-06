/**
 * IconButton - Button containing only an icon
 * 
 * Square button for icon-only interactions.
 * Uses design system tokens exclusively.
 * 
 * @example
 * <IconButton icon={<MenuIcon />} ariaLabel="Open menu" />
 * <IconButton icon={<CloseIcon />} variant="ghost" size="sm" />
 */

import React, { ReactNode, forwardRef } from 'react';
import './IconButton.css';

export interface IconButtonProps {
  /** Icon element to display */
  icon: ReactNode;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'primary' | 'ghost' | 'destructive';
  /** Aria label (required for accessibility) */
  ariaLabel: string;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Show loading state */
  loading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  onClick,
  className = '',
  disabled = false,
  size = 'md',
  variant = 'default',
  ariaLabel,
  type = 'button',
  loading = false,
}, ref) => {
  const isDisabled = disabled || loading;
  
  const classes = [
    'ui-icon-button',
    `ui-icon-button--${size}`,
    `ui-icon-button--${variant}`,
    isDisabled ? 'ui-icon-button--disabled' : '',
    loading ? 'ui-icon-button--loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading ? (
        <span className="ui-icon-button-spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="ui-icon-button-spinner-icon">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
        </span>
      ) : (
        icon
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';
