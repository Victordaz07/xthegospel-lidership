/**
 * RoleBadge - Display user role
 */

import React, { ReactNode } from 'react';
import './RoleBadge.css';

export interface RoleBadgeProps {
  role: 'investigator' | 'missionary' | 'member' | 'leader' | string;
  label?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

const roleColors: Record<string, { bg: string; text: string }> = {
  investigator: { bg: 'var(--color-accent-100)', text: 'var(--color-accent-dark)' },
  missionary: { bg: 'var(--color-primary-100)', text: 'var(--color-primary-dark)' },
  member: { bg: 'var(--color-secondary-100)', text: 'var(--color-secondary-dark)' },
  leader: { bg: 'var(--color-neutral-800)', text: 'var(--color-text-inverse)' },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  label,
  icon,
  size = 'md',
  className = '',
}) => {
  const colors = roleColors[role] || roleColors.member;
  const displayLabel = label || role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <span 
      className={`ui-role-badge ui-role-badge--${size} ${className}`}
      style={{ background: colors.bg, color: colors.text }}
    >
      {icon && <span className="ui-role-badge__icon">{icon}</span>}
      <span className="ui-role-badge__label">{displayLabel}</span>
    </span>
  );
};
