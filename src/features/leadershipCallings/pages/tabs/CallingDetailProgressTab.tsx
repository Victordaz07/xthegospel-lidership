/**
 * Calling Detail - Progress Tab
 *
 * Shows DESCRIPTIVE observations about the calling.
 * NO metrics, NO scores, NO percentages.
 * Just narrative updates.
 */

import React, { useState, useMemo } from 'react';
import { useObservationsStore } from '../../state';
import { COMMON_MILESTONES } from '../../types';
import { EmptyState } from '../../../../ui/components';

interface Props {
  callingId: string;
}

const CallingDetailProgressTab: React.FC<Props> = ({ callingId }) => {
  // Use direct selector instead of calling a method to avoid infinite loops
  const allObservations = useObservationsStore(s => s.observations);
  const observations = useMemo(
    () => allObservations.filter(o => o.callingId === callingId),
    [allObservations, callingId],
  );
  const addObservation = useObservationsStore(s => s.addObservation);

  const [content, setContent] = useState('');
  const [milestone, setMilestone] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      addObservation({
        callingId,
        content: content.trim(),
        milestone: milestone || undefined,
      });
      setContent('');
      setMilestone('');
      setShowForm(false);
    }
  };

  return (
    <div className="progress-tab">
      <div className="progress-intro">
        <h3>Progreso del llamamiento</h3>
        <p className="intro-text">
          Aquí puedes registrar observaciones sobre cómo va el llamamiento.
          Estas notas son descriptivas, no evaluativas.
        </p>
      </div>

      <div className="tab-header">
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '✍️ Añadir observación'}
        </button>
      </div>

      {/* Add Observation Form */}
      {showForm && (
        <form className="add-form" onSubmit={handleAddObservation}>
          <div className="form-group">
            <textarea
              value={content}
              onChange={e => setContent((e.target as any).value)}
              placeholder="¿Cómo va el llamamiento? Describe lo que observas..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Hito (opcional)</label>
            <select
              value={milestone}
              onChange={e => setMilestone((e.target as any).value)}
            >
              <option value="">Sin hito específico</option>
              {COMMON_MILESTONES.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="action-button primary">
            Guardar observación
          </button>
        </form>
      )}

      {/* Observations Timeline */}
      <div className="observations-timeline">
        {observations.length === 0 ? (
          <EmptyState
            size="sm"
            title="No hay observaciones aún"
            description="Añade observaciones para recordar cómo evoluciona el llamamiento."
          />
        ) : (
          observations.map(obs => (
            <div key={obs.id} className="observation-card">
              <div className="observation-header">
                <span className="observation-date">
                  📅 {new Date(obs.createdAt).toLocaleDateString()}
                </span>
                {obs.milestone && (
                  <span className="observation-milestone">
                    🏁 {obs.milestone}
                  </span>
                )}
              </div>
              <p className="observation-content">{obs.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="progress-disclaimer">
        <p>
          💡 Estas observaciones son para tu referencia personal. No se
          comparten ni se usan para evaluar al miembro.
        </p>
      </div>
    </div>
  );
};

export default CallingDetailProgressTab;
