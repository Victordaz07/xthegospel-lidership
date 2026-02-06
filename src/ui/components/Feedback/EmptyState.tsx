/**
 * EmptyState - Placeholder for empty content areas
 * 
 * Shows when there's no content to display with optional icon and action.
 * 
 * @example
 * <EmptyState
 *   icon={<InboxIcon />}
 *   title="No messages"
 *   description="When you receive messages, they'll appear here."
 *   action={<Button>Compose</Button>}
 * />
 */

import React, { ReactNode } from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  /** Optional icon to display */
  icon?: ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action element (button, link, etc.) */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md',
}) => {
  return (
    <div className={`ui-empty-state ui-empty-state--${size} ${className}`}>
      {icon && <div className="ui-empty-state__icon">{icon}</div>}
      <h3 className="ui-empty-state__title">{title}</h3>
      {description && <p className="ui-empty-state__description">{description}</p>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  );
};
