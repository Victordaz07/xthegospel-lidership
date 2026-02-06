/**
 * StatPill - Compact stat display
 * 
 * Shows a value with optional icon and label in a pill shape.
 * 
 * @example
 * <StatPill value={42} label="Days" icon={<CalendarIcon />} />
 * <StatPill value="12%" variant="success" />
 */

import React, { ReactNode } from 'react';
import './StatPill.css';

export interface StatPillProps {
  /** Stat value to display */
  value: string | number;
  /** Optional label */
  label?: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

export const StatPill: React.FC<StatPillProps> = ({
  value,
  label,
  icon,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`ui-stat-pill ui-stat-pill--${variant} ui-stat-pill--${size} ${className}`}>
      {icon && <span className="ui-stat-pill__icon">{icon}</span>}
      <span className="ui-stat-pill__value">{value}</span>
      {label && <span className="ui-stat-pill__label">{label}</span>}
    </div>
  );
};
