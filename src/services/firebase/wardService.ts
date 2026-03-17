/**
 * Ward Service - Firebase Firestore
 * 
 * Manages wards/branches and join codes.
 */

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  arrayUnion,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebaseApp';

// Get db instance lazily
const getDb = () => getFirebaseDb();
import {
  Ward,
  WardJoinCode,
  UserWardMembership,
  CreateWardRequest,
  generateWardCode,
  normalizeWardCode,
} from '../../types/ward';

// ============================================================================
// COLLECTIONS
// ============================================================================

const WARDS_COLLECTION = 'wards';
const WARD_CODES_COLLECTION = 'wardCodes';
const USERS_COLLECTION = 'users';

// ============================================================================
// CREATE WARD (Only Bishopric)
// ============================================================================

export async function createWard(
  request: CreateWardRequest,
  creatorUid: string
): Promise<Ward> {
  const wardId = doc(collection(getDb(), WARDS_COLLECTION)).id;
  const joinCode = generateWardCode();
  const now = Date.now();

  const ward: Ward = {
    id: wardId,
    name: request.name,
    type: request.type,
    stakeName: request.stakeName,
    stakeType: request.stakeType,
    country: request.country,
    city: request.city,
    joinCode: joinCode,
    joinCodeCreatedAt: now,
    joinCodeCreatedBy: creatorUid,
    createdAt: now,
    createdBy: creatorUid,
    updatedAt: now,
    memberCount: 0,
    leaderCount: 1,
    memberIds: [],
    leaderIds: [creatorUid],
  };

  // Save ward
  await setDoc(doc(getDb(), WARDS_COLLECTION, wardId), ward);

  // Save join code for lookup
  const codeData: WardJoinCode = {
    code: joinCode,
    wardId: wardId,
    wardName: request.name,
    stakeName: request.stakeName,
    createdAt: now,
    createdBy: creatorUid,
    isActive: true,
    currentUses: 0,
  };
  
  // Use normalized code as document ID for easy lookup
  const normalizedCode = normalizeWardCode(joinCode);
  await setDoc(doc(getDb(), WARD_CODES_COLLECTION, normalizedCode), codeData);

  // Update creator's ward membership (creator = leader)
  await updateUserWardMembership(creatorUid, {
    wardId: wardId,
    wardName: request.name,
    stakeName: request.stakeName,
    joinedAt: now,
    joinedVia: 'created',
    isLeader: true,
  });

  return ward;
}

// ============================================================================
// GET WARD
// ============================================================================

export async function getWard(wardId: string): Promise<Ward | null> {
  const wardDoc = await getDoc(doc(getDb(), WARDS_COLLECTION, wardId));
  if (!wardDoc.exists()) return null;
  return wardDoc.data() as Ward;
}

// ============================================================================
// JOIN WARD BY CODE
// ============================================================================

export interface JoinWardResult {
  success: boolean;
  error?: 'invalid_code' | 'code_expired' | 'code_inactive' | 'max_uses_reached' | 'already_member';
  ward?: Ward;
}

