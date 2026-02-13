/**
 * Session Create Page
 *
 * Crear sesión en draft: título, callingType, partes.
 * Submit → createDraftSession → navigate a /teaching/:id
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useWardStore } from '../../../state/ward/useWardStore';
import { createDraftSession } from '../services/teachingSessionsService';
import type { CallingType, TeachingSessionPart } from '../types';
import { PageShell, Card, Button, SectionTitle } from '../../../ui';

const CALLING_OPTIONS: { value: CallingType; label: string }[] = [
  { value: 'sunday_school', label: 'Escuela Dominical' },
  { value: 'seminary', label: 'Seminario' },
  { value: 'quorum', label: 'Quórum' },
  { value: 'relief_society', label: 'Sociedad de Socorro' },
  { value: 'primary', label: 'Primaria' },
  { value: 'other', label: 'Otro' },
];

function generatePartId(): string {
  return `part_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const SessionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { membership } = useWardStore();
  const [title, setTitle] = useState('');
  const [callingType, setCallingType] = useState<CallingType>('sunday_school');
  const [parts, setParts] = useState<TeachingSessionPart[]>([
    { id: generatePartId(), title: '', order: 0, estimatedMinutes: 10 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wardId = membership?.wardId;

  const addPart = () => {
    setParts((prev) => [
      ...prev,
      {
        id: generatePartId(),
        title: '',
        order: prev.length,
        estimatedMinutes: 10,
      },
    ]);
  };

  const updatePart = (id: string, patch: Partial<TeachingSessionPart>) => {
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const removePart = (id: string) => {
    setParts((prev) => prev.filter((p) => p.id !== id));
  };

  const movePart = (id: string, direction: 'up' | 'down') => {
    setParts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr.map((p, i) => ({ ...p, order: i }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardId || !user?.uid || !title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const orderedParts = parts
        .map((p, i) => ({ ...p, order: i }))
        .filter((p) => p.title.trim());
      const sessionId = await createDraftSession(
        wardId,
        user.uid,
        user.displayName ?? user.email ?? 'Maestro',
        {
          title: title.trim(),
          callingType,
          parts: orderedParts.length ? orderedParts : [{ id: generatePartId(), title: 'Parte 1', order: 0, estimatedMinutes: 10 }],
        }
      );
      navigate(`/teaching/${sessionId}`);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al crear sesión');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--am-radius-sm, 10px)',
    border: '1px solid var(--am-color-border, #e2e8f0)',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: 'white',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--am-color-text-main, #0f172a)',
    marginBottom: '8px',
  };

  if (!wardId) {
    return (
      <PageShell title="Nueva sesión" onBack={() => navigate(-1)} variant="gradient">
        <p style={{ color: 'var(--am-color-text-muted)' }}>Conéctate a un barrio primero.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Nueva sesión" onBack={() => navigate(-1)} variant="gradient">
      <form onSubmit={handleSubmit}>
        <Card variant="default" padding="lg" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label htmlFor="title" style={labelStyle}>Título *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Lección 5 - La fe"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="callingType" style={labelStyle}>Tipo de clase *</label>
              <select
                id="callingType"
                value={callingType}
                onChange={(e) => setCallingType(e.target.value as CallingType)}
                required
                style={inputStyle}
              >
                {CALLING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <SectionTitle>Partes de la clase</SectionTitle>
        <Card variant="default" padding="lg" style={{ marginBottom: 24 }}>
          {parts.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                marginBottom: i < parts.length - 1 ? 12 : 0,
              }}
            >
              <input
                type="text"
                value={p.title}
                onChange={(e) => updatePart(p.id, { title: e.target.value })}
                placeholder={`Parte ${i + 1}`}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="number"
                min={1}
                max={120}
                value={p.estimatedMinutes ?? 10}
                onChange={(e) =>
                  updatePart(p.id, { estimatedMinutes: parseInt(e.target.value, 10) || 10 })
                }
                style={{ ...inputStyle, width: 70 }}
                title="Minutos"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => movePart(p.id, 'up')}
                disabled={i === 0}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => movePart(p.id, 'down')}
                disabled={i === parts.length - 1}
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePart(p.id)}
                disabled={parts.length <= 1}
              >
                ✕
              </Button>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <Button type="button" variant="secondary" onClick={addPart}>
              + Agregar parte
            </Button>
          </div>
        </Card>

        {error && (
          <p style={{ color: 'var(--am-color-error, #dc2626)', marginBottom: 16 }}>{error}</p>
        )}
        <Button type="submit" variant="primary" fullWidth loading={loading}>
          Crear sesión (borrador)
        </Button>
      </form>
    </PageShell>
  );
};

export default SessionCreatePage;
