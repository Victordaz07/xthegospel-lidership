/**
 * PersonCard - Display person information
 */

import React, { ReactNode } from 'react';
import './PersonCard.css';

export interface PersonCardProps {
  name: string;
  subtitle?: string;
  avatar?: string | ReactNode;
  status?: 'active' | 'inactive' | 'pending';
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  name,
  subtitle,
  avatar,
  status,
  action,
  onClick,
  className = '',
}) => {
  const renderAvatar = () => {
    if (typeof avatar === 'string') {
      return <img src={avatar} alt={name} className="ui-person-card__avatar-img" />;
    }
    if (avatar) return avatar;
    return <span className="ui-person-card__avatar-initials">{name.charAt(0)}</span>;
  };

  return (
    <div 
      className={`ui-person-card ${onClick ? 'ui-person-card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      <div className={`ui-person-card__avatar ${status ? `ui-person-card__avatar--${status}` : ''}`}>
        {renderAvatar()}
      </div>
      <div className="ui-person-card__info">
        <h4 className="ui-person-card__name">{name}</h4>
        {subtitle && <p className="ui-person-card__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="ui-person-card__action">{action}</div>}
    </div>
  );
};
