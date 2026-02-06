/**
 * WardCodeGenerator - Generate and manage ward invitation codes
 * 
 * Allows leaders to view, copy, share, and regenerate ward join codes.
 */

import React, { useState, useEffect } from 'react';
import { 
  FaCopy, 
  FaCheck, 
  FaShareNodes, 
  FaRotate, 
  FaPlus, 
  FaChurch,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa6';
import { useUserProfile } from '../../hooks/useUserProfile';
import { 
  getUserWardMembership, 
  getWard, 
  regenerateWardCode,
  createWard,
} from '../../services/firebase/wardService';
import { Ward, UserWardMembership, formatWardCode } from '../../types/ward';
import './WardCodeGenerator.css';

interface WardCodeGeneratorProps {
  onWardCreated?: (ward: Ward) => void;
}

export function WardCodeGenerator({ onWardCreated }: WardCodeGeneratorProps): JSX.Element {
  const { profile, loading: profileLoading } = useUserProfile('leader');
  const [ward, setWard] = useState<Ward | null>(null);
  const [membership, setMembership] = useState<UserWardMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create ward state
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [wardName, setWardName] = useState('');
  const [wardType, setWardType] = useState<'ward' | 'branch'>('ward');
  const [stakeName, setStakeName] = useState('');

  // Load ward data
  useEffect(() => {
    loadWardData();
  }, [profile]);

  const loadWardData = async () => {
    if (!profile?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userMembership = await getUserWardMembership(profile.uid);
      setMembership(userMembership);
      
      if (userMembership?.wardId) {
        const wardData = await getWard(userMembership.wardId);
        setWard(wardData);
      }
    } catch (err: any) {
      console.error('Error loading ward data:', err);
      setError('Error al cargar datos del barrio');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!ward?.joinCode) return;
    
    try {
      await navigator.clipboard.writeText(formatWardCode(ward.joinCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying code:', err);
    }
  };

  const handleShare = async () => {
    if (!ward) return;
    
    const shareText = `Únete al Barrio ${ward.name} en xTheGospel!\n\nCódigo de invitación: ${formatWardCode(ward.joinCode)}\n\nDescarga la app: https://xthegospel.app`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitación al Barrio ${ward.name}`,
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Invitación copiada al portapapeles');
    }
  };

  const handleRegenerate = async () => {
    if (!ward || !profile?.uid) return;
    
    if (!confirm('¿Estás seguro de regenerar el código? El código anterior dejará de funcionar.')) {
      return;
    }
    
    try {
      setRegenerating(true);
      setError(null);
      const newCode = await regenerateWardCode(ward.id, profile.uid);
      setWard({ ...ward, joinCode: newCode });
    } catch (err: any) {
      console.error('Error regenerating code:', err);
      setError('Error al regenerar código');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !wardName.trim()) return;
    
    try {
      setCreating(true);
      setError(null);
      
      const newWard = await createWard({
        name: wardName.trim(),
        type: wardType,
        stakeName: stakeName.trim() || undefined,
      }, profile.uid);
      
      setWard(newWard);
      setShowCreateForm(false);
      setWardName('');
      setStakeName('');
      
      onWardCreated?.(newWard);
    } catch (err: any) {
      console.error('Error creating ward:', err);
      setError('Error al crear barrio');
    } finally {
      setCreating(false);
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="ward-code-loading">
        <FaSpinner className="ward-code-spinner" />
        <span>Cargando...</span>
      </div>
    );
  }

  // No ward - show create form
  if (!ward) {
    if (showCreateForm) {
      return (
        <div className="ward-code-container">
          <div className="ward-code-header">
            <FaChurch className="ward-code-icon" />
            <h3>Crear Barrio</h3>
          </div>
          
          <form className="ward-create-form" onSubmit={handleCreateWard}>
            <div className="ward-form-field">
              <label>Nombre del Barrio</label>
              <input
                type="text"
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                placeholder="Ej: Barrio Centro"
                required
              />
            </div>
            
            <div className="ward-form-field">
              <label>Tipo</label>
              <div className="ward-type-options">
                <button
                  type="button"
                  className={`ward-type-btn ${wardType === 'ward' ? 'ward-type-btn--active' : ''}`}
                  onClick={() => setWardType('ward')}
                >
                  Barrio
                </button>
                <button
                  type="button"
                  className={`ward-type-btn ${wardType === 'branch' ? 'ward-type-btn--active' : ''}`}
                  onClick={() => setWardType('branch')}
                >
                  Rama
                </button>
              </div>
            </div>
            
            <div className="ward-form-field">
              <label>Estaca (opcional)</label>
              <input
                type="text"
                value={stakeName}
                onChange={(e) => setStakeName(e.target.value)}
                placeholder="Ej: Estaca Lima Norte"
              />
            </div>

            {error && (
              <div className="ward-error">
                <FaExclamationTriangle />
                {error}
              </div>
            )}
            
            <div className="ward-form-actions">
              <button 
                type="button" 
                className="ward-btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="ward-btn-primary"
                disabled={creating || !wardName.trim()}
              >
                {creating ? (
                  <>
                    <FaSpinner className="ward-code-spinner" />
                    Creando...
                  </>
                ) : (
                  'Crear Barrio'
                )}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="ward-code-container ward-code-container--empty">
        <div className="ward-code-empty">
          <FaChurch className="ward-empty-icon" />
          <h3>Sin Barrio Asignado</h3>
          <p>Crea un barrio para generar códigos de invitación</p>
          <button 
            className="ward-btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <FaPlus />
            Crear Barrio
          </button>
        </div>
      </div>
    );
  }

  // Has ward - show code
  return (
    <div className="ward-code-container">
      <div className="ward-code-header">
        <FaChurch className="ward-code-icon" />
        <div className="ward-code-info">
          <h3>{ward.name}</h3>
          {ward.stakeName && <p>{ward.stakeName}</p>}
        </div>
      </div>

      <div className="ward-code-card">
        <span className="ward-code-label">Código de Invitación</span>
        <span className="ward-code-value">{formatWardCode(ward.joinCode)}</span>
        <span className="ward-code-hint">
          Los miembros usan este código para unirse al barrio
        </span>
      </div>

      {error && (
        <div className="ward-error">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      <div className="ward-code-actions">
        <button 
          className="ward-action-btn"
          onClick={handleCopy}
          disabled={copied}
        >
          {copied ? <FaCheck /> : <FaCopy />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        
        <button 
          className="ward-action-btn"
          onClick={handleShare}
        >
          <FaShareNodes />
          Compartir
        </button>
        
        <button 
          className="ward-action-btn ward-action-btn--secondary"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          <FaRotate className={regenerating ? 'ward-code-spinner' : ''} />
          Regenerar
        </button>
      </div>

      <div className="ward-code-stats">
        <div className="ward-stat">
          <span className="ward-stat-value">{ward.memberCount || 0}</span>
          <span className="ward-stat-label">Miembros</span>
        </div>
        <div className="ward-stat">
          <span className="ward-stat-value">{ward.leaderCount || 0}</span>
          <span className="ward-stat-label">Líderes</span>
        </div>
      </div>
    </div>
  );
}
