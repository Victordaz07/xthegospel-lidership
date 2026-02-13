/**
 * Participants Service - Firestore
 *
 * Join por código, suscripción en tiempo real, presence, progreso por parte.
 * Colección: wards/{wardId}/teachingSessions/{sessionId}/participants/{uid}
 *
 * Fase 3 completa: progreso por parte en vivo (participante → maestro) funcionando.
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  collectionGroup,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb } from '../../../services/firebase/firebaseApp';
import type { SessionParticipant, TeachingSession } from '../types';
import { isValidJoinCode, normalizeJoinCode, formatJoinCodeForDisplay } from '../utils/joinCode';

const getDb = () => getFirebaseDb();

// ============================================================================
// TYPES
// ============================================================================

export interface SessionLookupResult {
  wardId: string;
  sessionId: string;
  session: TeachingSession;
}

// ============================================================================
// GET SESSION BY JOIN CODE (collection group query - no wardId needed)
// ============================================================================

export async function getSessionByJoinCode(
  joinCode: string
): Promise<SessionLookupResult | null> {
  if (!isValidJoinCode(joinCode)) return null;

  const codeForQuery = formatJoinCodeForDisplay(normalizeJoinCode(joinCode));
  const db = getDb();

  const q = query(
    collectionGroup(db, 'teachingSessions'),
    where('joinCode', '==', codeForQuery),
    where('status', '==', 'active'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const pathParts = docSnap.ref.path.split('/');
  const wardId = pathParts[1];
  const sessionId = docSnap.id;
  const data = docSnap.data() as Record<string, unknown>;

  const session: TeachingSession = {
    id: sessionId,
    title: String(data.title ?? ''),
    description: data.description ? String(data.description) : undefined,
    callingType: (data.callingType as TeachingSession['callingType']) ?? 'other',
    teacherUid: String(data.teacherUid ?? ''),
    teacherDisplayName: data.teacherDisplayName ? String(data.teacherDisplayName) : undefined,
    status: 'active',
    parts: Array.isArray(data.parts) ? data.parts : [],
    currentPartId: data.currentPartId != null ? String(data.currentPartId) : null,
    joinCode: data.joinCode != null ? String(data.joinCode) : null,
    scheduledAt: typeof data.scheduledAt === 'number' ? data.scheduledAt : undefined,
    createdAt: Number(data.createdAt ?? 0),
    updatedAt: Number(data.updatedAt ?? 0),
  };

  return { wardId, sessionId, session };
}

// ============================================================================
// JOIN SESSION BY CODE (idempotent)
// ============================================================================

export interface JoinUserProfile {
  uid: string;
  displayName: string;
  xtgId?: string;
}

export async function joinSessionByCode(
  joinCode: string,
  user: JoinUserProfile
): Promise<{ success: true; wardId: string; sessionId: string } | { success: false; error: string }> {
  const lookup = await getSessionByJoinCode(joinCode);
  if (!lookup) {
    return { success: false, error: 'Sesión no encontrada o no está activa' };
  }

  const { wardId, sessionId } = lookup;
  const participantRef = doc(
    getDb(),
    'wards',
    wardId,
    'teachingSessions',
    sessionId,
    'participants',
    user.uid
  );

  const existing = await getDoc(participantRef);
  const now = Date.now();

  const participant: SessionParticipant = {
    uid: user.uid,
    xtgId: user.xtgId,
    displayName: user.displayName || 'Participante',
    registeredAt: existing.exists() ? (existing.data()?.registeredAt as number) ?? now : now,
    lastSeenAt: now,
    presence: 'present',
    progress: existing.exists()
      ? (existing.data()?.progress as SessionParticipant['progress']) ?? { completedPartIds: [] }
      : { completedPartIds: [] },
  };

  await setDoc(participantRef, participant);

  return { success: true, wardId, sessionId };
}

// ============================================================================
// SUBSCRIBE TO PARTICIPANTS
// ============================================================================

function mapDocToParticipant(data: Record<string, unknown>, uid: string): SessionParticipant {
  return {
    uid,
    xtgId: data.xtgId ? String(data.xtgId) : undefined,
    displayName: String(data.displayName ?? ''),
    registeredAt: Number(data.registeredAt ?? 0),
    lastSeenAt: data.lastSeenAt != null ? Number(data.lastSeenAt) : undefined,
    presence: (data.presence as SessionParticipant['presence']) ?? 'present',
    progress: (data.progress as SessionParticipant['progress']) ?? { completedPartIds: [] },
  };
}

export function subscribeToParticipants(
  wardId: string,
  sessionId: string,
  callback: (participants: SessionParticipant[]) => void
): Unsubscribe {
  const coll = collection(
    getDb(),
    'wards',
    wardId,
    'teachingSessions',
    sessionId,
    'participants'
  );
  const q = query(coll);

  return onSnapshot(
    q,
    (snapshot) => {
      const participants = snapshot.docs.map((d) =>
        mapDocToParticipant(d.data() as Record<string, unknown>, d.id)
      );
      callback(participants);
    },
    (err) => {
      console.error('subscribeToParticipants error:', err);
      callback([]);
    }
  );
}

// ============================================================================
// TOUCH LAST SEEN
// ============================================================================

export async function touchLastSeen(
  wardId: string,
  sessionId: string,
  uid: string
): Promise<void> {
  const ref = doc(
    getDb(),
    'wards',
    wardId,
    'teachingSessions',
    sessionId,
    'participants',
    uid
  );
  await updateDoc(ref, { lastSeenAt: Date.now() });
}

// ============================================================================
// MARK PART COMPLETED (idempotent)
// ============================================================================

export function hasCompletedPart(
  participant: SessionParticipant | null | undefined,
  partId: string | null | undefined
): boolean {
  if (!participant || !partId) return false;
  return (participant.progress?.completedPartIds ?? []).includes(partId);
}

export async function markPartCompleted(
  wardId: string,
  sessionId: string,
  uid: string,
  partId: string
): Promise<void> {
  const ref = doc(
    getDb(),
    'wards',
    wardId,
    'teachingSessions',
    sessionId,
    'participants',
    uid
  );

  const existing = await getDoc(ref);
  const data = existing.data() as Record<string, unknown> | undefined;
  const completedPartIds = (data?.progress as { completedPartIds?: string[] } | undefined)
    ?.completedPartIds ?? [];

  if (completedPartIds.includes(partId)) return;

  const newIds = [...completedPartIds, partId];
  await updateDoc(ref, {
    progress: { completedPartIds: newIds },
    lastSeenAt: Date.now(),
  });
}

// ============================================================================
// UPDATE PRESENCE
// ============================================================================

export async function updatePresence(
  wardId: string,
  sessionId: string,
  uid: string,
  presence: SessionParticipant['presence']
): Promise<void> {
  const ref = doc(
    getDb(),
    'wards',
    wardId,
    'teachingSessions',
    sessionId,
    'participants',
    uid
  );
  await updateDoc(ref, { presence, lastSeenAt: Date.now() });
}
