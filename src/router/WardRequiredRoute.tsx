/**
 * Ward Required Route Component
 *
 * Ensures user is a member of a ward.
 * EPIC 2.1: Offline/error banners, retry, never block dashboard.
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWardStore } from '../state/ward/useWardStore';
import { useWardLoadStatusStore } from '../state/ward/useWardLoadStatusStore';

interface WardRequiredRouteProps {
  children: React.ReactNode;
}

const WardRequiredRoute: React.FC<WardRequiredRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const { isWardMember, isLoading, loadWardMembership } = useWardStore();
  const { status, errorMessage, isStale, clearError } = useWardLoadStatusStore();
  const location = useLocation();

  useEffect(() => {
    if (user && !isWardMember) {
      loadWardMembership(user.uid);
    }
  }, [user, isWardMember, loadWardMembership]);

  const handleRetry = () => {
    clearError();
    if (user) loadWardMembership(user.uid);
  };

  if (isLoading || status === 'loading') {
    return (
      <div
        className="ward-load-screen"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1F3A5F 0%, #162541 100%)',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ fontSize: '16px', opacity: 0.8 }}>Cargando barrio…</div>
      </div>
    );
  }

  if (status === 'offline' && !isWardMember) {
    return (
      <div
        className="ward-offline-screen"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1F3A5F 0%, #162541 100%)',
          color: 'white',
          padding: 24,
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
          Sin conexión
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9, textAlign: 'center' }}>
          Conéctate para cargar tu barrio.
        </div>
      </div>
    );
  }

  if (status === 'error' && !isWardMember) {
    return (
      <div
        className="ward-error-screen"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1F3A5F 0%, #162541 100%)',
          color: 'white',
          padding: 24,
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
          No se pudo cargar
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9, textAlign: 'center', marginBottom: 24 }}>
          {errorMessage || 'No pudimos cargar tu barrio.'}
        </div>
        <button
          onClick={handleRetry}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            background: 'white',
            color: '#1F3A5F',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!isWardMember) {
    return <Navigate to="/ward-setup" state={{ from: location }} replace />;
  }

  return (
    <>
      {isStale && (
        <div
          className="ward-stale-banner"
          role="status"
          style={{
            padding: '8px 16px',
            fontSize: 13,
            textAlign: 'center',
            background: '#F59E0B',
            color: '#1F2937',
          }}
        >
          Puede estar desactualizado
        </div>
      )}
      {children}
    </>
  );
};

export default WardRequiredRoute;
