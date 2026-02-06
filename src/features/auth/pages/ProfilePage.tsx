/**
 * Profile Page
 * 
 * User profile with account info and logout functionality.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PageShell, Card, Button, SectionTitle } from '../../../ui';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
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

  // Get user initials for avatar
  const getInitials = (email: string | null | undefined): string => {
    if (!email) return '?';
    const parts = email.split('@')[0];
    return parts.charAt(0).toUpperCase();
  };

  // Format email for display
  const displayEmail = user?.email || 'Usuario';

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
              <h2 className="profile-name">Líder</h2>
              <p className="profile-email">{displayEmail}</p>
            </div>
          </div>
          
          <div className="profile-badge">
            <span className="badge-icon">👔</span>
            <span className="badge-text">Liderazgo de Barrio/Estaca</span>
          </div>
        </Card>

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
