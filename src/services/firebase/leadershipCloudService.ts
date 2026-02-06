/**
 * Leadership Cloud Service
 * 
 * CRUD operations for leadership toolkit data in Firestore.
 * All data is user-scoped: /users/{uid}/...
 * 
 * Schema version: v1
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebaseApp';
import type {
  Calling,
  Responsibility,
  LeadershipNote,
  CallingEvent,
  Observation,
} from '../../features/leadershipCallings/types';

const SCHEMA_VERSION = 'v1';

// Helper to convert Firestore Timestamp to ISO string
function timestampToISO(timestamp: Timestamp | string | undefined): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
}

// Helper to ensure document has required fields
function ensureSchema<T extends { id: string; createdAt?: string; updatedAt?: string }>(
  data: T,
  isUpdate: boolean = false
): T & { schemaVersion: string; createdAt: string; updatedAt: string } {
  return {
    ...data,
    schemaVersion: SCHEMA_VERSION,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: isUpdate ? new Date().toISOString() : (data.createdAt || new Date().toISOString()),
  };
}

// ============================================================================
// CALLINGS
// ============================================================================

export async function upsertCalling(uid: string, calling: Calling): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_callings/${calling.id}`);
  const data = ensureSchema(calling, !!calling.updatedAt);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function listCallings(uid: string): Promise<Calling[]> {
  const db = getFirebaseDb();
  const colRef = collection(db, `users/${uid}/leadership_callings`);
  const snapshot = await getDocs(colRef);
  
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: timestampToISO(data.createdAt),
      updatedAt: timestampToISO(data.updatedAt),
    } as Calling;
  });
}

export async function getCalling(uid: string, callingId: string): Promise<Calling | null> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_callings/${callingId}`);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: timestampToISO(data.createdAt),
    updatedAt: timestampToISO(data.updatedAt),
  } as Calling;
}

export async function deleteCalling(uid: string, callingId: string): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_callings/${callingId}`);
  await deleteDoc(docRef);
}

// ============================================================================
// RESPONSIBILITIES
// ============================================================================

export async function upsertResponsibility(
  uid: string,
  responsibility: Responsibility
): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_responsibilities/${responsibility.id}`);
  const data = ensureSchema(responsibility, !!responsibility.updatedAt);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function listResponsibilities(uid: string): Promise<Responsibility[]> {
  const db = getFirebaseDb();
  const colRef = collection(db, `users/${uid}/leadership_responsibilities`);
  const snapshot = await getDocs(colRef);
  
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: timestampToISO(data.createdAt),
      updatedAt: timestampToISO(data.updatedAt),
    } as Responsibility;
  });
}

export async function deleteResponsibility(uid: string, respId: string): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_responsibilities/${respId}`);
  await deleteDoc(docRef);
}

// ============================================================================
// NOTES
// ============================================================================

export async function upsertNote(uid: string, note: LeadershipNote): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_notes/${note.id}`);
  const data = ensureSchema(note, !!note.updatedAt);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function listNotes(uid: string): Promise<LeadershipNote[]> {
  const db = getFirebaseDb();
  const colRef = collection(db, `users/${uid}/leadership_notes`);
  const snapshot = await getDocs(colRef);
  
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: timestampToISO(data.createdAt),
      updatedAt: timestampToISO(data.updatedAt),
    } as LeadershipNote;
  });
}

export async function deleteNote(uid: string, noteId: string): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_notes/${noteId}`);
  await deleteDoc(docRef);
}

// ============================================================================
// EVENTS
// ============================================================================

export async function upsertEvent(uid: string, event: CallingEvent): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_events/${event.id}`);
  const data = ensureSchema(event, !!event.updatedAt);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function listEvents(uid: string): Promise<CallingEvent[]> {
  const db = getFirebaseDb();
  const colRef = collection(db, `users/${uid}/leadership_events`);
  const snapshot = await getDocs(colRef);
  
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: timestampToISO(data.createdAt),
      updatedAt: timestampToISO(data.updatedAt),
    } as CallingEvent;
  });
}

export async function deleteEvent(uid: string, eventId: string): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_events/${eventId}`);
  await deleteDoc(docRef);
}

// ============================================================================
// OBSERVATIONS
// ============================================================================

export async function upsertObservation(uid: string, observation: Observation): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_observations/${observation.id}`);
  const data = {
    ...observation,
    schemaVersion: SCHEMA_VERSION,
    createdAt: observation.createdAt || new Date().toISOString(),
  };
  await setDoc(docRef, data, { merge: true });
}

export async function listObservations(uid: string): Promise<Observation[]> {
  const db = getFirebaseDb();
  const colRef = collection(db, `users/${uid}/leadership_observations`);
  const snapshot = await getDocs(colRef);
  
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: timestampToISO(data.createdAt),
    } as Observation;
  });
}

export async function deleteObservation(uid: string, obsId: string): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, `users/${uid}/leadership_observations/${obsId}`);
  await deleteDoc(docRef);
}
