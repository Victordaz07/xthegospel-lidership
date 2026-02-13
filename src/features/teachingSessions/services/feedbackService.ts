/**
 * Feedback Service - Firestore
 *
 * Rating y comentarios post-clase. Fase 8.
 * Subcolección: wards/{wardId}/teachingSessions/{sessionId}/feedback/{uid}
 */

import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '../../../services/firebase/firebaseApp';

const getDb = () => getFirebaseDb();

export interface SubmitFeedbackPayload {
  rating: number; // 1..5
  comment?: string;
}

export async function submitFeedback(
  wardId: string,
  sessionId: string,
  uid: string,
  payload: SubmitFeedbackPayload
): Promise<void> {
  if (payload.rating < 1 || payload.rating > 5) {
    throw new Error('Rating debe ser entre 1 y 5');
  }

  const ref = doc(getDb(), 'wards', wardId, 'teachingSessions', sessionId, 'feedback', uid);
  const existing = await getDoc(ref);
  const now = Date.now();

  const data: Record<string, unknown> = {
    uid,
    rating: payload.rating,
    comment: payload.comment?.trim() || null,
    createdAt: existing.exists() ? (existing.data()?.createdAt as number) ?? now : now,
    updatedAt: now,
  };

  await setDoc(ref, data);
}

export interface FeedbackSummaryResult {
  count: number;
  avgRating: number;
  comments: string[];
}

export async function getFeedbackSummary(
  wardId: string,
  sessionId: string
): Promise<FeedbackSummaryResult> {
  const coll = collection(getDb(), 'wards', wardId, 'teachingSessions', sessionId, 'feedback');
  const snapshot = await getDocs(coll);

  const docs = snapshot.docs.map((d) => d.data() as { rating?: number; comment?: string; createdAt?: number });
  const count = docs.length;

  if (count === 0) {
    return { count: 0, avgRating: 0, comments: [] };
  }

  const totalRating = docs.reduce((acc, d) => acc + (Number(d.rating) || 0), 0);
  const avgRating = Math.round((totalRating / count) * 10) / 10;

  const comments = docs
    .map((d) => (d.comment && String(d.comment).trim()) || '')
    .filter(Boolean)
    .slice(-5)
    .reverse();

  return { count, avgRating, comments };
}
