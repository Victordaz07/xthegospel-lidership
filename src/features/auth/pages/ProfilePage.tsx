/**
 * Profile Page
 * 
 * User profile with account info, role display, ward info, and logout functionality.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useI18n, type Locale } from '../../../context/I18nContext';
import { useTheme, type ThemeMode } from '../../../context/ThemeContext';
import { useUserRoleStore } from '../../../state/user/useUserRoleStore';
import { useWardStore } from '../../../state/ward/useWardStore';
import { PageShell, Card, Button, SectionTitle } from '../../../ui';
import { WardCodeCard } from '../../ward/components';
import { FLAGS } from '../../../config/featureFlags';
import {
  syncLeadershipToCloud,
  forceHydrateLeadershipFromCloud,
} from '../../leadershipCallings/state/sync/leadershipSync';
import { useSyncStatusStore } from '../../leadershipCallings/state/sync/useSyncStatusStore';
import './ProfilePage.css';

function formatLastSynced(
  date: Date | null,
  t: (path: string, vars?: Record<string, string | number>) => string,
): string {
  if (!date) return t('auth.profile.sync.never');
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return t('auth.profile.sync.justNow');
  if (diffMins < 60) return t('auth.profile.sync.minutesAgo', { count: diffMins });
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return t('auth.profile.sync.hoursAgo', { count: diffHours });
  return date.toLocaleDateString();
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { getRoleLabel, getRoleIcon, getRoleOrganization, isBishopric } = useUserRoleStore();
  const { ward, membership } = useWardStore();
  const { status, lastSyncedAt, setSyncing, setSuccess, setError } = useSyncStatusStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isForceHydrating, setIsForceHydrating] = useState(false);
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error(t('auth.profile.errors.logout'), error);
      setIsLoggingOut(false);
    }
  };

  const handleChangeRole = () => {
    navigate('/select-role');
  };

  const handleToggleLanguage = async () => {
    const nextLocale: Locale = locale === 'en' ? 'es' : 'en';
    await setLocale(nextLocale);
  };

  const handleToggleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const handleSyncNow = async () => {
    if (!FLAGS.CLOUD_SYNC_ENABLED || !navigator.onLine) return;
    setSyncing();
    try {
      const result = await syncLeadershipToCloud();
      if (result.success) setSuccess();
      else setError(result.error ?? t('auth.profile.errors.unknown'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.profile.errors.sync'));
    }
  };

  const handleForceHydrate = async () => {
    if (!FLAGS.CLOUD_SYNC_ENABLED || !navigator.onLine) return;
    if (!window.confirm(t('auth.profile.sync.replaceConfirm'))) return;
    setIsForceHydrating(true);
    useSyncStatusStore.getState().setHydrating(true);
    try {
      const result = await forceHydrateLeadershipFromCloud();
      if (result.success) setSuccess();
      else setError(result.error ?? t('auth.profile.errors.generic'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.profile.errors.hydrate'));
    } finally {
      setIsForceHydrating(false);
      useSyncStatusStore.getState().setHydrating(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (email: string | null | undefined): string => {
    if (!email) return '?';
    const parts = email.split('@')[0];
    return parts.charAt(0).toUpperCase();
  };

  // Format email for display
  const displayEmail = user?.email || t('auth.profile.userFallback');
  const roleLabel = getRoleLabel();
  const roleIcon = getRoleIcon();
  const roleOrg = getRoleOrganization();

  return (
    <PageShell title={t('auth.profile.title')} variant="default">
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
              <span className="badge-text">{roleOrg || t('auth.profile.leadershipFallback')}</span>
            </div>
            {isBishopric() && (
              <span className="profile-badge-level">{t('auth.profile.bishopric')}</span>
            )}
          </div>
        </Card>

        {/* Ward Section */}
        <div className="profile-section">
          <SectionTitle>{t('auth.profile.wardSection')}</SectionTitle>
          
          <Card variant="default" padding="md" className="profile-menu">
            <div className="menu-item">
              <span className="menu-icon">🏛️</span>
              <div className="menu-content">
                <span className="menu-label">{ward?.type === 'branch' ? t('auth.profile.branch') : t('auth.profile.ward')}</span>
                <span className="menu-value">{ward?.name || membership?.wardName || '---'}</span>
              </div>
            </div>
            
            {(ward?.stakeName || membership?.stakeName) && (
              <>
                <div className="menu-divider" />
                <div className="menu-item">
                  <span className="menu-icon">⛪</span>
                  <div className="menu-content">
                    <span className="menu-label">{ward?.stakeType === 'district' ? t('auth.profile.district') : t('auth.profile.stake')}</span>
                    <span className="menu-value">{ward?.stakeName || membership?.stakeName}</span>
                  </div>
                </div>
              </>
            )}
            
            {membership?.joinedVia && (
              <>
                <div className="menu-divider" />
                <div className="menu-item">
                  <span className="menu-icon">📅</span>
                  <div className="menu-content">
                    <span className="menu-label">{t('auth.profile.connected')}</span>
                    <span className="menu-value">
                      {membership.joinedVia === 'created' ? t('auth.profile.joinedCreated') : 
                       membership.joinedVia === 'code' ? t('auth.profile.joinedCode') : t('auth.profile.joinedInvited')}
                    </span>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Ward Code Card - Only for Bishopric */}
        <WardCodeCard />

        {/* Role Section */}
        <div className="profile-section">
          <SectionTitle>{t('auth.profile.callingSection')}</SectionTitle>
          
          <Card variant="default" padding="md" className="profile-menu">
            <div className="menu-item">
              <span className="menu-icon">{roleIcon}</span>
              <div className="menu-content">
                <span className="menu-label">{t('auth.profile.currentCalling')}</span>
                <span className="menu-value">{roleLabel}</span>
              </div>
            </div>
            
            {roleOrg && (
              <>
                <div className="menu-divider" />
                <div className="menu-item">
                  <span className="menu-icon">📋</span>
                  <div className="menu-content">
                    <span className="menu-label">{t('auth.profile.organization')}</span>
                    <span className="menu-value">{roleOrg}</span>
                  </div>
                </div>
              </>
            )}
            
            <div className="menu-divider" />
            
            <button className="menu-item menu-item-button" onClick={handleChangeRole}>
              <span className="menu-icon">🔄</span>
              <div className="menu-content">
                <span className="menu-value">{t('auth.profile.changeCalling')}</span>
              </div>
              <span className="menu-arrow">→</span>
            </button>
          </Card>
        </div>

        {/* Account Section */}
        <div className="profile-section">
          <SectionTitle>{t('auth.profile.accountSection')}</SectionTitle>
          
          <Card variant="default" padding="md" className="profile-menu">
            <div className="menu-item">
              <span className="menu-icon">📧</span>
              <div className="menu-content">
                <span className="menu-label">{t('auth.profile.email')}</span>
                <span className="menu-value">{displayEmail}</span>
              </div>
            </div>
            
            <div className="menu-divider" />
            
            <div className="menu-item">
              <span className="menu-icon">🟢</span>
              <div className="menu-content">
                <span className="menu-label">{t('auth.profile.accountStatus')}</span>
                <span className="menu-value">{t('auth.profile.accountStatusValue')}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences Section */}
        <div className="profile-section">
          <SectionTitle>{t('auth.profile.preferencesSection')}</SectionTitle>
          <Card variant="default" padding="md" className="profile-menu">
            <button className="menu-item menu-item-button" onClick={handleToggleLanguage}>
              <span className="menu-icon">🌐</span>
              <div className="menu-content">
                <span className="menu-label">{t('auth.profile.language')}</span>
                <span className="menu-value">{locale.toUpperCase()}</span>
              </div>
              <span className="menu-arrow">→</span>
            </button>
            <div className="menu-divider" />
            <button className="menu-item menu-item-button" onClick={handleToggleTheme}>
              <span className="menu-icon">🎨</span>
              <div className="menu-content">
                <span className="menu-label">{t('auth.profile.appearance')}</span>
                <span className="menu-value">{t(`auth.profile.theme.${theme}`)}</span>
              </div>
              <span className="menu-arrow">→</span>
            </button>
          </Card>
        </div>

        {/* Sync Section (only when cloud sync enabled) */}
        {FLAGS.CLOUD_SYNC_ENABLED && (
          <div className="profile-section">
            <SectionTitle>{t('auth.profile.sync.section')}</SectionTitle>
            
            <Card variant="default" padding="md" className="profile-menu">
              <div className="menu-item">
                <span className="menu-icon">🔄</span>
                <div className="menu-content">
                  <span className="menu-label">{t('auth.profile.sync.lastSync')}</span>
                  <span className="menu-value">
                    {status === 'syncing' ? t('auth.profile.sync.syncing') : formatLastSynced(lastSyncedAt, t)}
                  </span>
                </div>
              </div>
              
              <div className="menu-divider" />
              
              <button
                className="menu-item menu-item-button"
                onClick={handleSyncNow}
                disabled={!navigator.onLine || status === 'syncing'}
              >
                <span className="menu-icon">☁️</span>
                <div className="menu-content">
                  <span className="menu-value">{t('auth.profile.sync.syncNow')}</span>
                </div>
                <span className="menu-arrow">→</span>
              </button>
              
              <div className="menu-divider" />
              
              <button
                className="menu-item menu-item-button"
                onClick={handleForceHydrate}
                disabled={!navigator.onLine || isForceHydrating}
              >
                <span className="menu-icon">⬇️</span>
                <div className="menu-content">
                  <span className="menu-value">
                    {isForceHydrating ? t('auth.profile.sync.loading') : t('auth.profile.sync.replaceFromCloud')}
                  </span>
                </div>
                <span className="menu-arrow">→</span>
              </button>
            </Card>
          </div>
        )}

        {/* App Info Section */}
        <div className="profile-section">
          <SectionTitle>{t('auth.profile.appSection')}</SectionTitle>
          
          <Card variant="default" padding="md" className="profile-menu">
            <div className="menu-item">
              <span className="menu-icon">📱</span>
              <div className="menu-content">
                <span className="menu-label">{t('auth.profile.version')}</span>
                <span className="menu-value">{appVersion}</span>
              </div>
            </div>
            
            <div className="menu-divider" />
            
            <div className="menu-item">
              <span className="menu-icon">💾</span>
              <div className="menu-content">
                <span className="menu-label">{t('auth.profile.storage')}</span>
                <span className="menu-value">{t('auth.profile.storageValue')}</span>
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
            {isLoggingOut ? t('auth.profile.loggingOut') : t('auth.profile.logout')}
          </Button>
        </div>

        {/* Footer */}
        <div className="profile-footer">
          <p className="footer-text">
            xTheGospel Leaders
          </p>
          <p className="footer-subtext">
            {t('auth.profile.footerSubtitle')}
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
