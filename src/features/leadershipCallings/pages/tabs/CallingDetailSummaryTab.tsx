/**
 * Calling Detail - Summary Tab
 * 
 * Shows calling timeline and actions.
 * Calm, non-judgmental language throughout.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calling, CallingStatus, STATUS_LABELS } from '../../types';
import { useCallingsStore } from '../../state';

interface Props {
  calling: Calling;
}

const TIMELINE_STEPS: { status: CallingStatus; label: string }[] = [
  { status: 'proposed', label: 'Propuesto' },
  { status: 'called', label: 'Llamado' },
  { status: 'sustained', label: 'Sostenido' },
  { status: 'set_apart', label: 'Apartado' },
  { status: 'released', label: 'Relevado' },
];

const CallingDetailSummaryTab: React.FC<Props> = ({ calling }) => {
  const navigate = useNavigate();
  const updateCallingStatus = useCallingsStore((s) => s.updateCallingStatus);
  const releaseCalling = useCallingsStore((s) => s.releaseCalling);
  
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseNote, setReleaseNote] = useState('');
  
  const getStepStatus = (step: CallingStatus): 'completed' | 'current' | 'pending' => {
    const stepIndex = TIMELINE_STEPS.findIndex(s => s.status === step);
    const currentIndex = TIMELINE_STEPS.findIndex(s => s.status === calling.status);
    
    if (step === 'released') {
      return calling.status === 'released' ? 'completed' : 'pending';
    }
    
    if (stepIndex < currentIndex || calling.status === step) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };
  
  const getNextAction = (): { label: string; nextStatus: CallingStatus } | null => {
    switch (calling.status) {
      case 'proposed':
        return { label: 'Marcar como Llamado', nextStatus: 'called' };
      case 'called':
        return { label: 'Marcar como Sostenido', nextStatus: 'sustained' };
      case 'sustained':
        return { label: 'Marcar como Apartado', nextStatus: 'set_apart' };
      case 'set_apart':
        return { label: 'Marcar como Activo', nextStatus: 'active' };
      default:
        return null;
    }
  };
  
  const handleNextStep = () => {
    const next = getNextAction();
    if (next) {
      updateCallingStatus(calling.id, next.nextStatus);
    }
  };
  
  const handleRelease = () => {
    if (releaseDate) {
      releaseCalling(calling.id, releaseDate, releaseNote || undefined);
      setShowReleaseModal(false);
      navigate('/callings');
    }
  };
  
  const nextAction = getNextAction();
  
  return (
    <div className="summary-tab">
      {/* Timeline */}
      <section className="timeline-section">
        <h3>Línea de tiempo</h3>
        <div className="timeline">
          {TIMELINE_STEPS.filter(s => s.status !== 'released' || calling.status === 'released').map((step, index) => {
            const status = getStepStatus(step.status);
            const date = calling.timeline[`${step.status}At` as keyof typeof calling.timeline];
            
            return (
              <div key={step.status} className={`timeline-step ${status}`}>
                <div className="timeline-dot" />
                {index < TIMELINE_STEPS.length - 1 && <div className="timeline-line" />}
                <div className="timeline-content">
                  <span className="timeline-label">{step.label}</span>
                  {date && (
                    <span className="timeline-date">
                      {new Date(date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* Info */}
      <section className="info-section">
        <h3>Información</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">📅 Fecha de inicio</span>
            <span className="info-value">
              {calling.timeline.proposedAt 
                ? new Date(calling.timeline.proposedAt).toLocaleDateString()
                : 'No registrada'}
            </span>
          </div>
          {calling.notes && (
            <div className="info-item">
              <span className="info-label">📝 Notas iniciales</span>
              <span className="info-value">{calling.notes}</span>
            </div>
          )}
        </div>
      </section>
      
      {/* Actions */}
      {calling.status !== 'released' && (
        <section className="actions-section">
          <h3>Acciones</h3>
          
          {nextAction && (
            <button className="action-button primary" onClick={handleNextStep}>
              {nextAction.label}
            </button>
          )}
          
          <button 
            className="action-button secondary"
            onClick={() => navigate(`/calendar?callingId=${calling.id}`)}
          >
            📅 Agendar seguimiento
          </button>
          
          <button 
            className="action-button danger"
            onClick={() => setShowReleaseModal(true)}
          >
            🔓 Relevar llamamiento
          </button>
        </section>
      )}
      
      {/* Release Modal */}
      {showReleaseModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔓 Relevar Llamamiento</h3>
            <p>
              Estás por relevar a <strong>{calling.memberName}</strong> de su llamamiento como{' '}
              <strong>{calling.position}</strong>.
            </p>
            
            <div className="form-group">
              <label>📅 Fecha de relevo</label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate((e.target as any).value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>📝 Nota final (opcional)</label>
              <textarea
                value={releaseNote}
                onChange={(e) => setReleaseNote((e.target as any).value)}
                placeholder="Agradecimiento o nota de cierre..."
                rows={3}
              />
            </div>
            
            <p className="modal-note">
              Esta acción marcará el llamamiento como "Relevado".
            </p>
            
            <div className="modal-actions">
              <button className="action-button primary" onClick={handleRelease}>
                Confirmar relevo
              </button>
              <button 
                className="action-button secondary"
                onClick={() => setShowReleaseModal(false)}
              >
                Mejor no
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallingDetailSummaryTab;
