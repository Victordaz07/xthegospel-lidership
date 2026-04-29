/**
 * Login Page
 *
 * Sign-in with Google or email/password. Firebase Auth persists the session in this browser.
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SiGoogle } from 'react-icons/si';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { isSafeReturnTo } from '../../../utils/safeReturnTo';
import './LoginPage.css';

function isParticipantLoginContext(
  context: string | null,
  returnTo: string | null
): boolean {
  if (context === 'participant') return true;
  if (!returnTo || !isSafeReturnTo(returnTo)) return false;
  if (returnTo.startsWith('/join')) return true;
  if (returnTo.startsWith('/session/') && returnTo.includes('/live')) return true;
  return false;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnToRaw = searchParams.get('returnTo');
  const returnTo =
    returnToRaw && isSafeReturnTo(returnToRaw) ? returnToRaw : null;
  const loginContext = searchParams.get('context');
  const isParticipant = isParticipantLoginContext(loginContext, returnTo);
  const { login, loginWithGoogle, isLoading, error, clearError, isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  const busy = isLoading || googleBusy;

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const target = returnTo ?? '/';
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

  const handleGoogle = async () => {
    setLocalError(null);
    clearError();
    try {
      setGoogleBusy(true);
      await loginWithGoogle();
    } catch {
      // Context already holds message
    } finally {
      setGoogleBusy(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo/Header */}
        <div className="login-header">
          <div className="login-logo" aria-hidden>
            {isParticipant ? '📖' : '👔'}
          </div>
          <h1 className="login-title">
            {isParticipant
              ? t('auth.login.participant.title')
              : t('auth.login.title')}
          </h1>
          <p className="login-subtitle">
            {isParticipant
              ? t('auth.login.participant.subtitle')
              : t('auth.login.subtitle')}
          </p>
        </div>

        <div className="login-oauth">
          <button
            type="button"
            className="login-google-btn"
            onClick={() => void handleGoogle()}
            disabled={busy}
          >
            <SiGoogle className="login-google-icon" aria-hidden />
            {googleBusy ? t('auth.login.googleLoading') : t('auth.login.googleContinue')}
          </button>
        </div>

        <div className="login-divider" role="presentation">
          <span>{t('auth.login.orWithEmail')}</span>
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
              disabled={busy}
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
              disabled={busy}
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
            disabled={busy}
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
              {isParticipant
                ? t('auth.login.participant.infoText')
                : t('auth.login.infoText')}
            </p>
          </div>
          <p className="info-subtext">
            {isParticipant
              ? t('auth.login.participant.helpText')
              : t('auth.login.helpText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
