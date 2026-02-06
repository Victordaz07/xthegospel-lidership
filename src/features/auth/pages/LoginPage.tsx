/**
 * Login Page
 * 
 * Authentication page with login and registration forms.
 * Clean, minimal design following the app's reverent aesthetic.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './LoginPage.css';

type AuthMode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError, isAuthenticated } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setLocalError('Las contraseñas no coinciden');
        return;
      }
      if (password.length < 6) {
        setLocalError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      // Navigation happens automatically via useEffect when isAuthenticated changes
    } catch (err) {
      // Error is already set in context
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setLocalError(null);
    clearError();
    setConfirmPassword('');
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
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={isLoading}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
          )}

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
            ) : mode === 'login' ? (
              'Iniciar sesión'
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="login-footer">
          <p className="toggle-text">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </p>
          <button
            type="button"
            className="toggle-button"
            onClick={toggleMode}
            disabled={isLoading}
          >
            {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
