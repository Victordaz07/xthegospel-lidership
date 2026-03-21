import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';

export interface TeachingCanonBackLinkProps {
  to: string;
  children: React.ReactNode;
}

export function TeachingCanonBackLink({ to, children }: TeachingCanonBackLinkProps): JSX.Element {
  return (
    <Link to={to} className="nm-guide-detail__back">
      <FaArrowLeft /> {children}
    </Link>
  );
}