export async function joinWardByCode(
  code: string,
  uid: string
): Promise<JoinWardResult> {
  const normalizedCode = normalizeWardCode(code);
  
  // Look up the code
  const codeDoc = await getDoc(doc(getDb(), WARD_CODES_COLLECTION, normalizedCode));
  
  if (!codeDoc.exists()) {
    return { success: false, error: 'invalid_code' };
  }

  const codeData = codeDoc.data() as WardJoinCode;

  // Check if code is active
  if (!codeData.isActive) {
    return { success: false, error: 'code_inactive' };
  }

  // Check expiration
  if (codeData.expiresAt && codeData.expiresAt < Date.now()) {
    return { success: false, error: 'code_expired' };
  }

  // Check max uses
  if (codeData.maxUses && codeData.currentUses >= codeData.maxUses) {
    return { success: false, error: 'max_uses_reached' };
  }

  // Check if user is already a member
  const userDoc = await getDoc(doc(getDb(), USERS_COLLECTION, uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    if (userData.wardMembership?.wardId === codeData.wardId) {
      return { success: false, error: 'already_member' };
    }
  }

  // Get ward details
  const ward = await getWard(codeData.wardId);
  if (!ward) {
    return { success: false, error: 'invalid_code' };
  }

  // Join the ward (join by code = not leader by default)
  const now = Date.now();
  await updateUserWardMembership(uid, {
    wardId: codeData.wardId,
    wardName: codeData.wardName,
    stakeId: codeData.stakeId,
    stakeName: codeData.stakeName,
    joinedAt: now,
    joinedVia: 'code',
    isLeader: false,
  });

  // Increment usage counter
  await updateDoc(doc(getDb(), WARD_CODES_COLLECTION, normalizedCode), {
    currentUses: codeData.currentUses + 1,
  });

  // Update ward: add uid to memberIds (para reglas Firestore v2) y memberCount
  const wardRef = doc(getDb(), WARDS_COLLECTION, codeData.wardId);
  await updateDoc(wardRef, {
    memberIds: arrayUnion(uid),
    memberCount: (ward.memberCount || 0) + 1,
    updatedAt: now,
  });

  return { success: true, ward };
}

// ============================================================================
// REGENERATE JOIN CODE
// ============================================================================

export async function regenerateWardCode(
  wardId: string,
  uid: string
): Promise<string> {
  const ward = await getWard(wardId);
  if (!ward) throw new Error('Ward not found');

  // Deactivate old code
  const oldNormalizedCode = normalizeWardCode(ward.joinCode);
  await updateDoc(doc(getDb(), WARD_CODES_COLLECTION, oldNormalizedCode), {
    isActive: false,
  });

  // Generate new code
  const newCode = generateWardCode();
  const now = Date.now();

  // Save new code
  const newCodeData: WardJoinCode = {
    code: newCode,
    wardId: wardId,
    wardName: ward.name,
    stakeName: ward.stakeName,
    createdAt: now,
    createdBy: uid,
    isActive: true,
    currentUses: 0,
  };

  const normalizedNewCode = normalizeWardCode(newCode);
  await setDoc(doc(getDb(), WARD_CODES_COLLECTION, normalizedNewCode), newCodeData);

  // Update ward
  await updateDoc(doc(getDb(), WARDS_COLLECTION, wardId), {
    joinCode: newCode,
    joinCodeCreatedAt: now,
    joinCodeCreatedBy: uid,
    updatedAt: now,
  });

  return newCode;
}

// ============================================================================
// UPDATE USER WARD MEMBERSHIP
// ============================================================================

async function updateUserWardMembership(
  uid: string,
  membership: UserWardMembership
): Promise<void> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    await updateDoc(userRef, {
      wardMembership: membership,
      updatedAt: Date.now(),
    });
  } else {
    await setDoc(userRef, {
      wardMembership: membership,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

// ============================================================================
// GET USER WARD MEMBERSHIP
// ============================================================================

export async function getUserWardMembership(
  uid: string
): Promise<UserWardMembership | null> {
  const userDoc = await getDoc(doc(getDb(), USERS_COLLECTION, uid));
  if (!userDoc.exists()) return null;
  
  const data = userDoc.data();
  return data.wardMembership || null;
}

// ============================================================================
// GET WARD LEADERS
// ============================================================================

export async function getWardLeaders(wardId: string): Promise<string[]> {
  const q = query(
    collection(getDb(), USERS_COLLECTION),
    where('wardMembership.wardId', '==', wardId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.id);
}

// ============================================================================
// MIGRATION: Añadir isLeader a usuarios existentes
// Ejecutar una vez tras desplegar reglas con isLeader.
// Ward creators → isLeader: true. Join por code → isLeader: false.
// SEGURIDAD: Solo ward creators o modo dev pueden ejecutar.
// ============================================================================

function isMigrationAllowed(callerUid: string, wardCreators: Set<string>): boolean {
  if (import.meta.env.DEV) return true;
  return wardCreators.has(callerUid);
}

export async function migrateWardCreatorsToLeaders(
  callerUid: string
): Promise<{ updated: number; errors: string[] }> {
  const wardsSnap = await getDocs(collection(getDb(), WARDS_COLLECTION));
  const wardCreators = new Set(
    wardsSnap.docs
      .map((d) => (d.data() as Ward).createdBy)
      .filter(Boolean)
  );

  if (!isMigrationAllowed(callerUid, wardCreators)) {
    throw new Error(
      'No autorizado: solo creadores de ward o modo dev pueden ejecutar la migración.'
    );
  }

  const errors: string[] = [];
  let updated = 0;

  for (const wardDoc of wardsSnap.docs) {
    const ward = wardDoc.data() as Ward;
    const creatorUid = ward.createdBy;
    if (!creatorUid) continue;

    try {
      const userRef = doc(getDb(), USERS_COLLECTION, creatorUid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) continue;

      const data = userSnap.data();
      const membership = data.wardMembership;
      if (!membership || membership.wardId !== ward.id) continue;
      if (membership.isLeader === true) continue; // ya migrado

      await updateDoc(userRef, {
        'wardMembership.isLeader': true,
        updatedAt: Date.now(),
      });
      updated++;
    } catch (e) {
      errors.push(`${creatorUid}: ${(e as Error).message}`);
    }
  }
  return { updated, errors };
}

/** Marca un usuario como líder (para migración manual o admin). */
export async function setUserAsWardLeader(uid: string, isLeader: boolean): Promise<void> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('Usuario no encontrado');
  const data = userSnap.data();
  if (!data.wardMembership) throw new Error('Usuario no tiene wardMembership');
  await updateDoc(userRef, {
    'wardMembership.isLeader': isLeader,
    updatedAt: Date.now(),
  });
}

// ============================================================================
// LEAVE WARD
// ============================================================================

export async function leaveWard(uid: string): Promise<void> {
  const userRef = doc(getDb(), USERS_COLLECTION, uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return;
  
  const data = userDoc.data();
  const wardId = data.wardMembership?.wardId;
  
  // Clear membership
  await updateDoc(userRef, {
    wardMembership: null,
    updatedAt: Date.now(),
  });
  
  // Decrement ward leader count
  if (wardId) {
    const ward = await getWard(wardId);
    if (ward && ward.leaderCount && ward.leaderCount > 0) {
      await updateDoc(doc(getDb(), WARDS_COLLECTION, wardId), {
        leaderCount: ward.leaderCount - 1,
        updatedAt: Date.now(),
      });
    }
  }
}
