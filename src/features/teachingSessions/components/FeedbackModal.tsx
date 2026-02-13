/**
 * Feedback Modal - Post-clase
 *
 * Modal para que el participante envíe rating 1-5 + comentario opcional.
 * Fase 8.
 */

import React, { useState } from 'react';
import { Button } from '../../../ui';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => Promise<void>;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) return;
    setSubmitting(true);
    try {
      await onSubmit(rating, comment.trim() || undefined);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('submitFeedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--am-color-bg, #fff)',
          borderRadius: 12,
          padding: 24,
          maxWidth: 360,
          width: '100%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>
            Gracias, feedback enviado ✓
          </p>
        ) : (
          <>
            <h2 id="feedback-modal-title" style={{ margin: '0 0 16px 0', fontSize: 18 }}>
              ¿Qué tan útil fue esta clase?
            </h2>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: rating >= n ? '2px solid var(--am-color-primary, #3b82f6)' : '1px solid #e2e8f0',
                    background: rating >= n ? 'var(--am-color-primary-bg, #eff6ff)' : 'transparent',
                    fontSize: 18,
                    cursor: 'pointer',
                  }}
                  aria-label={`${n} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>

            <label htmlFor="feedback-comment" style={{ display: 'block', fontSize: 14, marginBottom: 8 }}>
              Comentario (opcional)
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Algo que quieras compartir?"
              rows={3}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--am-color-border, #e2e8f0)',
                fontSize: 14,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={rating < 1 || submitting}
                loading={submitting}
              >
                Enviar
              </Button>
              <Button variant="ghost" onClick={onClose} disabled={submitting}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
