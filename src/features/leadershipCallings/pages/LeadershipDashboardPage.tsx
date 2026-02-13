/**
 * Leadership Dashboard Page
 *
 * Main dashboard for ward/stake leadership.
 * Shows callings summary with SOFT alerts (no urgency).
 * NO KPIs, NO metrics, NO surveillance.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCallingsStore } from '../state';
import { useUserRoleStore } from '../../../state/user/useUserRoleStore';
import { STATUS_LABELS, ORGANIZATION_LABELS } from '../types';
import { PageShell, SectionTitle, Card, Button, EmptyState } from '../../../ui';
import './LeadershipPages.css';

const LeadershipDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const callings = useCallingsStore(s => s.callings);
  const isBishopric = useUserRoleStore((s) => s.isBishopric);

  // Simple counts (not metrics)
  const activeCallings = callings.filter(
    c => c.status === 'active' || c.status === 'set_apart',
  );
  const inTraining = callings.filter(
    c => c.status === 'sustained' || c.status === 'called',
  );
  const pending = callings.filter(c => c.status === 'proposed');

  // Soft reminders (not alerts)
  const callingsWithoutRecentFollowup = activeCallings.slice(0, 2); // Mock for now

  return (
    <PageShell title="Liderazgo" variant="gradient">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-6)',
        }}
      >
        {/* Summary Cards - grid responsive via LeadershipPages.css .dashboard-summary */}
        <div className="dashboard-summary">
          <Card
            variant="default"
            padding="md"
            onClick={() =>
              navigate('/callings?status=active')
            }
            className="summary-card-clickable summary-card"
          >
            <div style={{ textAlign: 'center' }}>
              <span className="summary-value">{activeCallings.length}</span>
              <span className="summary-label">Activos</span>
            </div>
          </Card>
          <Card
            variant="default"
            padding="md"
            onClick={() =>
              navigate('/callings?status=training')
            }
            className="summary-card-clickable summary-card"
          >
            <div style={{ textAlign: 'center' }}>
              <span className="summary-value">{inTraining.length}</span>
              <span className="summary-label">En capacitación</span>
            </div>
          </Card>
          <Card
            variant="default"
            padding="md"
            onClick={() =>
              navigate('/callings?status=proposed')
            }
            className="summary-card-clickable summary-card"
          >
            <div style={{ textAlign: 'center' }}>
              <span className="summary-value">{pending.length}</span>
              <span className="summary-label">Pendientes</span>
            </div>
          </Card>
        </div>

        {/* Soft Reminders */}
        {callingsWithoutRecentFollowup.length > 0 && (
          <Card variant="default" padding="md">
            <SectionTitle>💡 Recordatorios</SectionTitle>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--am-color-text-main, #0f172a)',
                margin: '0 0 8px 0',
              }}
            >
              {callingsWithoutRecentFollowup.length} llamamiento(s) sin
              seguimiento reciente.
            </p>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--am-color-text-muted, #64748b)',
              }}
            >
              No urgente — solo un recordatorio amable.
            </span>
          </Card>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SectionTitle>Acciones rápidas</SectionTitle>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/callings/new')}
          >
            ➕ Nuevo llamamiento
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/callings')}
          >
            📋 Ver todos los llamamientos
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/teaching')}
          >
            📖 Enseñando — preparar clases
          </Button>
          {isBishopric() && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/bishop/teaching')}
            >
              📊 Clases del barrio (obispado)
            </Button>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/members')}
          >
            👥 Ver miembros
          </Button>
        </div>

        {/* Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SectionTitle>Llamamientos recientes</SectionTitle>
          {callings.length === 0 ? (
            <EmptyState
              title="Aún no hay llamamientos"
              description="Puedes crear uno desde Acciones rápidas arriba."
            />
          ) : (
            callings.slice(0, 3).map(calling => (
              <Card
                key={calling.id}
                variant="default"
                padding="md"
                onClick={() =>
                  navigate(`/callings/${calling.id}`)
                }
                className="calling-preview-card-clickable"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--am-color-text-main, #0f172a)',
                    }}
                  >
                    {calling.memberName}
                  </span>
                  <span
                    className={`status-badge status-${calling.status}`}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {STATUS_LABELS[calling.status]}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--am-color-text-muted, #64748b)',
                  }}
                >
                  <span>{calling.position}</span>
                  <span>•</span>
                  <span>{ORGANIZATION_LABELS[calling.organization]}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default LeadershipDashboardPage;
