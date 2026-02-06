/**
 * Login Page
 * 
 * Authentication page with login only (no registration).
 * Accounts must be created in the members app first.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validation
    if (!email.trim() || !password.trim()) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    try {
      await login(email, password);
      // Navigation happens automatically via useEffect when isAuthenticated changes
    } catch (err) {
      // Error is already set in context
    }
  };

  const displayError = localError || error;

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo/Header */}
        <div className="login-header">
          <div className="login-logo">👔</div>
          <h1 className="login-title">xTheGospel Leaders</h1>
          <p className="login-subtitle">
            Herramientas para líderes de barrio y estaca
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {displayError && (
            <div className="form-error">
              {displayError}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner">⏳</span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Info Message */}
        <div className="login-footer">
          <div className="login-info">
            <span className="info-icon">ℹ️</span>
            <p className="info-text">
              Usa la misma cuenta que creaste en la app de miembros
              <strong> xTheGospel</strong>
            </p>
          </div>
          <p className="info-subtext">
            ¿No tienes cuenta? Descarga la app de miembros para registrarte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
