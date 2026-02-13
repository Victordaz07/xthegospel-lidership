/**
 * Session Report Service - Firestore
 *
 * Genera reporte final de sesión: asistencia, progreso por parte, participantes.
 * Fase 4: Reporte + Cierre + Export PDF.
 */

import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '../../../services/firebase/firebaseApp';
import type { TeachingSession, TeachingSessionPart, SessionParticipant } from '../types';

const getDb = () => getFirebaseDb();

// ============================================================================
// TYPES
// ============================================================================

export type SessionReport = {
  sessionId: string;
  title: string;
  callingType: string;
  teacherDisplayName?: string;
  createdAt: number;
  attendance: number;
  parts: { id: string; title: string; completed: number; total: number }[];
  participants: { uid: string; displayName: string; completedPartsCount: number }[];
  avgCompletionPct: number;
  feedback: {
    count: number;
    avgRating: number;
    comments: string[];
  };
};

// ============================================================================
// BUILD SESSION REPORT
// ============================================================================

export async function buildSessionReport(
  wardId: string,
  sessionId: string
): Promise<SessionReport> {
  const sessionRef = doc(getDb(), 'wards', wardId, 'teachingSessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    throw new Error('session_not_found');
  }

  const sessionData = sessionSnap.data() as Record<string, unknown>;
  const session: TeachingSession = {
    id: sessionId,
    title: String(sessionData.title ?? ''),
    description: sessionData.description ? String(sessionData.description) : undefined,
    callingType: (sessionData.callingType as TeachingSession['callingType']) ?? 'other',
    teacherUid: String(sessionData.teacherUid ?? ''),
    teacherDisplayName: sessionData.teacherDisplayName ? String(sessionData.teacherDisplayName) : undefined,
    status: (sessionData.status as TeachingSession['status']) ?? 'draft',
    parts: Array.isArray(sessionData.parts) ? (sessionData.parts as TeachingSessionPart[]) : [],
    currentPartId: sessionData.currentPartId != null ? String(sessionData.currentPartId) : null,
    joinCode: sessionData.joinCode != null ? String(sessionData.joinCode) : null,
    scheduledAt: typeof sessionData.scheduledAt === 'number' ? sessionData.scheduledAt : undefined,
    createdAt: Number(sessionData.createdAt ?? 0),
    updatedAt: Number(sessionData.updatedAt ?? 0),
  };

  const participantsRef = collection(getDb(), 'wards', wardId, 'teachingSessions', sessionId, 'participants');
  const participantsSnap = await getDocs(participantsRef);

  const participants: SessionParticipant[] = participantsSnap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      uid: d.id,
      xtgId: data.xtgId ? String(data.xtgId) : undefined,
      displayName: String(data.displayName ?? ''),
      registeredAt: Number(data.registeredAt ?? 0),
      lastSeenAt: data.lastSeenAt != null ? Number(data.lastSeenAt) : undefined,
      presence: (data.presence as SessionParticipant['presence']) ?? 'present',
      progress: (data.progress as SessionParticipant['progress']) ?? { completedPartIds: [] },
    };
  });

  const total = participants.length;

  const partsStats = session.parts.map((part) => {
    const completed = total === 0
      ? 0
      : participants.filter((p) => (p.progress?.completedPartIds ?? []).includes(part.id)).length;
    return {
      id: part.id,
      title: part.title,
      completed,
      total,
    };
  });

  const avgCompletionPct =
    partsStats.length === 0
      ? 0
      : Math.round(
          (partsStats.reduce((acc, p) => acc + (p.completed / Math.max(p.total, 1)), 0) / partsStats.length) * 100
        );

  const participantsWithCount = participants.map((p) => ({
    uid: p.uid,
    displayName: p.displayName,
    completedPartsCount: (p.progress?.completedPartIds ?? []).length,
  }));

  participantsWithCount.sort((a, b) => b.completedPartsCount - a.completedPartsCount);

  const feedbackRef = collection(getDb(), 'wards', wardId, 'teachingSessions', sessionId, 'feedback');
  const feedbackSnap = await getDocs(feedbackRef);
  const feedbackDocs = feedbackSnap.docs.map((d) => d.data() as { rating?: number; comment?: string });
  const feedbackCount = feedbackDocs.length;
  const feedbackAvgRating =
    feedbackCount === 0
      ? 0
      : Math.round((feedbackDocs.reduce((acc, d) => acc + (Number(d.rating) || 0), 0) / feedbackCount) * 10) / 10;
  const feedbackComments = feedbackDocs
    .map((d) => (d.comment && String(d.comment).trim()) || '')
    .filter(Boolean)
    .slice(-5)
    .reverse();

  return {
    sessionId,
    title: session.title,
    callingType: session.callingType,
    teacherDisplayName: session.teacherDisplayName,
    createdAt: session.createdAt,
    attendance: total,
    parts: partsStats,
    participants: participantsWithCount,
    avgCompletionPct,
    feedback: {
      count: feedbackCount,
      avgRating: feedbackAvgRating,
      comments: feedbackComments,
    },
  };
}
