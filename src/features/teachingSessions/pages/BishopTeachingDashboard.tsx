/**
 * Bishop Teaching Dashboard
 *
 * Vista de supervisión para obispado. Lista todas las sesiones del barrio (solo lectura).
 * Fase 5.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../context/I18nContext';
import { useWardStore } from '../../../state/ward/useWardStore';
import { listSessionsForWard } from '../services/teachingSessionsService';
import type { TeachingSession, CallingType } from '../types';
import { PageShell, Card, Button, EmptyState, SectionTitle } from '../../../ui';
import { TeachingCanonShell, TeachingCanonHeroHeader } from '../../../ui/teaching-canon';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'En vivo',
  completed: 'Finalizada',
};

const CALLING_LABELS: Record<CallingType, string> = {
  sunday_school: 'Escuela Dominical',
  seminary: 'Seminario',
  quorum: 'Quórum',
  relief_society: 'Sociedad de Socorro',
  primary: 'Primaria',
  other: 'Otro',
};

const CALLING_OPTIONS: { value: CallingType | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'sunday_school', label: 'Escuela Dominical' },
  { value: 'seminary', label: 'Seminario' },
  { value: 'quorum', label: 'Quórum' },
  { value: 'relief_society', label: 'Sociedad de Socorro' },
  { value: 'primary', label: 'Primaria' },
  { value: 'other', label: 'Otro' },
];

const BishopTeachingDashboard: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { membership } = useWardStore();
  const [sessions, setSessions] = useState<TeachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callingFilter, setCallingFilter] = useState<CallingType | ''>('');

  const wardId = membership?.wardId;

  useEffect(() => {
    if (!wardId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    listSessionsForWard(wardId, {
      limit: 50,
      daysBack: 30,
      callingType: callingFilter || undefined,
    })
      .then((list) => {
        if (!cancelled) setSessions(list);
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error)?.message ?? 'Error al cargar sesiones');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [wardId, callingFilter]);

  if (!wardId) {
    return (
      <PageShell variant="gradient">
        <TeachingCanonShell>
          <TeachingCanonHeroHeader
            categoryLabel={t('leadership.canon.bishopEyebrow')}
            title={t('leadership.canon.bishopPageTitle')}
            subtitle={t('leadership.canon.bishopSubtitle')}
            heroNote={t('leadership.canon.bishopHeroNote')}
          />
          <EmptyState
            title="Sin barrio"
            description="Conéctate a un barrio para ver las clases."
          />
        </TeachingCanonShell>
      </PageShell>
    );
  }

  const activeCount = sessions.filter((s) => s.status === 'active').length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;

  return (
    <PageShell variant="gradient">
      <TeachingCanonShell>
        <TeachingCanonHeroHeader
          categoryLabel={t('leadership.canon.bishopEyebrow')}
          title={t('leadership.canon.bishopPageTitle')}
          subtitle={t('leadership.canon.bishopSubtitle')}
          heroNote={t('leadership.canon.bishopHeroNote')}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <Button variant="secondary" fullWidth onClick={() => navigate('/bishop/teaching/analytics')}>
          📊 Ver métricas e insights
        </Button>
        <Card variant="default" padding="lg">
          <SectionTitle>Resumen (últimos 30 días)</SectionTitle>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>Total sesiones</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{sessions.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>En vivo</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--am-color-success, #22c55e)' }}>{activeCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--am-color-text-muted)' }}>Finalizadas</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{completedCount}</div>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Filtrar por tipo:</label>
          <select
            value={callingFilter}
            onChange={(e) => setCallingFilter(e.target.value as CallingType | '')}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--am-color-border, #e2e8f0)',
              fontSize: 14,
            }}
          >
            {CALLING_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--am-color-text-muted)' }}>
            Cargando sesiones...
          </p>
        )}
        {error && (
          <p style={{ color: 'var(--am-color-error, #dc2626)', fontSize: 14 }}>{error}</p>
        )}
        {!loading && !error && sessions.length === 0 && (
          <EmptyState
            title="Sin sesiones"
            description="No hay sesiones en los últimos 30 días."
          />
        )}
        {!loading && sessions.length > 0 && (
          <>
            <SectionTitle>Sesiones recientes</SectionTitle>
            {sessions.map((s) => (
              <Card key={s.id} variant="default" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
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
                    <div style={{ marginTop: 4, fontSize: 13, color: 'var(--am-color-text-muted)' }}>
                      {CALLING_LABELS[s.callingType] ?? s.callingType}
                      {s.teacherDisplayName && ` · ${s.teacherDisplayName}`}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--am-color-text-muted)' }}>
                      {new Date(s.updatedAt).toLocaleDateString('es')}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/bishop/teaching/${s.id}/report`)}
                    >
                      Ver reporte
                    </Button>
                  </div>
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

export default BishopTeachingDashboard;
