import React from 'react';

export interface TeachingCanonShellProps {
  children: React.ReactNode;
}

/** Contenedor principal (max-width, stack vertical) del layout canónico de enseñanza. */
export function TeachingCanonShell({ children }: TeachingCanonShellProps): JSX.Element {
  return <div className="nm-guide-detail">{children}</div>;
}
