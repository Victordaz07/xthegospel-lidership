/**
 * Calling Detail - Responsibilities Tab
 *
 * Lists responsibilities for this calling.
 * Status: pending → in_progress → done
 * NO counters, NO percentages.
 */

import React, { useState, useMemo } from 'react';
import { useResponsibilitiesStore } from '../../state';
import {
  ResponsibilityStatus,
  RESPONSIBILITY_STATUS_LABELS,
  RESPONSIBILITY_PRIORITY_LABELS,
  ResponsibilityPriority,
} from '../../types';
import { EmptyState } from '../../../../ui/components';

interface Props {
  callingId: string;
}

const STATUS_ICONS: Record<ResponsibilityStatus, string> = {
  pending: '○',
  in_progress: '◐',
  done: '●',
};

const CallingDetailResponsibilitiesTab: React.FC<Props> = ({ callingId }) => {
  // Use direct selector instead of calling a method to avoid infinite loops
  const allResponsibilities = useResponsibilitiesStore(s => s.responsibilities);
  const responsibilities = useMemo(
    () => allResponsibilities.filter(r => r.callingId === callingId),
    [allResponsibilities, callingId],
  );
  const addResponsibility = useResponsibilitiesStore(s => s.addResponsibility);
  const updateStatus = useResponsibilitiesStore(s => s.updateStatus);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ResponsibilityPriority>('medium');
  const [suggestedDate, setSuggestedDate] = useState('');

  const handleStatusChange = (
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

  const handleAddResponsibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addResponsibility({
        callingId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        suggestedDate: suggestedDate || undefined,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setSuggestedDate('');
      setShowForm(false);
    }
  };

  return (
    <div className="responsibilities-tab">
      <div className="tab-header">
        <h3>Responsabilidades</h3>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '➕'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form className="add-form" onSubmit={handleAddResponsibility}>
          <div className="form-group">
            <input
              type="text"
              value={title}
              onChange={e => setTitle((e.target as any).value)}
              placeholder="Título de la responsabilidad"
              required
            />
          </div>
          <div className="form-group">
            <textarea
              value={description}
              onChange={e => setDescription((e.target as any).value)}
              placeholder="Descripción (opcional)"
              rows={2}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Prioridad</label>
              <select
                value={priority}
                onChange={e =>
                  setPriority((e.target as any).value as ResponsibilityPriority)
                }
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fecha sugerida</label>
              <input
                type="date"
                value={suggestedDate}
                onChange={e => setSuggestedDate((e.target as any).value)}
              />
            </div>
          </div>
          <button type="submit" className="action-button primary">
            Añadir
          </button>
        </form>
      )}

      {/* Responsibilities List */}
      <div className="responsibilities-list">
        {responsibilities.length === 0 ? (
          <EmptyState
            size="sm"
            title="No hay responsabilidades aún"
            description="Puedes agregar una en el formulario de arriba."
          />
        ) : (
          responsibilities.map(resp => (
            <div
              key={resp.id}
              className={`responsibility-card status-${resp.status}`}
              onClick={() => handleStatusChange(resp.id, resp.status)}
            >
              <div className="responsibility-header">
                <span className="status-icon">{STATUS_ICONS[resp.status]}</span>
                <span className="responsibility-title">{resp.title}</span>
              </div>
              {resp.description && (
                <p className="responsibility-description">{resp.description}</p>
              )}
              <div className="responsibility-meta">
                {resp.suggestedDate && (
                  <span className="meta-item">
                    📅 {new Date(resp.suggestedDate).toLocaleDateString()}
                  </span>
                )}
                <span className="meta-item">
                  📊 {RESPONSIBILITY_PRIORITY_LABELS[resp.priority]}
                </span>
                {resp.notes && (
                  <span className="meta-item">💬 {resp.notes}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="tab-hint">
        Toca una responsabilidad para cambiar su estado.
      </p>
    </div>
  );
};

export default CallingDetailResponsibilitiesTab;
