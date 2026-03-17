/**
 * Lesson Progress Service - Firestore
 * EPIC 4: List lesson progress by ward for leadership visibility
 */

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from './firebaseApp';

export interface LessonProgressEntry {
  lessonId: string;
  completedAt: string;
  percent: number;
}

export interface WardLessonProgress {
  uid: string;
  completedLessons: Record<string, LessonProgressEntry>;
  updatedAt: number;
}

function getDb() {
  return getFirebaseDb();
}

/**
 * List all lesson progress docs for a ward.
 * Only ward leaders can read (enforced by Firestore rules).
 */
export async function listLessonProgressByWard(
  wardId: string
): Promise<WardLessonProgress[]> {
  const coll = collection(getDb(), 'wards', wardId, 'lessonProgress');
  const snapshot = await getDocs(coll);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      completedLessons: data.completedLessons || {},
      updatedAt: data.updatedAt || 0,
    } as WardLessonProgress;
  });
}

/**
 * Get lesson progress for a single member.
 */
export async function getLessonProgressForMember(
  wardId: string,
  memberUid: string
): Promise<WardLessonProgress | null> {
  const ref = doc(getDb(), 'wards', wardId, 'lessonProgress', memberUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: memberUid,
    completedLessons: data.completedLessons || {},
    updatedAt: data.updatedAt || 0,
  };
}

/**
 * Calculate percent completed for a member (lessons with percent >= 100).
 */
export function getProgressPercent(progress: WardLessonProgress): number {
  const entries = Object.values(progress.completedLessons);
  if (entries.length === 0) return 0;
  const completed = entries.filter((e) => e.percent >= 100).length;
  return Math.round((completed / entries.length) * 100);
}
