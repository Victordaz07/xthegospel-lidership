/**
 * BottomNav - Mobile bottom navigation
 */

import React, { ReactNode } from 'react';
import './BottomNav.css';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeId,
  onSelect,
  className = '',
}) => {
  return (
    <nav className={`ui-bottom-nav ${className}`}>
      {items.map(item => (
        <button
          key={item.id}
          className={`ui-bottom-nav__item ${activeId === item.id ? 'ui-bottom-nav__item--active' : ''}`}
          onClick={() => onSelect(item.id)}
          aria-label={item.label}
          aria-current={activeId === item.id ? 'page' : undefined}
        >
          <span className="ui-bottom-nav__icon">
            {item.icon}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ui-bottom-nav__badge">{item.badge > 99 ? '99+' : item.badge}</span>
            )}
          </span>
          <span className="ui-bottom-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
