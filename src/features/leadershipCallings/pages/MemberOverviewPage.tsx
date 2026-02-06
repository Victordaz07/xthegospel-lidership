/**
 * Member Overview Page
 *
 * Shows member's callings (current and past) + leader notes.
 * NO surveillance, NO activity metrics.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCallingsStore, useLeadershipNotesStore } from '../state';
import {
  STATUS_LABELS,
  ORGANIZATION_LABELS,
  NOTE_TYPE_LABELS,
  NoteType,
} from '../types';
import { PageShell, Card, SectionTitle, Button } from '../../../ui';

// Mock members data
const MOCK_MEMBERS: Record<string, { name: string; since: string }> = {
  'member-1': { name: 'María García', since: '2018' },
  'member-2': { name: 'Juan Pérez', since: '2020' },
  'member-3': { name: 'Ana López', since: '2019' },
  'member-4': { name: 'Pedro Martínez', since: '2016' },
  'member-5': { name: 'Roberto Sánchez', since: '2021' },
};

const MemberOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fix: Use raw arrays and filter with useMemo to avoid infinite re-renders
  const allCallings = useCallingsStore(s => s.callings);
  const allNotes = useLeadershipNotesStore(s => s.notes);
  const addNote = useLeadershipNotesStore(s => s.addNote);

  const callings = useMemo(
    () => allCallings.filter(c => c.memberId === id),
    [allCallings, id],
  );

  const notes = useMemo(
    () => allNotes.filter(n => n.scope === 'member' && n.scopeId === id),
    [allNotes, id],
  );

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('followup');

  const member = id ? MOCK_MEMBERS[id] : undefined;

  if (!member) {
    return (
      <PageShell
        title="Miembro no encontrado"
        onBack={() => navigate(-1)}
        variant="gradient"
      >
        <Card variant="default" padding="md">
          <p
            style={{
              textAlign: 'center',
              color: 'var(--am-color-text-muted, #64748b)',
            }}
          >
            El miembro solicitado no existe.
          </p>
        </Card>
      </PageShell>
    );
  }

  const currentCallings = callings.filter(c => c.status !== 'released');
  const pastCallings = callings.filter(c => c.status === 'released');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteContent.trim() && id) {
      addNote({
        scope: 'member',
        scopeId: id,
        type: noteType,
        content: noteContent.trim(),
      });
      setNoteContent('');
      setShowNoteForm(false);
    }
  };

  return (
    <PageShell
      title={member.name}
      onBack={() => navigate('/members')}
      variant="gradient"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Member Header */}
        <Card variant="default" padding="lg">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                margin: '0 0 4px 0',
                color: 'var(--am-color-text-main, #0f172a)',
              }}
            >
              {member.name}
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--am-color-text-muted, #64748b)',
                margin: 0,
              }}
            >
              Miembro desde {member.since}
            </p>
          </div>
        </Card>

        {/* Current Callings */}
        <div>
          <SectionTitle>Llamamientos actuales</SectionTitle>
          {currentCallings.length === 0 ? (
            <Card variant="default" padding="md">
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--am-color-text-muted, #64748b)',
                  margin: 0,
                }}
              >
                Sin llamamientos activos.
              </p>
            </Card>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {currentCallings.map(calling => (
                <Card
                  key={calling.id}
                  variant="default"
                  padding="md"
                  onClick={() =>
                    navigate(`/callings/${calling.id}`)
                  }
                  className="calling-mini-card-clickable"
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--am-color-text-main, #0f172a)',
                          marginBottom: '4px',
                        }}
                      >
                        {calling.position}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--am-color-text-muted, #64748b)',
                        }}
                      >
                        {ORGANIZATION_LABELS[calling.organization]}
                      </div>
                    </div>
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
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Service History */}
        <div>
          <SectionTitle>Historial de servicio</SectionTitle>
          {pastCallings.length === 0 ? (
            <Card variant="default" padding="md">
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--am-color-text-muted, #64748b)',
                  margin: 0,
                }}
              >
                Sin llamamientos anteriores registrados.
              </p>
            </Card>
          ) : (
            <Card variant="default" padding="md">
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {pastCallings.map(calling => (
                  <li
                    key={calling.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                    }}
                  >
                    <span
                      style={{ color: 'var(--am-color-text-main, #0f172a)' }}
                    >
                      {calling.position}
                    </span>
                    <span
                      style={{ color: 'var(--am-color-text-muted, #64748b)' }}
                    >
                      {calling.timeline.proposedAt &&
                        new Date(calling.timeline.proposedAt).getFullYear()}
                      {' - '}
                      {calling.timeline.releasedAt &&
                        new Date(calling.timeline.releasedAt).getFullYear()}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Leader Notes */}
        <div>
          <SectionTitle
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNoteForm(!showNoteForm)}
              >
                {showNoteForm ? '✕' : '➕'}
              </Button>
            }
          >
            Notas del líder
          </SectionTitle>

          {showNoteForm && (
            <div style={{ marginBottom: '16px' }}>
              <Card variant="default" padding="md">
                <form
                  onSubmit={handleAddNote}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <textarea
                    value={noteContent}
                    onChange={e => setNoteContent((e.target as any).value)}
                    placeholder="Añadir nota..."
                    rows={3}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--am-radius-sm, 10px)',
                      border: '1px solid var(--am-color-border, #e2e8f0)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  <select
                    value={noteType}
                    onChange={e =>
                      setNoteType((e.target as any).value as NoteType)
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--am-radius-sm, 10px)',
                      border: '1px solid var(--am-color-border, #e2e8f0)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: 'white',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="followup">
                      {NOTE_TYPE_LABELS.followup}
                    </option>
                    <option value="administrative">
                      {NOTE_TYPE_LABELS.administrative}
                    </option>
                    <option value="pastoral">
                      {NOTE_TYPE_LABELS.pastoral}
                    </option>
                  </select>
                  <Button type="submit" variant="primary" fullWidth>
                    Guardar nota
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {notes.length === 0 ? (
            <Card variant="default" padding="md">
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--am-color-text-muted, #64748b)',
                  margin: 0,
                }}
              >
                Sin notas registradas.
              </p>
            </Card>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {notes.map(note => (
                <Card key={note.id} variant="default" padding="md">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '12px',
                      color: 'var(--am-color-text-muted, #64748b)',
                    }}
                  >
                    <span>
                      📅 {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <span>🏷️ {NOTE_TYPE_LABELS[note.type]}</span>
                  </div>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--am-color-text-main, #0f172a)',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {note.content}
                  </p>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--am-color-text-muted, #64748b)',
                    }}
                  >
                    🔒 Solo visible para ti
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default MemberOverviewPage;
