/**
 * TabBar - Horizontal tab navigation
 */

import React, { ReactNode } from 'react';
import './TabBar.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeId,
  onSelect,
  variant = 'default',
  fullWidth = false,
  className = '',
}) => {
  return (
    <div className={`ui-tab-bar ui-tab-bar--${variant} ${fullWidth ? 'ui-tab-bar--full-width' : ''} ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`ui-tab-bar__tab ${activeId === tab.id ? 'ui-tab-bar__tab--active' : ''}`}
          onClick={() => onSelect(tab.id)}
          role="tab"
          aria-selected={activeId === tab.id}
        >
          {tab.icon && <span className="ui-tab-bar__icon">{tab.icon}</span>}
          <span className="ui-tab-bar__label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
