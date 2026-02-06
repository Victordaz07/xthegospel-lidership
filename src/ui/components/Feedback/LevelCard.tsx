/**
 * LevelCard - Display user level/achievement progress
 * 
 * Shows level, progress bar, and optional stats.
 * 
 * @example
 * <LevelCard
 *   level={5}
 *   currentXP={750}
 *   nextLevelXP={1000}
 *   title="Disciple"
 * />
 */

import React, { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';
import './LevelCard.css';

export interface LevelCardProps {
  /** Current level number */
  level: number;
  /** Current experience/points */
  currentXP: number;
  /** Experience needed for next level */
  nextLevelXP: number;
  /** Level title/name */
  title?: string;
  /** Icon for the level */
  icon?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  currentXP,
  nextLevelXP,
  title,
  icon,
  className = '',
}) => {
  const progress = (currentXP / nextLevelXP) * 100;
  const remaining = nextLevelXP - currentXP;

  return (
    <div className={`ui-level-card ${className}`}>
      <div className="ui-level-card__header">
        {icon && <div className="ui-level-card__icon">{icon}</div>}
        <div className="ui-level-card__info">
          <span className="ui-level-card__level">Level {level}</span>
          {title && <span className="ui-level-card__title">{title}</span>}
        </div>
      </div>
      
      <div className="ui-level-card__progress">
        <ProgressBar value={currentXP} max={nextLevelXP} variant="primary" size="md" />
        <div className="ui-level-card__stats">
          <span className="ui-level-card__current">{currentXP.toLocaleString()} XP</span>
          <span className="ui-level-card__remaining">{remaining.toLocaleString()} to next</span>
        </div>
      </div>
    </div>
  );
};
