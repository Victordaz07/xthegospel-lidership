/**
 * Teaching Analytics Page
 *
 * Métricas e insights para obispado. Detección de problemas. Fase 6.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../context/I18nContext';
import { useWardStore } from '../../../state/ward/useWardStore';
import {
  getWardTeachingStats,
  type WardTeachingStats,
} from '../services/teachingAnalyticsService';
import {
  PageShell,
  Card,
  Button,
  EmptyState,
  SectionTitle,
  TeachingCanonShell,
  TeachingCanonHeroHeader,
} from '../../../ui';

const RANGE_OPTIONS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
];

const TeachingAnalyticsPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { membership } = useWardStore();
  const [stats, setStats] = useState<WardTeachingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysRange, setDaysRange] = useState(30);

  const wardId = membership?.wardId;

  useEffect(() => {
    if (!wardId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const to = Date.now();
    const from = to - daysRange * 24 * 60 * 60 * 1000;

    getWardTeachingStats(wardId, { from, to })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error)?.message ?? 'Error al cargar métricas');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [wardId, daysRange]);

  if (!wardId) {
    return (
      <PageShell onBack={() => navigate('/bishop/teaching')} variant="gradient">
        <TeachingCanonShell>
          <TeachingCanonHeroHeader
            categoryLabel={t('leadership.canon.bishopEyebrow')}
            title={t('leadership.canon.analyticsPageTitle')}
            subtitle={t('leadership.canon.analyticsSubtitle')}
            heroNote={t('leadership.canon.analyticsHeroNote')}
          />
          <EmptyState title="Sin barrio" description="Conéctate a un barrio para ver métricas." />
        </TeachingCanonShell>
      </PageShell>
    );
  }

  return (
    <PageShell onBack={() => navigate('/bishop/teaching')} variant="gradient">
      <TeachingCanonShell>
        <TeachingCanonHeroHeader
          categoryLabel={t('leadership.canon.bishopEyebrow')}
          title={t('leadership.canon.analyticsPageTitle')}
          subtitle={t('leadership.canon.analyticsSubtitle')}
          heroNote={t('leadership.canon.analyticsHeroNote')}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Período:</label>
          <select
            value={daysRange}
            onChange={(e) => setDaysRange(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--am-color-border, #e2e8f0)',
              fontSize: 14,
            }}
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.days} value={opt.days}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--am-color-text-muted)' }}>
            Cargando métricas...
          </p>
        )}
        {error && (
          <p style={{ color: 'var(--am-color-error, #dc2626)', fontSize: 14 }}>{error}</p>
        )}
        {!loading && !error && stats && (
          <>
            <Card variant="default" padding="lg">
              <SectionTitle>Resumen</SectionTitle>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>Sesiones finalizadas</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.totalSessions}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>Asistencia promedio</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.avgAttendancePct}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>Completitud promedio</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.avgCompletionPct}%</div>
                </div>
              </div>
            </Card>

            {stats.staleActiveSessions.length > 0 && (
              <Card variant="default" padding="lg">
                <SectionTitle>⚠️ Sesiones activas sin cerrar (&gt;24h)</SectionTitle>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {stats.staleActiveSessions.map((s) => (
                    <li
                      key={s.sessionId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--am-color-border, #e2e8f0)',
                      }}
                    >
                      <div>
                        <strong>{s.title}</strong>
                        {s.teacherDisplayName && (
                          <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--am-color-text-muted)' }}>
                            {s.teacherDisplayName}
                          </span>
                        )}
                        <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>
                          {s.hoursOpen}h abierta
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/bishop/teaching/${s.sessionId}/report`)}
                      >
                        Ver
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {stats.lowAttendanceSessions.length > 0 && (
              <Card variant="default" padding="lg">
                <SectionTitle>📉 Sesiones con baja completitud (&lt;50%)</SectionTitle>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {stats.lowAttendanceSessions.map((s) => (
                    <li
                      key={s.sessionId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--am-color-border, #e2e8f0)',
                      }}
                    >
                      <div>
                        <strong>{s.title}</strong>
                        <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>
                          {s.attendance} participantes · {s.avgCompletionPct}% completado
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/bishop/teaching/${s.sessionId}/report`)}
                      >
                        Ver reporte
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {stats.topLowCompletionParts.length > 0 && (
              <Card variant="default" padding="lg">
                <SectionTitle>📊 Partes con menor completitud</SectionTitle>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {stats.topLowCompletionParts.map((p, i) => (
                    <li
                      key={`${p.sessionId}-${i}`}
                      style={{
                        padding: '10px 0',
                        borderBottom: '1px solid var(--am-color-border, #e2e8f0)',
                      }}
                    >
                      <strong>{p.partTitle}</strong>
                      <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>
                        {p.sessionTitle} · {p.pct}% completado
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {stats.totalSessions === 0 && stats.staleActiveSessions.length === 0 && (
              <EmptyState
                title="Sin datos"
                description="No hay sesiones finalizadas en este período."
              />
            )}
          </>
        )}
        </div>
      </TeachingCanonShell>
    </PageShell>
  );
};

export default TeachingAnalyticsPage;
