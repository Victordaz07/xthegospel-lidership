/**
 * Calling Event Types for Leadership Calendar
 * 
 * Events can be linked to callings or be general leadership events.
 * Used for: interviews, trainings, follow-ups, meetings.
 */

export type EventKind = 
  | 'interview'       // Entrevista
  | 'training'        // Capacitación
  | 'followup'        // Seguimiento
  | 'meeting'         // Reunión
  | 'other';          // Otro

export interface CallingEvent {
  id: string;
  title: string;
  description?: string;
  kind: EventKind;
  date: string;               // ISO date (YYYY-MM-DD)
  time?: string;              // Optional time (HH:MM)
  endTime?: string;           // Optional end time
  location?: string;
  callingId?: string;         // Optional link to a calling
  memberId?: string;          // Optional link to a member
  organization?: string;      // For filtering
  createdAt: string;          // ISO date
  updatedAt: string;          // ISO date
}

export interface CallingEventFormData {
  title: string;
  description?: string;
  kind: EventKind;
  date: string;
  time?: string;
  endTime?: string;
  location?: string;
  callingId?: string;
  memberId?: string;
  organization?: string;
}

// UI helper for event kind display
export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  interview: 'Entrevista',
  training: 'Capacitación',
  followup: 'Seguimiento',
  meeting: 'Reunión',
  other: 'Otro',
};

// UI helper for event kind icons (emoji for wireframe)
export const EVENT_KIND_ICONS: Record<EventKind, string> = {
  interview: '👤',
  training: '📚',
  followup: '🔄',
  meeting: '📋',
  other: '📌',
};
