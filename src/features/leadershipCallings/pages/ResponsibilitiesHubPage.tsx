/**
 * Responsibilities Hub Page
 *
 * Aggregates all responsibilities across callings.
 * Filters and status toggles. NO counters.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsibilitiesStore, useCallingsStore } from '../state';
import {
  ResponsibilityStatus,
  RESPONSIBILITY_STATUS_LABELS,
  ORGANIZATION_LABELS,
  OrganizationType,
} from '../types';
import { EmptyState } from '../../../ui/components';

const STATUS_ICONS: Record<ResponsibilityStatus, string> = {
  pending: '○',
  in_progress: '◐',
  done: '●',
};

const ResponsibilitiesHubPage: React.FC = () => {
  const navigate = useNavigate();
  const responsibilities = useResponsibilitiesStore(s => s.responsibilities);
  const updateStatus = useResponsibilitiesStore(s => s.updateStatus);
  const callings = useCallingsStore(s => s.callings);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOrg, setFilterOrg] = useState<string>('all');

  // Get calling info for each responsibility
  const getCallingInfo = (callingId: string) => {
    return callings.find(c => c.id === callingId);
  };

  const filteredResponsibilities = useMemo(() => {
    return responsibilities.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;

      if (filterOrg !== 'all') {
        const calling = getCallingInfo(r.callingId);
        if (!calling || calling.organization !== filterOrg) return false;
      }

      return true;
    });
  }, [responsibilities, filterStatus, filterOrg, callings]);

  const handleStatusToggle = (
    id: string,
    currentStatus: ResponsibilityStatus,
  ) => {
    const nextStatus: ResponsibilityStatus =
      currentStatus === 'pending'
        ? 'in_progress'
        : currentStatus === 'in_progress'
          ? 'done'
          : 'pending';
    updateStatus(id, nextStatus);
  };

  return (
    <div className="leadership-page">
      <header className="leadership-header">
        <button
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Volver
        </button>
        <h1>Responsabilidades</h1>
      </header>

      <main className="leadership-content">
        {/* Filters */}
        <div className="filters-row">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus((e.target as any).value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En progreso</option>
            <option value="done">Completados</option>
          </select>

          <select
            value={filterOrg}
            onChange={e => setFilterOrg((e.target as any).value)}
          >
            <option value="all">Todas las organizaciones</option>
            {Object.entries(ORGANIZATION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Responsibilities List */}
        <div className="responsibilities-hub-list">
          {filteredResponsibilities.length === 0 ? (
            <EmptyState
              title="No hay responsabilidades"
              description="No hay responsabilidades que coincidan con los filtros. Prueba cambiando estado u organización."
            />
          ) : (
            filteredResponsibilities.map(resp => {
              const calling = getCallingInfo(resp.callingId);

              return (
                <div
                  key={resp.id}
                  className={`responsibility-hub-card status-${resp.status}`}
                  onClick={() => handleStatusToggle(resp.id, resp.status)}
                >
                  <div className="resp-header">
                    <span className="status-icon">
                      {STATUS_ICONS[resp.status]}
                    </span>
                    <span className="resp-title">{resp.title}</span>
                  </div>

                  {calling && (
                    <div className="resp-context">
                      <span
                        className="context-link"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/callings/${calling.id}`);
                        }}
                      >
                        👤 {calling.memberName} • {calling.position}
                      </span>
                    </div>
                  )}

                  {resp.description && (
                    <p className="resp-description">{resp.description}</p>
                  )}

                  <div className="resp-meta">
                    {resp.suggestedDate && (
                      <span className="meta-item">
                        📅 {new Date(resp.suggestedDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`status-label status-${resp.status}`}>
                      {RESPONSIBILITY_STATUS_LABELS[resp.status]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="page-hint">
          Toca una responsabilidad para cambiar su estado.
        </p>
      </main>
    </div>
  );
};

export default ResponsibilitiesHubPage;
