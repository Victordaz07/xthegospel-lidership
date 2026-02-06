/**
 * TopBar - App header with navigation
 */

import React, { ReactNode } from 'react';
import './TopBar.css';

export interface TopBarProps {
  title?: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  transparent?: boolean;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  transparent = false,
  className = '',
}) => {
  return (
    <header
      className={`ui-top-bar ${transparent ? 'ui-top-bar--transparent' : ''} ${className}`}
    >
      <div className="ui-top-bar__left">{leftAction}</div>
      <div className="ui-top-bar__center">
        {title && <h1 className="ui-top-bar__title">{title}</h1>}
        {subtitle && <p className="ui-top-bar__subtitle">{subtitle}</p>}
      </div>
      <div className="ui-top-bar__right">{rightAction}</div>
    </header>
  );
};
