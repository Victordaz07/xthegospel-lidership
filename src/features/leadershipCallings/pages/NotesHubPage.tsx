/**
 * Notes Hub Page
 *
 * Aggregates all leadership notes across callings and members.
 * Filters and "View context" links.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeadershipNotesStore, useCallingsStore } from '../state';
import { NoteType, NOTE_TYPE_LABELS, NoteScope } from '../types';
import { EmptyState } from '../../../ui/components';

// Mock members data
const MOCK_MEMBERS: Record<string, { name: string }> = {
  'member-1': { name: 'María García' },
  'member-2': { name: 'Juan Pérez' },
  'member-3': { name: 'Ana López' },
  'member-4': { name: 'Pedro Martínez' },
  'member-5': { name: 'Roberto Sánchez' },
};

const NotesHubPage: React.FC = () => {
  const navigate = useNavigate();
  const notes = useLeadershipNotesStore(s => s.getAllNotes());
  const callings = useCallingsStore(s => s.callings);

  const [filterScope, setFilterScope] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getContextInfo = (scope: NoteScope, scopeId: string) => {
    if (scope === 'calling') {
      const calling = callings.find(c => c.id === scopeId);
      if (calling) {
        return {
          label: `${calling.memberName} • ${calling.position}`,
          link: `/callings/${scopeId}`,
        };
      }
    } else if (scope === 'member') {
      const member = MOCK_MEMBERS[scopeId];
      if (member) {
        return {
          label: member.name,
          link: `/members/${scopeId}`,
        };
      }
    }
    return null;
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (filterScope !== 'all' && n.scope !== filterScope) return false;
      if (filterType !== 'all' && n.type !== filterType) return false;
      if (
        searchQuery &&
        !n.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [notes, filterScope, filterType, searchQuery]);

  return (
    <div className="leadership-page">
      <header className="leadership-header">
        <button
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Volver
        </button>
        <h1>Notas</h1>
      </header>

      <main className="leadership-content">
        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery((e.target as any).value)}
            placeholder="🔍 Buscar en notas..."
          />
        </div>

        {/* Filters */}
        <div className="filters-row">
          <select
            value={filterScope}
            onChange={e => setFilterScope((e.target as any).value)}
          >
            <option value="all">Todos los contextos</option>
            <option value="calling">Llamamientos</option>
            <option value="member">Miembros</option>
          </select>

          <select
            value={filterType}
            onChange={e => setFilterType((e.target as any).value)}
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(NOTE_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes List */}
        <div className="notes-hub-list">
          {filteredNotes.length === 0 ? (
            <EmptyState
              title="No hay notas"
              description="No hay notas que coincidan con los filtros. Prueba cambiando contexto o tipo."
            />
          ) : (
            filteredNotes.map(note => {
              const context = getContextInfo(note.scope, note.scopeId);

              return (
                <div key={note.id} className="note-hub-card">
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
                    {context && (
                      <button
                        className="context-link"
                        onClick={() => navigate(context.link)}
                      >
                        Ver contexto: {context.label} →
                      </button>
                    )}
                    <span className="privacy-badge">🔒 Privada</span>
                    {note.isDictated && (
                      <span className="dictated-badge">🎙️</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default NotesHubPage;
