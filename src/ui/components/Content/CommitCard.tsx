/**
 * CommitCard - Display a commitment item
 */

import React, { ReactNode } from 'react';
import './CommitCard.css';

export interface CommitCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  completed?: boolean;
  dueDate?: string;
  onToggle?: () => void;
  onClick?: () => void;
  className?: string;
}

export const CommitCard: React.FC<CommitCardProps> = ({
  title,
  description,
  icon,
  completed = false,
  dueDate,
  onToggle,
  onClick,
  className = '',
}) => {
  return (
    <div className={`ui-commit-card ${completed ? 'ui-commit-card--completed' : ''} ${className}`}>
      <button 
        className={`ui-commit-card__checkbox ${completed ? 'ui-commit-card__checkbox--checked' : ''}`}
        onClick={onToggle}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {completed && '✓'}
      </button>
      <div className="ui-commit-card__content" onClick={onClick}>
        {icon && <div className="ui-commit-card__icon">{icon}</div>}
        <div className="ui-commit-card__text">
          <h4 className="ui-commit-card__title">{title}</h4>
          {description && <p className="ui-commit-card__description">{description}</p>}
        </div>
      </div>
      {dueDate && <span className="ui-commit-card__due">{dueDate}</span>}
    </div>
  );
};
