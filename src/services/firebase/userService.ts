/**
 * User Service - xTheGospel Universal Profile
 * 
 * Manages user profiles across all xTheGospel apps.
 * Creates, updates, and retrieves universal user profiles.
 */

import { User } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebaseApp';
import {
  UniversalUserProfile,
  ShareableProfile,
  CreateProfileInput,
  XtgAppKey,
  MemberStatus,
  DEFAULT_PROFILE_APPS,
  DEFAULT_PRIVACY_SETTINGS,
  ChurchUnit,
  OrdinanceDates,
} from '../../types/user';

/**
 * Generate a unique, readable xTheGospel ID
 * Format: XTG-YYYY-XXXXXX (e.g., XTG-2026-A7B3K9)
 */
export function generateXTheGospelId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars (0, O, 1, I)
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `XTG-${year}-${random}`;
}

/**
 * Create a new universal user profile
 */
export async function createUniversalProfile(
  user: User,
  input: CreateProfileInput
): Promise<UniversalUserProfile> {
  const now = serverTimestamp();
  
  // Determine initial member status based on app
  const memberStatus: MemberStatus = input.memberStatus || 
    (input.initialApp === 'investigator' ? 'investigator' : 'active');
  
  const profile: UniversalUserProfile = {
    // Identification
    uid: user.uid,
    xthegospelId: generateXTheGospelId(),
    
    // Basic info
    displayName: input.displayName || user.displayName || input.email.split('@')[0],
    firstName: input.firstName || '',
    lastName: input.lastName || '',
    email: input.email,
    phone: input.phone || user.phoneNumber || '',
    photoURL: user.photoURL || '',
    
    // Dates
    createdAt: now as Timestamp,
    updatedAt: now as Timestamp,
    lastLoginAt: now as Timestamp,
    
    // Church info
    memberStatus,
    
    // Apps - Enable the initial app
    apps: {
      ...DEFAULT_PROFILE_APPS,
      [input.initialApp]: true,
    },
    
    // Roles (empty initially)
    roles: {},
    
    // Privacy
    privacy: DEFAULT_PRIVACY_SETTINGS,
    
    // Metadata
    profileComplete: false,
  };
  
  // Save to Firestore
  const db = getFirebaseDb();
  await setDoc(doc(db, 'users', user.uid), profile);
  
  console.log(`✅ Created xTheGospel profile: ${profile.xthegospelId}`);
  return profile;
}

/**
 * Get user profile by Firebase UID
 */
export async function getProfileByUid(uid: string): Promise<UniversalUserProfile | null> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UniversalUserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

/**
 * Get user profile by xTheGospel ID (for sharing/lookup)
 */
export async function getProfileByXtgId(xthegospelId: string): Promise<UniversalUserProfile | null> {
  try {
    // Note: For production, create a Firestore index or use a separate collection
    // This is a simple implementation for demonstration
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirebaseDb();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('xthegospelId', '==', xthegospelId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UniversalUserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile by XTG ID:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  uid: string,
  updates: Partial<UniversalUserProfile>
): Promise<void> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(uid: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    // Non-critical, just log
    console.warn('Could not update last login:', error);
  }
}

/**
 * Enable an app for a user
 */
export async function enableApp(uid: string, app: XtgAppKey): Promise<void> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      [`apps.${app}`]: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error enabling app:', error);
    throw error;
  }
}

/**
 * Update member status (e.g., after baptism)
 */
export async function updateMemberStatus(
  uid: string,
  status: MemberStatus
): Promise<void> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      memberStatus: status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating member status:', error);
    throw error;
  }
}

/**
 * Update church unit information
 */
export async function updateChurchUnit(
  uid: string,
  unit: ChurchUnit
): Promise<void> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      unit,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating church unit:', error);
    throw error;
  }
}

/**
 * Record ordinance date (baptism, confirmation, etc.)
 */
