/**
 * DevotionalCard - Display daily devotional content
 */

import React, { ReactNode } from 'react';
import './DevotionalCard.css';

export interface DevotionalCardProps {
  title: string;
  scripture?: string;
  reference?: string;
  date?: string;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DevotionalCard: React.FC<DevotionalCardProps> = ({
  title,
  scripture,
  reference,
  date,
  icon,
  onClick,
  className = '',
}) => {
  return (
    <div 
      className={`ui-devotional-card ${onClick ? 'ui-devotional-card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="ui-devotional-card__header">
        {icon && <div className="ui-devotional-card__icon">{icon}</div>}
        {date && <span className="ui-devotional-card__date">{date}</span>}
      </div>
      <h3 className="ui-devotional-card__title">{title}</h3>
      {scripture && (
        <blockquote className="ui-devotional-card__scripture">
          "{scripture}"
          {reference && <cite className="ui-devotional-card__reference">— {reference}</cite>}
        </blockquote>
      )}
    </div>
  );
};
