/**
 * Seed Test Data - Creates test profiles in Firebase
 * 
 * Run this once to populate the database with test members.
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../services/firebase/firebaseApp';
import { UniversalUserProfile, DEFAULT_PROFILE_APPS, DEFAULT_PRIVACY_SETTINGS } from '../types/user';

// Test profiles with known IDs
export const TEST_PROFILES: Partial<UniversalUserProfile>[] = [
  {
    uid: 'test-user-001',
    xthegospelId: 'XTG-2026-TEST01',
    displayName: 'María García',
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@test.com',
    phone: '+1 555-0101',
    memberStatus: 'active',
    apps: { ...DEFAULT_PROFILE_APPS, member: true },
    roles: {},
    privacy: { ...DEFAULT_PRIVACY_SETTINGS, shareWithLeaders: true },
    profileComplete: true,
    unit: {
      stakeId: 'stake-001',
      stakeName: 'Estaca Central',
      wardId: 'ward-001',
      wardName: 'Barrio Los Olivos',
    },
  },
  {
    uid: 'test-user-002',
    xthegospelId: 'XTG-2026-TEST02',
    displayName: 'Juan Pérez',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@test.com',
    phone: '+1 555-0102',
    memberStatus: 'new_convert',
    apps: { ...DEFAULT_PROFILE_APPS, member: true, investigator: true },
    roles: {},
    privacy: { ...DEFAULT_PRIVACY_SETTINGS, shareWithLeaders: true },
    profileComplete: true,
    ordinances: {
      baptismDate: '2026-01-15',
      confirmationDate: '2026-01-15',
    },
    unit: {
      stakeId: 'stake-001',
      stakeName: 'Estaca Central',
      wardId: 'ward-001',
      wardName: 'Barrio Los Olivos',
    },
  },
  {
    uid: 'test-user-003',
    xthegospelId: 'XTG-2026-TEST03',
    displayName: 'Ana López',
    firstName: 'Ana',
    lastName: 'López',
    email: 'ana.lopez@test.com',
    phone: '+1 555-0103',
    memberStatus: 'investigator',
    apps: { ...DEFAULT_PROFILE_APPS, investigator: true },
    roles: {},
    privacy: { ...DEFAULT_PRIVACY_SETTINGS, shareWithLeaders: true },
    profileComplete: false,
  },
  {
    uid: 'test-user-004',
    xthegospelId: 'XTG-2026-TEST04',
    displayName: 'Carlos Rodríguez',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@test.com',
    phone: '+1 555-0104',
    memberStatus: 'active',
    apps: { ...DEFAULT_PROFILE_APPS, member: true, leader: true },
    roles: {
      leader: ['elders_quorum_president'],
    },
    privacy: { ...DEFAULT_PRIVACY_SETTINGS, shareWithLeaders: true },
    profileComplete: true,
    verifiedByLeader: true,
    unit: {
      stakeId: 'stake-001',
      stakeName: 'Estaca Central',
      wardId: 'ward-001',
      wardName: 'Barrio Los Olivos',
    },
  },
  {
    uid: 'test-user-005',
    xthegospelId: 'XTG-2026-TEST05',
    displayName: 'Laura Fernández',
    firstName: 'Laura',
    lastName: 'Fernández',
    email: 'laura.fernandez@test.com',
    memberStatus: 'returned',
    apps: { ...DEFAULT_PROFILE_APPS, member: true },
    roles: {
      missionary: 'returned',
    },
    privacy: { ...DEFAULT_PRIVACY_SETTINGS, shareWithLeaders: true },
    profileComplete: true,
    unit: {
      stakeId: 'stake-001',
      stakeName: 'Estaca Central',
      wardId: 'ward-001',
      wardName: 'Barrio Los Olivos',
    },
  },
];

/**
 * Seed all test profiles to Firebase
 */
export async function seedTestProfiles(): Promise<{ success: number; errors: number }> {
  let db;
  try {
    db = getFirebaseDb();
    console.log('📡 Firebase DB obtenido, intentando conectar...');
  } catch (initError: any) {
    console.error('❌ Error inicializando Firebase:', initError);
    throw new Error(`Firebase no inicializado: ${initError.message}`);
  }

  let success = 0;
  let errors = 0;

  for (const profile of TEST_PROFILES) {
    try {
      console.log(`📝 Creando perfil: ${profile.xthegospelId}...`);
      
      const fullProfile = {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', profile.uid!), fullProfile);
      console.log(`✅ Created: ${profile.xthegospelId} - ${profile.displayName}`);
      success++;
    } catch (error: any) {
      console.error(`❌ Failed: ${profile.xthegospelId}`, error.message || error);
      errors++;
      
      // Si el primer intento falla con offline, abortar
      if (error.message?.includes('offline') && success === 0) {
        throw new Error('Firebase está offline. Verifica tu conexión y que Firestore esté habilitado en la consola de Firebase.');
      }
    }
  }

  console.log(`\n📊 Seed complete: ${success} created, ${errors} errors`);
  return { success, errors };
}

/**
 * Get list of test IDs for easy reference
 */
export function getTestIds(): string[] {
  return TEST_PROFILES.map(p => p.xthegospelId!);
}
