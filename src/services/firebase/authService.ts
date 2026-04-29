/**
 * Firebase Authentication Service
 * 
 * Minimal auth service for user authentication.
 * No tracking, no analytics, no telemetry.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebaseApp';

export interface AuthError {
  code: string;
  message: string;
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const auth = getFirebaseAuth();
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw {
      code: error.code || 'auth/unknown-error',
      message: error.message || 'Failed to sign up',
    } as AuthError;
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const auth = getFirebaseAuth();
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw {
      code: error.code || 'auth/unknown-error',
      message: error.message || 'Failed to sign in',
    } as AuthError;
  }
}

/**
 * Sign in with Google (popup). Requires Google provider enabled in Firebase Console.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    throw {
      code: error.code || 'auth/unknown-error',
      message: error.message || 'Failed to sign in with Google',
    } as AuthError;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw {
      code: error.code || 'auth/unknown-error',
      message: error.message || 'Failed to sign out',
    } as AuthError;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  try {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  } catch {
    return null;
  }
}
