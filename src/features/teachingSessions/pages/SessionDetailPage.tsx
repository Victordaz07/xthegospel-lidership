/**
 * Session Detail Page
 *
 * Muestra título, callingType, partes.
 * Botones: Guardar cambios (si editas), Activar sesión (si draft).
 * Al activar: joinCode + QR card (placeholder QR en Fase 1).
 * Botón: Ir a En Vivo → /teaching/:id/live
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { useWardStore } from '../../../state/ward/useWardStore';
import {
  getSession,
  activateSession,
  completeSession,
} from '../services/teachingSessionsService';
import type { TeachingSession, CallingType } from '../types';
import { PageShell, Card, Button, SectionTitle } from '../../../ui';
import {
  TeachingCanonShell,
  TeachingCanonHeroHeader,
  TeachingCanonAudioCard,
  TeachingCanonImagePlaceholder,
  TeachingCanonReflectionHint,
} from '../../../ui/teaching-canon';

const CALLING_LABELS: Record<CallingType, string> = {
  sunday_school: 'Escuela Dominical',
  seminary: 'Seminario',
  quorum: 'Quórum',
  relief_society: 'Sociedad de Socorro',
  primary: 'Primaria',
  other: 'Otro',
};

const SessionDetailPage: React.FC = () => {
  const { t } = useI18n();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { membership } = useWardStore();
  const [session, setSession] = useState<TeachingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const wardId = membership?.wardId;

  const MS_24H = 24 * 60 * 60 * 1000;
  const isStaleActive = Boolean(
    session?.status === 'active' && session && Date.now() - session.updatedAt > MS_24H
  );

  useEffect(() => {
    if (!wardId || !sessionId) {
      setLoading(false);
      return;
    }
    getSession(wardId, sessionId)
      .then(setSession)
      .catch((err) => setError(err?.message ?? 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [wardId, sessionId]);

  const handleActivate = async () => {
    if (!wardId || !sessionId || !user?.uid) return;
    if (session?.teacherUid !== user.uid) return;

    setActivating(true);
    setError(null);
    try {
      const code = await activateSession(wardId, sessionId);
      setJoinCode(code);
      setSession((prev) =>
        prev ? { ...prev, status: 'active', joinCode: code } : null
      );
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al activar');
    } finally {
      setActivating(false);
    }
  };

  const handleGoLive = () => {
    navigate(`/teaching/${sessionId}/live`);
  };

  const displayCode = joinCode ?? session?.joinCode;
  const joinUrl = displayCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join?code=${encodeURIComponent(displayCode)}`
    : '';

  const handleCopyCode = async () => {
    if (!displayCode) return;
    try {
      await navigator.clipboard.writeText(displayCode);
    } catch {
      // fallback: copy join URL
      await navigator.clipboard.writeText(joinUrl);
    }
  };

  const handleCompleteFromDetail = async () => {
    if (!wardId || !sessionId || session?.teacherUid !== user?.uid) return;
    setCompleting(true);
    setError(null);
    try {
      await completeSession(wardId, sessionId);
      navigate(`/teaching/${sessionId}/report`, { replace: true });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al cerrar');
    } finally {
      setCompleting(false);
    }
  };

  if (!wardId || !sessionId) {
    return (
      <PageShell title="Sesión" onBack={() => navigate(-1)} variant="gradient">
        <p>Parámetros inválidos.</p>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Sesión" onBack={() => navigate(-1)} variant="gradient">
        <p>Cargando...</p>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell title="Sesión" onBack={() => navigate(-1)} variant="gradient">
        <p>Sesión no encontrada.</p>
      </PageShell>
    );
  }

  if (session.teacherUid !== user?.uid) {
    return (
      <PageShell title="Sesión" onBack={() => navigate(-1)} variant="gradient">
        <p>No tienes permiso para ver esta sesión.</p>
      </PageShell>
    );
  }

  const sessionSubtitle = t('leadership.canon.sessionSubtitle', {
    calling: CALLING_LABELS[session.callingType],
    parts: session.parts.length,
  });

  return (
    <PageShell onBack={() => navigate('/teaching')} variant="gradient">
      <TeachingCanonShell>
        <TeachingCanonHeroHeader
          categoryLabel={t('leadership.canon.teachingEyebrow')}
          title={session.title}
          subtitle={sessionSubtitle}
          heroNote={t('leadership.canon.sessionHeroNote')}
        />
        <TeachingCanonAudioCard
          audio={{
            eyebrow: t('leadership.canon.sessionAudioEyebrow'),
            title: t('leadership.canon.sessionAudioTitle'),
            summary: t('leadership.canon.sessionAudioSummary'),
            scriptIntent: t('leadership.canon.sessionAudioIntent'),
          }}
          audioStatusLabel={t('leadership.canon.sessionAudioStatus')}
        />
        <TeachingCanonImagePlaceholder
          image={{
            label: t('leadership.canon.sessionImageLabel'),
            title: t('leadership.canon.sessionImageTitle'),
            prompt: t('leadership.canon.sessionImagePrompt'),
            aspectRatio: '16:9',
          }}
        />
        <TeachingCanonReflectionHint
          label={t('leadership.canon.reflectionLabel')}
          body={t('leadership.canon.reflectionBody')}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {isStaleActive && (
          <Card
            variant="default"
            padding="md"
            style={{
              background: 'var(--am-color-warning-bg, #fef3c7)',
              border: '1px solid var(--am-color-warning, #f59e0b)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>
              Esta sesión sigue abierta. ¿Deseas cerrarla ahora?
            </p>
            <p style={{ margin: '4px 0 12px 0', fontSize: 14, color: 'var(--am-color-text-muted)' }}>
              Lleva más de 24 horas activa.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompleteFromDetail}
              loading={completing}
              disabled={completing}
            >
              Cerrar sesión
            </Button>
          </Card>
        )}

        <Card variant="default" padding="md">
          <div style={{ fontSize: 14, color: 'var(--am-color-text-muted)' }}>
            {CALLING_LABELS[session.callingType]}
          </div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>{session.title}</div>
          {session.parts.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <SectionTitle>Partes</SectionTitle>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {session.parts
                  .sort((a, b) => a.order - b.order)
                  .map((p) => (
                    <li key={p.id} style={{ marginBottom: 4 }}>
                      {p.title}
                      {p.estimatedMinutes && (
                        <span style={{ color: 'var(--am-color-text-muted)', marginLeft: 8 }}>
                          ({p.estimatedMinutes} min)
                        </span>
                      )}
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </Card>

        {session.status === 'draft' && (
          <>
            {displayCode ? (
              <Card variant="default" padding="lg">
                <SectionTitle>Código de unión</SectionTitle>
                <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: 2, margin: '12px 0' }}>
                  {displayCode}
                </p>
                <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                  Copiar código
                </Button>
                {joinUrl && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <QRCodeSVG value={joinUrl} size={160} level="M" />
                    <p style={{ fontSize: 12, color: 'var(--am-color-text-muted)', marginTop: 8 }}>
                      Escanea para unirte
                    </p>
                  </div>
                )}
                <div style={{ marginTop: 16 }}>
                  <Button variant="primary" fullWidth onClick={handleGoLive}>
                    Ir a En Vivo
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleActivate}
                  loading={activating}
                >
                  Activar sesión
                </Button>
                {error && (
                  <p style={{ color: 'var(--am-color-error, #dc2626)', fontSize: 14 }}>{error}</p>
                )}
              </>
            )}
          </>
        )}

        {session.status === 'active' && (
          <Card variant="default" padding="lg">
            <SectionTitle>Código de unión</SectionTitle>
            <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: 2, margin: '12px 0' }}>
              {session.joinCode ?? '—'}
            </p>
            <Button variant="ghost" size="sm" onClick={handleCopyCode}>
              Copiar código
            </Button>
            {joinUrl && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <QRCodeSVG value={joinUrl} size={160} level="M" />
                <p style={{ fontSize: 12, color: 'var(--am-color-text-muted)', marginTop: 8 }}>
                  Escanea para unirte
                </p>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <Button variant="primary" fullWidth onClick={handleGoLive}>
                Ir a En Vivo
              </Button>
            </div>
          </Card>
        )}

        {session.status === 'completed' && (
          <Card variant="default" padding="md">
            <p style={{ color: 'var(--am-color-text-muted)' }}>Sesión finalizada.</p>
          </Card>
        )}
        </div>
      </TeachingCanonShell>
    </PageShell>
  );
};

export default SessionDetailPage;
