/**
 * Baptism Preparation - Firestore Service
 * Strict normalization, import history (max 3), staleness calculated in UI
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../../../services/firebase/firebaseApp';
import {
  type BaptismPreparationStored,
  type DataSummary,
  type LeaderFeedback,
  type ImportHistoryEntry,
  type FeedbackHistoryEntry,
  type DataVersion,
} from '../types';
import { normalizeToStored } from './importBaptismPreparation';

const IMPORT_HISTORY_MAX = 3;
const FEEDBACK_HISTORY_MAX = 5;
const FEEDBACK_PREVIEW_MAX = 80;
const STALE_THRESHOLD_DAYS = 7;

function getDb() {
  return getFirebaseDb();
}

/**
 * Calculate staleness (never persist).
 * isStale = (now - sourceExportedAt) > thresholdDays
 */
export function isStale(
  sourceExportedAt: string,
  thresholdDays: number = STALE_THRESHOLD_DAYS
): boolean {
  try {
    const exported = new Date(sourceExportedAt).getTime();
    const now = Date.now();
    const days = (now - exported) / (24 * 60 * 60 * 1000);
    return days > thresholdDays;
  } catch {
    return true; // if unparseable, treat as stale
  }
}

function collectionPath(wardId: string) {
  return `wards/${wardId}/baptismPreparation`;
}

function docPath(wardId: string, memberId: string) {
  return `${collectionPath(wardId)}/${memberId}`;
}

export interface SaveInput {
  dataSummary: DataSummary;
  testimonyPreview: string;
  testimonyFull?: string;
  sourceExportedAt: string;
  dataVersion: DataVersion;
}

/**
 * Save baptism preparation. Strict normalization.
 * Appends to importHistory (max 3), never stores raw payload.
 */
export async function saveBaptismPreparation(
  wardId: string,
  memberId: string,
  input: SaveInput,
  leaderUid: string
): Promise<void> {
  const now = new Date().toISOString();
  const historyEntry: ImportHistoryEntry = {
    sourceExportedAt: input.sourceExportedAt,
    lastImportedAt: now,
    importedBy: leaderUid,
    dataVersion: input.dataVersion,
  };

  const ref = doc(getDb(), 'wards', wardId, 'baptismPreparation', memberId);
  const existing = await getDoc(ref);

  let importHistory: ImportHistoryEntry[] = [historyEntry];
  if (existing.exists()) {
    const data = existing.data();
    const prev = (data?.importHistory as ImportHistoryEntry[]) ?? [];
    importHistory = [historyEntry, ...prev].slice(0, IMPORT_HISTORY_MAX);
  }

  const docData: Record<string, unknown> = {
    dataVersion: input.dataVersion,
    sourceExportedAt: input.sourceExportedAt,
    lastImportedAt: serverTimestamp(),
    importedBy: leaderUid,
    dataSummary: input.dataSummary,
    testimonyPreview: input.testimonyPreview,
    importHistory,
  };

  if (input.testimonyFull) {
    docData.testimonyFull = input.testimonyFull;
  }

  if (existing.exists()) {
    const { lastImportedAt, ...rest } = docData;
    await updateDoc(ref, {
      ...rest,
      lastImportedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, docData);
  }
}

/**
 * Get baptism preparation for a member.
 */
export async function getBaptismPreparation(
  wardId: string,
  memberId: string
): Promise<BaptismPreparationStored | null> {
  const ref = doc(getDb(), 'wards', wardId, 'baptismPreparation', memberId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const d = snap.data();
  const lastImportedAt = d.lastImportedAt;
  const lastSeen = d.lastSeenByLeaderAt;
  return {
    dataVersion: d.dataVersion ?? 'bp-v1',
    sourceExportedAt: d.sourceExportedAt ?? '',
    lastImportedAt:
      lastImportedAt instanceof Timestamp
        ? lastImportedAt.toDate().toISOString()
        : typeof lastImportedAt === 'string'
          ? lastImportedAt
          : new Date().toISOString(),
    importedBy: d.importedBy ?? '',
    dataSummary: d.dataSummary ?? {},
    testimonyPreview: d.testimonyPreview ?? '',
    testimonyFull: d.testimonyFull,
    leaderFeedback: d.leaderFeedback,
    feedbackHistory: d.feedbackHistory ?? [],
    importHistory: d.importHistory ?? [],
    lastSeenByLeaderAt:
      lastSeen instanceof Timestamp
        ? lastSeen.toDate().toISOString()
        : typeof lastSeen === 'string'
          ? lastSeen
          : undefined,
    lastSeenByLeaderUid: d.lastSeenByLeaderUid,
  };
}

/**
 * Update leader feedback. Appends to feedbackHistory (max 5).
 */
export async function updateLeaderFeedback(
  wardId: string,
  memberId: string,
  content: string,
  leaderUid: string
): Promise<void> {
  const ref = doc(getDb(), 'wards', wardId, 'baptismPreparation', memberId);
  const now = new Date().toISOString();
  const trimmed = content.trim();
  const feedback: LeaderFeedback = {
    content: trimmed,
    updatedAt: now,
    updatedBy: leaderUid,
  };

  const existing = await getDoc(ref);
  let feedbackHistory: FeedbackHistoryEntry[] = [];
  if (existing.exists()) {
    const prev = (existing.data()?.feedbackHistory as FeedbackHistoryEntry[]) ?? [];
    const entry: FeedbackHistoryEntry = {
      contentPreview: trimmed.slice(0, FEEDBACK_PREVIEW_MAX),
      updatedAt: now,
      updatedBy: leaderUid,
    };
    feedbackHistory = [entry, ...prev].slice(0, FEEDBACK_HISTORY_MAX);
  }

  await updateDoc(ref, { leaderFeedback: feedback, feedbackHistory });
}

/**
 * Touch lastSeenByLeader when leader opens the view.
 */
export async function touchLastSeenByLeader(
  wardId: string,
  memberId: string,
  leaderUid: string
): Promise<void> {
  const ref = doc(getDb(), 'wards', wardId, 'baptismPreparation', memberId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  await updateDoc(ref, {
    lastSeenByLeaderAt: serverTimestamp(),
    lastSeenByLeaderUid: leaderUid,
  });
}

/**
 * Build SaveInput from parse result (for use after parseBaptismPreparationFile).
 */
export function buildSaveInput(
  data: import('../types').BaptismPreparationImport,
  sourceExportedAt: string,
  dataVersion: DataVersion
): SaveInput {
  const normalized = normalizeToStored(data, sourceExportedAt, dataVersion);
  return {
    dataSummary: normalized.dataSummary,
    testimonyPreview: normalized.testimonyPreview,
    testimonyFull: normalized.testimonyFull,
    sourceExportedAt,
    dataVersion,
  };
}
