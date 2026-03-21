import React from 'react';
import { FaHeadphones } from 'react-icons/fa6';
import type { CanonAudioPlaceholder } from './types';

export interface TeachingCanonAudioCardProps {
  audio: CanonAudioPlaceholder;
  /** Etiqueta resuelta para el chip de estado (p. ej. “Próximamente”). */
  audioStatusLabel?: string | null;
}

export function TeachingCanonAudioCard({
  audio,
  audioStatusLabel,
}: TeachingCanonAudioCardProps): JSX.Element {
  return (
    <section className="nm-guide-detail__audio-card" aria-label={audio.title}>
      <div className="nm-guide-detail__audio-icon" aria-hidden>
        <FaHeadphones />
      </div>
      <div className="nm-guide-detail__audio-body">
        <p className="nm-guide-detail__audio-eyebrow">{audio.eyebrow}</p>
        <h2 className="nm-guide-detail__audio-title">{audio.title}</h2>
        <p className="nm-guide-detail__audio-summary">{audio.summary}</p>
        <div className="nm-guide-detail__audio-meta">
          {audio.durationLabel ? (
            <span className="nm-guide-detail__audio-chip">{audio.durationLabel}</span>
          ) : null}
          {audioStatusLabel ? (
            <span className="nm-guide-detail__audio-chip">{audioStatusLabel}</span>
          ) : null}
        </div>
        <div className="nm-guide-detail__audio-wave" aria-hidden>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className="nm-guide-detail__audio-intent">{audio.scriptIntent}</p>
      </div>
    </section>
  );
}
