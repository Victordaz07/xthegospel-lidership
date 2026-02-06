/**
 * XtgProfileCard - Shareable xTheGospel ID Card
 * 
 * A beautiful, shareable profile card that displays the user's
 * xTheGospel ID. Can be shared with leaders for ward registration.
 */

import React, { useState } from 'react';
import { FaShareNodes, FaCopy, FaCheck, FaChurch, FaUser } from 'react-icons/fa6';
import { UniversalUserProfile, MemberStatus } from '../../types/user';
import './XtgProfileCard.css';

interface XtgProfileCardProps {
  profile: UniversalUserProfile;
  compact?: boolean;
  onShare?: () => void;
}

// "investigator" shows as "Amigo" per church terminology
const STATUS_LABELS: Record<MemberStatus, string> = {
  investigator: 'Amigo',
  new_convert: 'Nuevo Converso',
  active: 'Miembro Activo',
  less_active: 'Miembro',
  returned: 'Misionero Retornado',
};

const STATUS_COLORS: Record<MemberStatus, string> = {
  investigator: 'friend',
  new_convert: 'success',
  active: 'primary',
  less_active: 'neutral',
  returned: 'accent',
};

export function XtgProfileCard({ profile, compact = false, onShare }: XtgProfileCardProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(profile.xthegospelId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    // Try native share if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi xTheGospel ID',
          text: `${profile.displayName}\nxTheGospel ID: ${profile.xthegospelId}`,
          url: `https://xthegospel.app/profile/${profile.xthegospelId}`,
        });
      } catch (error) {
        // User cancelled or error - fallback to copy
        handleCopyId();
      }
    } else {
      handleCopyId();
    }
  };

  const initials = profile.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (compact) {
    return (
      <div className="xtg-card xtg-card--compact">
        <div className="xtg-card__avatar-small">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="xtg-card__info-compact">
          <span className="xtg-card__name-compact">{profile.displayName}</span>
          <span className="xtg-card__id-compact">{profile.xthegospelId}</span>
        </div>
        <button className="xtg-card__copy-btn" onClick={handleCopyId}>
          {copied ? <FaCheck /> : <FaCopy />}
        </button>
      </div>
    );
  }

  return (
    <div className="xtg-card">
      {/* Header with gradient */}
      <div className="xtg-card__header">
        <div className="xtg-card__logo">xTheGospel</div>
        <div className="xtg-card__badge" data-status={STATUS_COLORS[profile.memberStatus]}>
          {STATUS_LABELS[profile.memberStatus]}
        </div>
      </div>

      {/* Avatar and name */}
      <div className="xtg-card__profile">
        <div className="xtg-card__avatar">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} />
          ) : (
            <span className="xtg-card__initials">{initials}</span>
          )}
        </div>
        <h2 className="xtg-card__name">{profile.displayName}</h2>
        
        {/* Church unit if available */}
        {profile.unit && (
          <div className="xtg-card__unit">
            <FaChurch />
            <span>{profile.unit.wardName}, {profile.unit.stakeName}</span>
          </div>
        )}
      </div>

      {/* ID Section */}
      <div className="xtg-card__id-section">
        <span className="xtg-card__id-label">xTheGospel ID</span>
        <div className="xtg-card__id-box">
          <span className="xtg-card__id">{profile.xthegospelId}</span>
          <button 
            className="xtg-card__id-copy" 
            onClick={handleCopyId}
            title={copied ? 'Copiado!' : 'Copiar ID'}
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>
      </div>

      {/* Verification badge */}
      {profile.verifiedByLeader && (
        <div className="xtg-card__verified">
          <FaCheck /> Verificado por líder
        </div>
      )}

      {/* Share button */}
      <button className="xtg-card__share-btn" onClick={handleShare}>
        <FaShareNodes />
        Compartir con Líder
      </button>

      {/* Footer */}
      <div className="xtg-card__footer">
        <span>Usa este ID para registrarte en tu barrio</span>
      </div>
    </div>
  );
}

export default XtgProfileCard;
