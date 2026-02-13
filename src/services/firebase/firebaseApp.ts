/**
 * Firebase App Initialization
 * 
 * Initializes Firebase services (Auth, Firestore, Storage) using Vite env variables.
 * Throws clear error if required keys are missing.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function getFirebaseConfig(): FirebaseConfig {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  const missing: string[] = [];
  if (!apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!storageBucket) missing.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId) missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!appId) missing.push('VITE_FIREBASE_APP_ID');

  if (missing.length > 0) {
    throw new Error(
      `Firebase configuration incomplete. Missing environment variables:\n${missing.join('\n')}\n\n` +
      `Please create .env.local with these variables.`
    );
  }

  return {
    apiKey: apiKey as string,
    authDomain: authDomain as string,
    projectId: projectId as string,
    storageBucket: storageBucket as string,
    messagingSenderId: messagingSenderId as string,
    appId: appId as string,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function initializeFirebase(): void {
  if (app) {
    return; // Already initialized
  }

  try {
    const config = getFirebaseConfig();
    const existingApps = getApps();
    
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      app = initializeApp(config);
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    initializeFirebase();
  }
  if (!app) {
    throw new Error('Firebase app not initialized');
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    initializeFirebase();
  }
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    initializeFirebase();
  }
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }
  return storage;
}

// Auto-initialize on import (lazy - only if env vars are present)
if (typeof window !== 'undefined') {
  try {
    initializeFirebase();
  } catch (error) {
    // Silently fail if env vars are missing - Firebase is optional
    console.warn('Firebase not configured. Cloud sync will be disabled.', error);
  }
}
