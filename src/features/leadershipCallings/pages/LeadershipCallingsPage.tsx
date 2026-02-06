/**
 * Leadership Callings List Page
 *
 * Shows all callings with filters by organization and status.
 * Clean, non-judgmental UI.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallingsStore } from '../state';
import {
  CallingStatus,
  OrganizationType,
  STATUS_LABELS,
  ORGANIZATION_LABELS,
} from '../types';
import { PageShell, Card, Button, EmptyState } from '../../../ui';
import './LeadershipPages.css';

const LeadershipCallingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callings = useCallingsStore(s => s.callings);

  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get('status') || 'all',
  );

  const filteredCallings = useMemo(() => {
    return callings.filter(c => {
      if (selectedOrg !== 'all' && c.organization !== selectedOrg) return false;
      if (selectedStatus === 'all') return true;
      if (selectedStatus === 'active')
        return c.status === 'active' || c.status === 'set_apart';
      if (selectedStatus === 'training')
        return c.status === 'sustained' || c.status === 'called';
      return c.status === selectedStatus;
    });
  }, [callings, selectedOrg, selectedStatus]);

  const organizations: (OrganizationType | 'all')[] = [
    'all',
    'bishopric',
    'elders_quorum',
    'relief_society',
    'young_women',
    'young_men',
    'primary',
    'sunday_school',
    'ward_mission',
    'other',
  ];

  return (
    <PageShell
      title="Llamamientos"
      onBack={() => navigate('/home')}
      variant="gradient"
      headerActions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/callings/new')}
        >
          ➕ Nuevo
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Organization Filter */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
          }}
        >
          {organizations.map(org => (
            <Button
              key={org}
              variant={selectedOrg === org ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedOrg(org)}
            >
              {org === 'all'
                ? 'Todos'
                : ORGANIZATION_LABELS[org as OrganizationType]}
            </Button>
          ))}
        </div>

        {/* Status Filter */}
        <Card variant="default" padding="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                fontSize: '14px',
                color: 'var(--am-color-text-main, #0f172a)',
              }}
            >
              Estado:
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus((e.target as any).value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--am-radius-sm, 10px)',
                border: '1px solid var(--am-color-border, #e2e8f0)',
                fontSize: '14px',
                background: 'white',
              }}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="training">En capacitación</option>
              <option value="proposed">Propuestos</option>
              <option value="released">Relevados</option>
            </select>
          </div>
        </Card>

        {/* Callings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCallings.length === 0 ? (
            <EmptyState
              title="No hay llamamientos"
              description="No hay llamamientos que coincidan con los filtros. Prueba otro estado u organización."
            />
          ) : (
            filteredCallings.map(calling => (
              <Card
                key={calling.id}
                variant="default"
                padding="md"
                onClick={() =>
                  navigate(`/callings/${calling.id}`)
                }
                className="calling-card-clickable"
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
                <div style={{ marginBottom: '8px' }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--am-color-text-main, #0f172a)',
                      margin: '0 0 4px 0',
                    }}
                  >
                    {calling.position}
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--am-color-text-muted, #64748b)',
                      margin: 0,
                    }}
                  >
                    {ORGANIZATION_LABELS[calling.organization]}
                  </p>
                </div>
                {calling.timeline.proposedAt && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--am-color-text-muted, #64748b)',
                    }}
                  >
                    Desde:{' '}
                    {new Date(calling.timeline.proposedAt).toLocaleDateString()}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default LeadershipCallingsPage;
