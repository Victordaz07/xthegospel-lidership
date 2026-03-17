/**
 * Login Page
 * 
 * Authentication page with login only (no registration).
 * Accounts must be created in the members app first.
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const target = returnTo && returnTo.startsWith('/') ? returnTo : '/';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validation
    if (!email.trim() || !password.trim()) {
      setLocalError(t('auth.login.errors.completeAllFields'));
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
          <h1 className="login-title">{t('auth.login.title')}</h1>
          <p className="login-subtitle">
            {t('auth.login.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t('auth.login.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.login.emailPlaceholder')}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t('auth.login.passwordLabel')}
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
              t('auth.login.submit')
            )}
          </button>
        </form>

        {/* Info Message */}
        <div className="login-footer">
          <div className="login-info">
            <span className="info-icon">ℹ️</span>
            <p className="info-text">
              {t('auth.login.infoText')}
              <strong> xTheGospel</strong>
            </p>
          </div>
          <p className="info-subtext">
            {t('auth.login.noAccountPrefix')}{' '}
            <a href="https://xthegospel.com" target="_blank" rel="noopener noreferrer" className="info-link">
              xthegospel.com
            </a>
            {' '}{t('auth.login.noAccountSuffix')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
