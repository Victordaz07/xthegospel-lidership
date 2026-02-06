/**
 * LessonCard - Display a lesson summary
 * 
 * Shows lesson information with progress indicator.
 * 
 * @example
 * <LessonCard
 *   title="The Restoration"
 *   subtitle="Lesson 1"
 *   progress={75}
 *   onClick={() => navigate('/lesson/1')}
 * />
 */

import React, { ReactNode } from 'react';
import './LessonCard.css';

export interface LessonCardProps {
  /** Lesson title */
  title: string;
  /** Lesson number or subtitle */
  subtitle?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Optional icon */
  icon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Completion status */
  completed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  title,
  subtitle,
  progress = 0,
  icon,
  onClick,
  completed = false,
  className = '',
}) => {
  return (
    <div 
      className={`ui-lesson-card ${onClick ? 'ui-lesson-card--clickable' : ''} ${completed ? 'ui-lesson-card--completed' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && <div className="ui-lesson-card__icon">{icon}</div>}
      <div className="ui-lesson-card__content">
        {subtitle && <span className="ui-lesson-card__subtitle">{subtitle}</span>}
        <h3 className="ui-lesson-card__title">{title}</h3>
        {progress > 0 && !completed && (
          <div className="ui-lesson-card__progress">
            <div 
              className="ui-lesson-card__progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      {completed && (
        <div className="ui-lesson-card__check">✓</div>
      )}
    </div>
  );
};
