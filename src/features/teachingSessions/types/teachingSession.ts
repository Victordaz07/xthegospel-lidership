/**
 * Teaching Session Types
 *
 * Contrato único para sesiones de clase en vivo.
 * A prueba de auditoría y miembros creativos.
 */

// ============================================================================
// ENUMS / LITERALS
// ============================================================================

export type CallingType =
  | 'sunday_school'
  | 'seminary'
  | 'quorum'
  | 'relief_society'
  | 'primary'
  | 'other';

export type SessionStatus = 'draft' | 'active' | 'completed';

// ============================================================================
// PART
// ============================================================================

export interface TeachingSessionPart {
  id: string;
  title: string;
  order: number;
  estimatedMinutes?: number;
}

// ============================================================================
// SESSION (Firestore document)
// ============================================================================

export interface TeachingSession {
  id: string;
  title: string;
  description?: string;
  callingType: CallingType;
  teacherUid: string;
  teacherDisplayName?: string;
  status: SessionStatus;
  parts: TeachingSessionPart[];
  currentPartId: string | null;
  joinCode: string | null;
  scheduledAt?: number; // timestamp ms
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// CREATE / UPDATE PAYLOADS
// ============================================================================

export interface CreateDraftSessionPayload {
  title: string;
  callingType: CallingType;
  description?: string;
  parts: TeachingSessionPart[];
  scheduledAt?: number;
}

export interface UpdateSessionPayload {
  title?: string;
  description?: string;
  callingType?: CallingType;
  parts?: TeachingSessionPart[];
  scheduledAt?: number;
}

// ============================================================================
// PARTICIPANT (subcollection document)
// ============================================================================

export type ParticipantPresence = 'present' | 'away';

export interface ParticipantProgress {
  completedPartIds: string[];
}

export interface SessionParticipant {
  uid: string;
  xtgId?: string;
  displayName: string;
  registeredAt: number;
  lastSeenAt?: number;
  presence?: ParticipantPresence;
  progress?: ParticipantProgress;
}

// ============================================================================
// FEEDBACK (Fase 8 - subcollection)
// ============================================================================

export interface SessionFeedback {
  uid: string;
  rating: number; // 1..5
  comment?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface FeedbackSummary {
  count: number;
  avgRating: number;
  comments: string[];
}
