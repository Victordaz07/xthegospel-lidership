/**
 * ProgressBar - Visual progress indicator
 * 
 * Shows completion progress with semantic color variants.
 * Uses design system tokens exclusively.
 * 
 * @example
 * <ProgressBar value={65} />
 * <ProgressBar value={3} max={10} variant="success" showLabel />
 */

import React, { CSSProperties } from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  /** Current value (0 to max) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Bar thickness */
  size?: 'sm' | 'md' | 'lg';
  /** Semantic color variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  ariaLabel?: string;
  /** Animate the fill */
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'primary',
  className = '',
  ariaLabel,
  animated = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const fillStyle: CSSProperties = {
    width: `${percentage}%`,
  };

  return (
    <div className={`ui-progress-bar ui-progress-bar--${size} ${className}`}>
      <div
        className="ui-progress-bar__container"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || `Progress: ${Math.round(percentage)}%`}
      >
        <div
          className={`ui-progress-bar__fill ui-progress-bar__fill--${variant} ${animated ? 'ui-progress-bar__fill--animated' : ''}`}
          style={fillStyle}
        />
      </div>
      {showLabel && (
        <span className="ui-progress-bar__label">{Math.round(percentage)}%</span>
      )}
    </div>
  );
};
