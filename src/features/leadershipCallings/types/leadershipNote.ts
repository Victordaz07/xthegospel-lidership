/**
 * Leadership Note Types
 * 
 * Notes are PRIVATE to the leader. They are never shared or synced
 * without explicit consent. Three types:
 * - Follow-up: General follow-up notes
 * - Administrative: Organizational/logistical notes
 * - Pastoral: Sensitive pastoral care notes (extra privacy)
 */

export type NoteType = 'followup' | 'administrative' | 'pastoral';

export type NoteScope = 'calling' | 'member';

export interface LeadershipNote {
  id: string;
  scope: NoteScope;
  scopeId: string;            // callingId or memberId depending on scope
  type: NoteType;
  content: string;
  isDictated: boolean;        // Was this note created via voice dictation?
  createdAt: string;          // ISO date
  updatedAt: string;          // ISO date
}

export interface LeadershipNoteFormData {
  scope: NoteScope;
  scopeId: string;
  type: NoteType;
  content: string;
  isDictated?: boolean;
}

// UI helper for note type display
export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  followup: 'Seguimiento',
  administrative: 'Administrativa',
  pastoral: 'Pastoral',
};

// UI helper for note type descriptions
export const NOTE_TYPE_DESCRIPTIONS: Record<NoteType, string> = {
  followup: 'Notas de seguimiento general',
  administrative: 'Notas organizativas y logísticas',
  pastoral: 'Notas pastorales sensibles (máxima privacidad)',
};
