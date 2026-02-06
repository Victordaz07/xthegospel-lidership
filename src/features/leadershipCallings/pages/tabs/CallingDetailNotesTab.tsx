/**
 * Calling Detail - Notes Tab
 *
 * Private notes for this calling.
 * Includes voice dictation UI placeholder.
 * All notes are private to the leader.
 */

import React, { useState, useMemo } from 'react';
import { useLeadershipNotesStore } from '../../state';
import { NoteType, NOTE_TYPE_LABELS } from '../../types';
import { EmptyState } from '../../../../ui/components';

interface Props {
  callingId: string;
}

const CallingDetailNotesTab: React.FC<Props> = ({ callingId }) => {
  // Use direct selector instead of calling a method to avoid infinite loops
  const allNotes = useLeadershipNotesStore(s => s.notes);
  const notes = useMemo(
    () =>
      allNotes.filter(n => n.scope === 'calling' && n.scopeId === callingId),
    [allNotes, callingId],
  );
  const addNote = useLeadershipNotesStore(s => s.addNote);

  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('followup');
  const [isRecording, setIsRecording] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      addNote({
        scope: 'calling',
        scopeId: callingId,
        type: noteType,
        content: content.trim(),
        isDictated: false,
      });
      setContent('');
    }
  };

  const handleDictation = () => {
    // Placeholder for voice dictation
    // In a real implementation, this would use Web Speech API
    setIsRecording(!isRecording);
    if (isRecording) {
      // Simulate dictation end
      setContent(prev => prev + ' [Dictado simulado]');
    }
  };

  return (
    <div className="notes-tab">
      {/* Add Note Form */}
      <form className="note-form" onSubmit={handleAddNote}>
        <div className="form-group">
          <textarea
            value={content}
            onChange={e => setContent((e.target as any).value)}
            placeholder="Escribe una nota..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <button
            type="button"
            className={`dictation-button ${isRecording ? 'recording' : ''}`}
            onClick={handleDictation}
          >
            🎤 {isRecording ? 'Detener' : 'Dictar'}
          </button>

          <select
            value={noteType}
            onChange={e => setNoteType((e.target as any).value as NoteType)}
          >
            <option value="followup">{NOTE_TYPE_LABELS.followup}</option>
            <option value="administrative">
              {NOTE_TYPE_LABELS.administrative}
            </option>
            <option value="pastoral">{NOTE_TYPE_LABELS.pastoral}</option>
          </select>
        </div>

        <div className="privacy-notice">
          🔒 Esta nota es privada y solo tú puedes verla.
        </div>

        <button
          type="submit"
          className="action-button primary"
          disabled={!content.trim()}
        >
          💾 Guardar
        </button>
      </form>

      {/* Notes List */}
      <div className="notes-list">
        <h3>Notas anteriores</h3>

        {notes.length === 0 ? (
          <EmptyState
            size="sm"
            title="No hay notas"
            description="Puedes agregar una en el formulario de arriba."
          />
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <span className="note-date">
                  📅 {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <span className={`note-type type-${note.type}`}>
                  🏷️ {NOTE_TYPE_LABELS[note.type]}
                </span>
              </div>
              <p className="note-content">{note.content}</p>
              <div className="note-footer">
                <span className="privacy-badge">🔒 Privada</span>
                {note.isDictated && (
                  <span className="dictated-badge">🎙️ Dictada</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CallingDetailNotesTab;
