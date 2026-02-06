/**
 * Button - Unified button component with variants
 * 
 * The primary interactive element for user actions.
 * Uses design system tokens exclusively.
 * 
 * @example
 * <Button>Primary Button</Button>
 * <Button variant="secondary">Secondary</Button>
 * <Button variant="ghost" size="sm">Ghost Small</Button>
 * <Button icon={<PlusIcon />}>With Icon</Button>
 */

import React, { ReactNode, forwardRef } from 'react';
import './Button.css';

export interface ButtonProps {
  /** Button content */
  children: ReactNode;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success';
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Icon to display before the label */
  icon?: ReactNode;
  /** Icon to display after the label */
  iconRight?: ReactNode;
  /** Show loading state */
  loading?: boolean;
  /** Aria label for accessibility */
  'aria-label'?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  onClick,
  className = '',
  disabled = false,
  fullWidth = false,
  size = 'md',
  variant = 'primary',
  type = 'button',
  icon,
  iconRight,
  loading = false,
  'aria-label': ariaLabel,
}, ref) => {
  const isDisabled = disabled || loading;
  
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? 'ui-button--full-width' : '',
    isDisabled ? 'ui-button--disabled' : '',
    loading ? 'ui-button--loading' : '',
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
      {loading && (
        <span className="ui-button-spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="ui-button-spinner-icon">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
        </span>
      )}
      {icon && !loading && <span className="ui-button-icon">{icon}</span>}
      <span className="ui-button-label">{children}</span>
      {iconRight && <span className="ui-button-icon ui-button-icon--right">{iconRight}</span>}
    </button>
  );
});

Button.displayName = 'Button';
