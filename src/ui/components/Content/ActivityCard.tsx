/**
 * ActivityCard - Display an activity item
 */

import React, { ReactNode } from 'react';
import './ActivityCard.css';

export interface ActivityCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  timestamp?: string;
  variant?: 'default' | 'completed' | 'pending';
  onClick?: () => void;
  className?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  description,
  icon,
  timestamp,
  variant = 'default',
  onClick,
  className = '',
}) => {
  return (
    <div 
      className={`ui-activity-card ui-activity-card--${variant} ${onClick ? 'ui-activity-card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {icon && <div className="ui-activity-card__icon">{icon}</div>}
      <div className="ui-activity-card__content">
        <h4 className="ui-activity-card__title">{title}</h4>
        {description && <p className="ui-activity-card__description">{description}</p>}
      </div>
      {timestamp && <span className="ui-activity-card__time">{timestamp}</span>}
    </div>
  );
};
