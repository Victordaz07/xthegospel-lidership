/**
 * Ward Code Card Component
 * 
 * Displays the ward join code and allows sharing/regenerating.
 * Only visible to Bishopric members.
 */

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useWardStore } from '../../../state/ward/useWardStore';
import { useUserRoleStore } from '../../../state/user/useUserRoleStore';
import { Card, Button, SectionTitle } from '../../../ui';
import './WardCodeCard.css';

const WardCodeCard: React.FC = () => {
  const { user } = useAuth();
  const { ward, getFormattedCode, regenerateCode, isLoading } = useWardStore();
  const { isBishopric } = useUserRoleStore();
  const [copied, setCopied] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);

  // Only show to bishopric members
  if (!isBishopric() || !ward) {
    return null;
  }

  const code = getFormattedCode();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.replace('-', ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const shareText = `Únete a nuestro barrio en xTheGospel Leaders usando el código: ${code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Código del Barrio',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  const handleRegenerate = async () => {
    if (!user) return;
    
    try {
      await regenerateCode(user.uid);
      setShowConfirmRegenerate(false);
    } catch (err) {
      // Error handled in store
    }
  };

  return (
    <div className="ward-code-section">
      <SectionTitle>Código del Barrio</SectionTitle>
      
      <Card variant="default" padding="lg" className="ward-code-card">
        <div className="code-display">
          <span className="code-label">Comparte este código con otros líderes</span>
          <div className="code-value">{code}</div>
          <span className="code-ward-name">{ward.name}</span>
        </div>

        <div className="code-actions">
          <Button
            variant="primary"
            onClick={handleShare}
            disabled={isLoading}
          >
            {copied ? '✓ Copiado' : '📤 Compartir código'}
          </Button>
          
          <button
            className="regenerate-link"
            onClick={() => setShowConfirmRegenerate(true)}
            disabled={isLoading}
          >
            🔄 Regenerar código
          </button>
        </div>

        {showConfirmRegenerate && (
          <div className="regenerate-confirm">
            <p>¿Regenerar código? El código actual dejará de funcionar.</p>
            <div className="confirm-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirmRegenerate(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRegenerate}
                disabled={isLoading}
              >
                {isLoading ? 'Regenerando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WardCodeCard;
