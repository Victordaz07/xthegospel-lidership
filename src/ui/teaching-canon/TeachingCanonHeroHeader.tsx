import React from 'react';

export interface TeachingCanonHeroHeaderProps {
  categoryLabel?: string | null;
  title: string;
  subtitle: string;
  heroNote: string;
}

export function TeachingCanonHeroHeader({
  categoryLabel,
  title,
  subtitle,
  heroNote,
}: TeachingCanonHeroHeaderProps): JSX.Element {
  return (
    <header className="nm-guide-detail__header">
      {categoryLabel ? <p className="nm-guide-detail__eyebrow">{categoryLabel}</p> : null}
      <h1 className="nm-guide-detail__title">{title}</h1>
      <p className="nm-guide-detail__subtitle">{subtitle}</p>
      <p className="nm-guide-detail__hero-note">{heroNote}</p>
    </header>
  );
}
