/**
 * Teaching Sessions List Page
 *
 * Lista de sesiones del maestro (últimas 10).
 * Query: wards/{wardId}/teachingSessions where teacherUid == currentUser.uid
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { useWardStore } from '../../../state/ward/useWardStore';
import { listSessionsForTeacher } from '../services/teachingSessionsService';
import type { TeachingSession } from '../types';
import { PageShell, Card, Button, EmptyState, SectionTitle } from '../../../ui';
import { TeachingCanonShell, TeachingCanonHeroHeader } from '../../../ui/teaching-canon';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'En vivo',
  completed: 'Finalizada',
};

const TeachingSessionsListPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { membership } = useWardStore();
  const [sessions, setSessions] = useState<TeachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wardId = membership?.wardId;

  const MS_24H = 24 * 60 * 60 * 1000;
  const staleActiveSessions = sessions.filter(
    (s) => s.status === 'active' && Date.now() - s.updatedAt > MS_24H
  );

  useEffect(() => {
    if (!wardId || !user?.uid) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    listSessionsForTeacher(wardId, user.uid, 30)
      .then((list) => {
        if (!cancelled) setSessions(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Error al cargar sesiones');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [wardId, user?.uid]);

  if (!wardId) {
    return (
      <PageShell variant="gradient">
        <TeachingCanonShell>
          <TeachingCanonHeroHeader
            categoryLabel={t('leadership.canon.teachingEyebrow')}
            title={t('leadership.canon.teachingPageTitle')}
            subtitle={t('leadership.canon.teachingSubtitle')}
            heroNote={t('leadership.canon.teachingHeroNote')}
          />
          <EmptyState
            title="Sin barrio"
            description="Conéctate a un barrio para crear sesiones."
          />
        </TeachingCanonShell>
      </PageShell>
    );
  }

  return (
    <PageShell variant="gradient">
      <TeachingCanonShell>
        <TeachingCanonHeroHeader
          categoryLabel={t('leadership.canon.teachingEyebrow')}
          title={t('leadership.canon.teachingPageTitle')}
          subtitle={t('leadership.canon.teachingSubtitle')}
          heroNote={t('leadership.canon.teachingHeroNote')}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {staleActiveSessions.length > 0 && (
          <Card
            variant="default"
            padding="md"
            style={{
              background: 'var(--am-color-warning-bg, #fef3c7)',
              border: '1px solid var(--am-color-warning, #f59e0b)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>
              Tienes {staleActiveSessions.length} sesión{staleActiveSessions.length !== 1 ? 'es' : ''} activa{staleActiveSessions.length !== 1 ? 's' : ''} sin cerrar.
            </p>
            <p style={{ margin: '4px 0 12px 0', fontSize: 14, color: 'var(--am-color-text-muted)' }}>
              Llevan más de 24 horas abiertas.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/teaching/${staleActiveSessions[0].id}`)}
            >
              Ir a cerrar
            </Button>
          </Card>
        )}

        <Button variant="primary" fullWidth onClick={() => navigate('/teaching/new')}>
          ➕ Nueva sesión
        </Button>

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--am-color-text-muted)' }}>
            Cargando...
          </p>
        )}
        {error && (
          <p style={{ color: 'var(--am-color-error, #dc2626)', fontSize: '14px' }}>
            {error}
          </p>
        )}
        {!loading && !error && sessions.length === 0 && (
          <EmptyState
            title="Sin sesiones"
            description="Crea tu primera sesión para preparar una clase."
            action={
              <Button variant="primary" onClick={() => navigate('/teaching/new')}>
                Nueva sesión
              </Button>
            }
          />
        )}
        {!loading && sessions.length > 0 && (
          <>
            <SectionTitle>Últimas sesiones</SectionTitle>
            {sessions.map((s) => (
              <Card
                key={s.id}
                variant="default"
                padding="md"
                onClick={() => navigate(`/teaching/${s.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{s.title}</strong>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 12,
                        color: 'var(--am-color-text-muted)',
                      }}
                    >
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: 'var(--am-color-text-muted)' }}>
                  {s.parts.length} parte{s.parts.length !== 1 ? 's' : ''}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/teaching/${s.id}`);
                  }}
                  >
                    Abrir
                  </Button>
                </div>
              </Card>
            ))}
          </>
        )}
        </div>
      </TeachingCanonShell>
    </PageShell>
  );
};

export default TeachingSessionsListPage;
