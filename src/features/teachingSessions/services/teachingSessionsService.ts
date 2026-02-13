/**
 * Teaching Sessions Service - Firestore
 *
 * CRUD + activate + subscribe para sesiones de clase en vivo.
 * Colección: wards/{wardId}/teachingSessions/{sessionId}
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb } from '../../../services/firebase/firebaseApp';
import type {
  TeachingSession,
  TeachingSessionPart,
  CreateDraftSessionPayload,
  UpdateSessionPayload,
  CallingType,
} from '../types';
import { generateJoinCode } from '../utils/joinCode';

const getDb = () => getFirebaseDb();

// ============================================================================
// HELPERS
// ============================================================================

function sessionPath(wardId: string, sessionId: string) {
  return `wards/${wardId}/teachingSessions/${sessionId}`;
}

function mapDocToSession(wardId: string, sessionId: string, data: Record<string, unknown>): TeachingSession {
  return {
    id: sessionId,
    title: String(data.title ?? ''),
    description: data.description ? String(data.description) : undefined,
    callingType: (data.callingType as TeachingSession['callingType']) ?? 'other',
    teacherUid: String(data.teacherUid ?? ''),
    teacherDisplayName: data.teacherDisplayName ? String(data.teacherDisplayName) : undefined,
    status: (data.status as TeachingSession['status']) ?? 'draft',
    parts: Array.isArray(data.parts) ? (data.parts as TeachingSessionPart[]) : [],
    currentPartId: data.currentPartId != null ? String(data.currentPartId) : null,
    joinCode: data.joinCode != null ? String(data.joinCode) : null,
    scheduledAt: typeof data.scheduledAt === 'number' ? data.scheduledAt : undefined,
    createdAt: Number(data.createdAt ?? 0),
    updatedAt: Number(data.updatedAt ?? 0),
  };
}

// ============================================================================
// CREATE DRAFT
// ============================================================================

export async function createDraftSession(
  wardId: string,
  teacherUid: string,
  teacherDisplayName: string,
  payload: CreateDraftSessionPayload
): Promise<string> {
  const ref = doc(collection(getDb(), 'wards', wardId, 'teachingSessions'));
  const sessionId = ref.id;
  const now = Date.now();

  const session: Omit<TeachingSession, 'id'> & { id?: string } = {
    title: payload.title.trim(),
    callingType: payload.callingType,
    description: payload.description?.trim(),
    teacherUid,
    teacherDisplayName,
    status: 'draft',
    parts: payload.parts ?? [],
    currentPartId: null,
    joinCode: null,
    scheduledAt: payload.scheduledAt,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ref, session);
  return sessionId;
}

// ============================================================================
// UPDATE SESSION
// ============================================================================

export async function updateSession(
  wardId: string,
  sessionId: string,
  patch: UpdateSessionPayload
): Promise<void> {
  const ref = doc(getDb(), sessionPath(wardId, sessionId));
  const now = Date.now();

  const update: Record<string, unknown> = {
    updatedAt: now,
  };
  if (patch.title !== undefined) update.title = patch.title.trim();
  if (patch.description !== undefined) update.description = patch.description?.trim() || null;
  if (patch.callingType !== undefined) update.callingType = patch.callingType;
  if (patch.parts !== undefined) update.parts = patch.parts;
  if (patch.scheduledAt !== undefined) update.scheduledAt = patch.scheduledAt ?? null;

  await updateDoc(ref, update);
}

// ============================================================================
// ACTIVATE SESSION
// ============================================================================

export async function activateSession(
  wardId: string,
  sessionId: string
): Promise<string> {
  const ref = doc(getDb(), sessionPath(wardId, sessionId));
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Sesión no encontrada');

  const data = snap.data();
  const parts = (data.parts ?? []) as TeachingSessionPart[];
  const firstPartId = parts.length > 0 ? parts[0].id : null;
  const joinCode = generateJoinCode();
  const now = Date.now();

  await updateDoc(ref, {
    status: 'active',
    joinCode,
    currentPartId: firstPartId,
    updatedAt: now,
  });

  return joinCode;
}

// ============================================================================
// SET CURRENT PART
// ============================================================================

export async function setCurrentPart(
  wardId: string,
  sessionId: string,
  partId: string | null
): Promise<void> {
  const ref = doc(getDb(), sessionPath(wardId, sessionId));
  await updateDoc(ref, {
    currentPartId: partId,
    updatedAt: Date.now(),
  });
}

// ============================================================================
// COMPLETE SESSION
// ============================================================================

export async function completeSession(
  wardId: string,
  sessionId: string
): Promise<void> {
  const ref = doc(getDb(), sessionPath(wardId, sessionId));
  await updateDoc(ref, {
    status: 'completed',
    updatedAt: Date.now(),
  });
}

// ============================================================================
// GET SESSION
// ============================================================================

export async function getSession(
  wardId: string,
  sessionId: string
): Promise<TeachingSession | null> {
  const ref = doc(getDb(), sessionPath(wardId, sessionId));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapDocToSession(wardId, sessionId, snap.data() as Record<string, unknown>);
}

// ============================================================================
// LIST SESSIONS (teacher's sessions)
// ============================================================================

export async function listSessionsForTeacher(
  wardId: string,
  teacherUid: string,
  limitCount: number = 10
): Promise<TeachingSession[]> {
  const coll = collection(getDb(), 'wards', wardId, 'teachingSessions');
  const q = query(
    coll,
    where('teacherUid', '==', teacherUid),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) =>
    mapDocToSession(wardId, d.id, d.data() as Record<string, unknown>)
  );
}

// ============================================================================
// LIST SESSIONS FOR WARD (bishopric - all sessions)
// ============================================================================

export interface ListSessionsForWardOptions {
  limit?: number;
  callingType?: CallingType;
  daysBack?: number;
}

export async function listSessionsForWard(
  wardId: string,
  options?: ListSessionsForWardOptions
): Promise<TeachingSession[]> {
  const coll = collection(getDb(), 'wards', wardId, 'teachingSessions');
  const limitCount = options?.limit ?? 50;
  const q = query(
    coll,
    orderBy('updatedAt', 'desc'),
    limit(limitCount * 2)
  );
  const snapshot = await getDocs(q);
  let sessions = snapshot.docs.map((d) =>
    mapDocToSession(wardId, d.id, d.data() as Record<string, unknown>)
  );

  const cutoff = options?.daysBack
    ? Date.now() - options.daysBack * 24 * 60 * 60 * 1000
    : 0;
  if (cutoff > 0) {
    sessions = sessions.filter((s) => s.updatedAt >= cutoff);
  }
  if (options?.callingType) {
    sessions = sessions.filter((s) => s.callingType === options.callingType);
  }
  return sessions.slice(0, limitCount);
}

// ============================================================================
// SUBSCRIBE (real-time)
// ============================================================================

export function subscribeToSession(
  wardId: string,
  sessionId: string,
  callback: (session: TeachingSession | null) => void
): Unsubscribe {
  const ref = doc(getDb(), sessionPath(wardId, sessionId));
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback(mapDocToSession(wardId, sessionId, snap.data() as Record<string, unknown>));
    },
    (err) => {
      console.error('subscribeToSession error:', err);
      callback(null);
    }
  );
}