export async function recordOrdinance(
  uid: string,
  ordinances: Partial<OrdinanceDates>
): Promise<void> {
  try {
    const profile = await getProfileByUid(uid);
    if (!profile) throw new Error('Profile not found');
    
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ordinances: {
        ...profile.ordinances,
        ...ordinances,
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error recording ordinance:', error);
    throw error;
  }
}

/**
 * Mark profile as verified by a leader
 */
export async function verifyProfile(
  uid: string,
  leaderUid: string
): Promise<void> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      verifiedByLeader: true,
      verifiedAt: serverTimestamp(),
      verifiedBy: leaderUid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error verifying profile:', error);
    throw error;
  }
}

/**
 * Get shareable profile (minimal info for QR/sharing)
 */
export function getShareableProfile(profile: UniversalUserProfile): ShareableProfile {
  return {
    xthegospelId: profile.xthegospelId,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    memberStatus: profile.memberStatus,
    unit: profile.unit ? {
      wardName: profile.unit.wardName,
      stakeName: profile.unit.stakeName,
    } : undefined,
  };
}

/**
 * Check if profile exists for a user
 */
export async function profileExists(uid: string): Promise<boolean> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch {
    return false;
  }
}

/**
 * Get or create profile (ensures profile exists)
 */
export async function getOrCreateProfile(
  user: User,
  initialApp: XtgAppKey = 'leader'
): Promise<UniversalUserProfile> {
  const existing = await getProfileByUid(user.uid);
  
  if (existing) {
    // Update last login
    await updateLastLogin(user.uid);
    return existing;
  }
  
  // Create new profile
  return createUniversalProfile(user, {
    email: user.email || '',
    displayName: user.displayName || undefined,
    initialApp,
  });
}

/**
 * Search profiles by xTheGospel ID (partial match for leaders)
 */
export async function searchProfilesByXtgId(
  searchTerm: string,
  limit: number = 10
): Promise<UniversalUserProfile[]> {
  try {
    const { collection, query, where, getDocs, orderBy, startAt, endAt } = await import('firebase/firestore');
    const db = getFirebaseDb();
    
    // Search by xthegospelId prefix
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('xthegospelId'),
      startAt(searchTerm.toUpperCase()),
      endAt(searchTerm.toUpperCase() + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    const results: UniversalUserProfile[] = [];
    
    querySnapshot.forEach((doc) => {
      if (results.length < limit) {
        results.push(doc.data() as UniversalUserProfile);
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error searching profiles:', error);
    return [];
  }
}

/**
 * Get all members in a ward (for leaders)
 */
export async function getWardMembers(
  wardId: string,
  limit: number = 100
): Promise<UniversalUserProfile[]> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirebaseDb();
    
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('unit.wardId', '==', wardId),
      where('privacy.shareWithLeaders', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const results: UniversalUserProfile[] = [];
    
    querySnapshot.forEach((doc) => {
      if (results.length < limit) {
        results.push(doc.data() as UniversalUserProfile);
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error getting ward members:', error);
    return [];
  }
}

/**
 * Get all registered members (for development/testing)
 * In production, this should be scoped to a ward/stake
 */
export async function getAllRegisteredMembers(
  limit: number = 50
): Promise<UniversalUserProfile[]> {
  try {
    const { collection, query, getDocs, orderBy, limit: queryLimit } = await import('firebase/firestore');
    const db = getFirebaseDb();
    
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('createdAt', 'desc'),
      queryLimit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const results: UniversalUserProfile[] = [];
    
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data() as UniversalUserProfile);
    });
    
    console.log(`📋 Found ${results.length} registered members`);
    return results;
  } catch (error) {
    console.error('Error getting all members:', error);
    return [];
  }
}

/**
 * Add a member to a ward
 */
export async function addMemberToWard(
  uid: string, 
  wardId: string, 
  wardName: string,
  stakeId?: string,
  stakeName?: string
): Promise<void> {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      'unit.wardId': wardId,
      'unit.wardName': wardName,
      'unit.stakeId': stakeId || null,
      'unit.stakeName': stakeName || null,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`✅ Added user ${uid} to ward ${wardName}`);
  } catch (error) {
    console.error('Error adding member to ward:', error);
    throw error;
  }
}
