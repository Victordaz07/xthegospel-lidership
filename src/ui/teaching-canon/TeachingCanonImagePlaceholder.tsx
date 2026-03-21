import React from 'react';
import { FaImage } from 'react-icons/fa6';
import type { CanonImagePlaceholder } from './types';

export interface TeachingCanonImagePlaceholderProps {
  image: CanonImagePlaceholder;
}

export function TeachingCanonImagePlaceholder({
  image,
}: TeachingCanonImagePlaceholderProps): JSX.Element {
  const ratioClass = `nm-guide-detail__image-placeholder--${image.aspectRatio ?? '16:9'}`;
  return (
    <div
      className={`nm-guide-detail__image-placeholder ${ratioClass}`}
      aria-label={image.title}
    >
      <div className="nm-guide-detail__image-icon" aria-hidden>
        <FaImage />
      </div>
      <div className="nm-guide-detail__image-copy">
        <p className="nm-guide-detail__image-label">{image.label}</p>
        <p className="nm-guide-detail__image-title">{image.title}</p>
        <p className="nm-guide-detail__image-prompt">{image.prompt}</p>
      </div>
    </div>
  );
}
