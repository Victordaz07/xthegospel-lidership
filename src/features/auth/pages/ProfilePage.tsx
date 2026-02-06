/**
 * Profile Page
 * 
 * User profile with account info, role display, and logout functionality.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useUserRoleStore } from '../../../state/user/useUserRoleStore';
import { PageShell, Card, Button, SectionTitle } from '../../../ui';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { getRoleLabel, getRoleIcon, getRoleOrganization, isBishopric } = useUserRoleStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

  const handleChangeRole = () => {
    navigate('/select-role');
  };

  // Get user initials for avatar
  const getInitials = (email: string | null | undefined): string => {
    if (!email) return '?';
    const parts = email.split('@')[0];
    return parts.charAt(0).toUpperCase();
  };

  // Format email for display
  const displayEmail = user?.email || 'Usuario';
  const roleLabel = getRoleLabel();
  const roleIcon = getRoleIcon();
  const roleOrg = getRoleOrganization();

  return (
    <PageShell title="Perfil" variant="default">
      <div className="profile-page">
        {/* User Info Card */}
        <Card variant="default" padding="lg" className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials(user?.email)}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{roleLabel}</h2>
              <p className="profile-email">{displayEmail}</p>
            </div>
          </div>
          
          <div className="profile-badge-container">
            <div className={`profile-badge ${isBishopric() ? 'profile-badge-bishopric' : ''}`}>
              <span className="badge-icon">{roleIcon}</span>
              <span className="badge-text">{roleOrg || 'Liderazgo'}</span>
            </div>
            {isBishopric() && (
              <span className="profile-badge-level">Obispado</span>
            )}
          </div>
        </Card>

        {/* Role Section */}
        <div className="profile-section">
          <SectionTitle>Tu Llamamiento</SectionTitle>
          
          <Card variant="default" padding="md" className="profile-menu">
            <div className="menu-item">
              <span className="menu-icon">{roleIcon}</span>
              <div className="menu-content">
                <span className="menu-label">Llamamiento actual</span>
                <span className="menu-value">{roleLabel}</span>
              </div>
            </div>
            
            {roleOrg && (
              <>
                <div className="menu-divider" />
                <div className="menu-item">
                  <span className="menu-icon">🏛️</span>
                  <div className="menu-content">
                    <span className="menu-label">Organización</span>
                    <span className="menu-value">{roleOrg}</span>
                  </div>
                </div>
              </>
            )}
            
            <div className="menu-divider" />
            
            <button className="menu-item menu-item-button" onClick={handleChangeRole}>
              <span className="menu-icon">🔄</span>
              <div className="menu-content">
                <span className="menu-value">Cambiar llamamiento</span>
              </div>
              <span className="menu-arrow">→</span>
            </button>
          </Card>
        </div>

        {/* Account Section */}
        <div className="profile-section">
          <SectionTitle>Cuenta</SectionTitle>
          
          <Card variant="default" padding="md" className="profile-menu">
            <div className="menu-item">
              <span className="menu-icon">📧</span>
              <div className="menu-content">
                <span className="menu-label">Correo electrónico</span>
                <span className="menu-value">{displayEmail}</span>
              </div>
            </div>
            
            <div className="menu-divider" />
            
            <div className="menu-item">
              <span className="menu-icon">🔒</span>
              <div className="menu-content">
                <span className="menu-label">ID de usuario</span>
                <span className="menu-value menu-value-mono">
                  {user?.uid?.slice(0, 12) || '---'}...
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* App Info Section */}
        <div className="profile-section">
          <SectionTitle>Aplicación</SectionTitle>
          
          <Card variant="default" padding="md" className="profile-menu">
            <div className="menu-item">
              <span className="menu-icon">📱</span>
              <div className="menu-content">
                <span className="menu-label">Versión</span>
                <span className="menu-value">1.0.0</span>
              </div>
            </div>
            
            <div className="menu-divider" />
            
            <div className="menu-item">
              <span className="menu-icon">💾</span>
              <div className="menu-content">
                <span className="menu-label">Almacenamiento</span>
                <span className="menu-value">Local + Cloud (opcional)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Logout Button */}
        <div className="profile-actions">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleLogout}
            disabled={isLoading || isLoggingOut}
          >
            {isLoggingOut ? '⏳ Cerrando sesión...' : '🚪 Cerrar sesión'}
          </Button>
        </div>

        {/* Footer */}
        <div className="profile-footer">
          <p className="footer-text">
            xTheGospel Leaders
          </p>
          <p className="footer-subtext">
            Herramientas para servir mejor
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
