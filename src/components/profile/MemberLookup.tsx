/**
 * MemberLookup - Search members by xTheGospel ID
 * 
 * Allows leaders to search and view member profiles using their
 * xTheGospel ID for ward registration and verification.
 */

import React, { useState } from 'react';
import { FaSearch, FaSpinner, FaCheck, FaUserCheck, FaXmark } from 'react-icons/fa6';
import { getProfileByXtgId, verifyProfile } from '../../services/firebase/userService';
import { useUserProfile } from '../../hooks/useUserProfile';
import { UniversalUserProfile, MemberStatus } from '../../types/user';
import { XtgProfileCard } from './XtgProfileCard';
import './MemberLookup.css';

interface MemberLookupProps {
  onMemberFound?: (profile: UniversalUserProfile) => void;
  onVerify?: (profile: UniversalUserProfile) => void;
}

const STATUS_LABELS: Record<MemberStatus, string> = {
  investigator: 'Investigador',
  new_convert: 'Nuevo Converso',
  active: 'Miembro Activo',
  less_active: 'Miembro',
  returned: 'Misionero Retornado',
};

export function MemberLookup({ onMemberFound, onVerify }: MemberLookupProps): JSX.Element {
  const { profile: leaderProfile } = useUserProfile('leader');
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundProfile, setFoundProfile] = useState<UniversalUserProfile | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;

    setLoading(true);
    setError(null);
    setFoundProfile(null);
    setVerified(false);

    try {
      // Format the ID if needed (add XTG- prefix if missing)
      let formattedId = searchId.trim().toUpperCase();
      if (!formattedId.startsWith('XTG-')) {
        formattedId = `XTG-${formattedId}`;
      }

      const profile = await getProfileByXtgId(formattedId);

      if (profile) {
        setFoundProfile(profile);
        onMemberFound?.(profile);
      } else {
        setError('No se encontró ningún miembro con ese ID');
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!foundProfile || !leaderProfile) return;

    setVerifying(true);
    try {
      await verifyProfile(foundProfile.uid, leaderProfile.uid);
      setVerified(true);
      
      // Update the found profile locally
      setFoundProfile({
        ...foundProfile,
        verifiedByLeader: true,
      });
      
      onVerify?.(foundProfile);
    } catch (err: any) {
      setError('Error al verificar: ' + (err.message || 'Error desconocido'));
    } finally {
      setVerifying(false);
    }
  };

  const handleClear = () => {
    setSearchId('');
    setFoundProfile(null);
    setError(null);
    setVerified(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="member-lookup">
      <div className="member-lookup__header">
        <h2 className="member-lookup__title">Buscar Miembro</h2>
        <p className="member-lookup__subtitle">
          Ingresa el xTheGospel ID para buscar y verificar miembros
        </p>
      </div>

      {/* Search Input */}
      <div className="member-lookup__search">
        <div className="member-lookup__input-wrapper">
          <FaSearch className="member-lookup__input-icon" />
          <input
            type="text"
            className="member-lookup__input"
            placeholder="XTG-2026-ABC123"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchId && (
            <button className="member-lookup__clear" onClick={handleClear}>
              <FaXmark />
            </button>
          )}
        </div>
        <button
          className="member-lookup__btn"
          onClick={handleSearch}
          disabled={loading || !searchId.trim()}
        >
          {loading ? <FaSpinner className="member-lookup__spinner" /> : 'Buscar'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="member-lookup__error">
          {error}
        </div>
      )}

      {/* Found Profile */}
      {foundProfile && (
        <div className="member-lookup__result">
          <XtgProfileCard profile={foundProfile} />

          {/* Additional Info for Leaders */}
          <div className="member-lookup__details">
            <h3 className="member-lookup__details-title">Información del Miembro</h3>
            
            <div className="member-lookup__info-grid">
              <div className="member-lookup__info-item">
                <span className="member-lookup__info-label">Email</span>
                <span className="member-lookup__info-value">
                  {foundProfile.privacy.showEmail || foundProfile.privacy.shareWithLeaders 
                    ? foundProfile.email 
                    : '(privado)'}
                </span>
              </div>

              <div className="member-lookup__info-item">
                <span className="member-lookup__info-label">Teléfono</span>
                <span className="member-lookup__info-value">
                  {foundProfile.privacy.showPhone || foundProfile.privacy.shareWithLeaders 
                    ? (foundProfile.phone || 'No registrado') 
                    : '(privado)'}
                </span>
              </div>

              <div className="member-lookup__info-item">
                <span className="member-lookup__info-label">Estado</span>
                <span className="member-lookup__info-value">
                  {STATUS_LABELS[foundProfile.memberStatus]}
                </span>
              </div>

              <div className="member-lookup__info-item">
                <span className="member-lookup__info-label">Apps Activas</span>
                <span className="member-lookup__info-value">
                  {Object.entries(foundProfile.apps)
                    .filter(([_, active]) => active)
                    .map(([app]) => app)
                    .join(', ') || 'Ninguna'}
                </span>
              </div>

              {foundProfile.ordinances?.baptismDate && (
                <div className="member-lookup__info-item">
                  <span className="member-lookup__info-label">Fecha de Bautismo</span>
                  <span className="member-lookup__info-value">
                    {new Date(foundProfile.ordinances.baptismDate).toLocaleDateString('es')}
                  </span>
                </div>
              )}
            </div>

            {/* Verify Button */}
            {!foundProfile.verifiedByLeader && !verified && (
              <button
                className="member-lookup__verify-btn"
                onClick={handleVerify}
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <FaSpinner className="member-lookup__spinner" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <FaUserCheck />
                    Verificar Miembro
                  </>
                )}
              </button>
            )}

            {(foundProfile.verifiedByLeader || verified) && (
              <div className="member-lookup__verified-badge">
                <FaCheck />
                Miembro Verificado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberLookup;
