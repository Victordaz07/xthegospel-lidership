import React from 'react';

export interface TeachingCanonReflectionHintProps {
  label: string;
  body: string;
}

/** Bloque de reflexión estático (sin persistencia) para alinear con el canon de enseñanza. */
export function TeachingCanonReflectionHint({ label, body }: TeachingCanonReflectionHintProps): JSX.Element {
  return (
    <section className="nm-guide-detail__reflection" aria-label={label}>
      <h3 className="nm-guide-detail__reflection-label">{label}</h3>
      <p className="nm-guide-detail__reflection-prompt">{body}</p>
    </section>
  );
}
