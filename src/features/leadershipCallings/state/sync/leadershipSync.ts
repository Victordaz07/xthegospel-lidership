/**
 * Leadership Sync Bridge
 * 
 * Syncs leadership toolkit data between local stores (Zustand) and Firebase.
 * 
 * Rules:
 * - Sync is OFF by default (FLAGS.CLOUD_SYNC_ENABLED = false)
 * - Local-first: local stores always work even if sync fails
 * - Hydration from cloud only happens if local is empty (no overwrite without consent)
 */

import { FLAGS } from '../../../../config/featureFlags';
import { getCurrentUser } from '../../../../services/firebase/authService';
import {
  upsertCalling,
  listCallings,
  upsertResponsibility,
  listResponsibilities,
  upsertNote,
  listNotes,
  upsertEvent,
  listEvents,
  upsertObservation,
  listObservations,
} from '../../../../services/firebase/leadershipCloudService';
import { useCallingsStore } from '../useCallingsStore';
import { useResponsibilitiesStore } from '../useResponsibilitiesStore';
import { useLeadershipNotesStore } from '../useLeadershipNotesStore';
import { useEventsStore } from '../useEventsStore';
import { useObservationsStore } from '../useObservationsStore';

/**
 * Sync all leadership data to cloud
 * 
 * Reads from local stores and upserts to Firestore.
 * Only runs if CLOUD_SYNC_ENABLED is true and user is authenticated.
 */
export async function syncLeadershipToCloud(): Promise<{
  success: boolean;
  error?: string;
  synced: {
    callings: number;
    responsibilities: number;
    notes: number;
    events: number;
    observations: number;
  };
}> {
  // Check feature flag
  if (!FLAGS.CLOUD_SYNC_ENABLED) {
    return {
      success: false,
      error: 'Cloud sync is disabled',
      synced: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
    };
  }

  // Check authentication
  const user = getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: 'User not authenticated',
      synced: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
    };
  }

  try {
    const uid = user.uid;

    // Get all data from local stores
    const callings = useCallingsStore.getState().callings;
    const responsibilities = useResponsibilitiesStore.getState().responsibilities;
    const notes = useLeadershipNotesStore.getState().notes;
    const events = useEventsStore.getState().events;
    const observations = useObservationsStore.getState().observations;

    // Upsert all to cloud
    await Promise.all([
      ...callings.map((c) => upsertCalling(uid, c)),
      ...responsibilities.map((r) => upsertResponsibility(uid, r)),
      ...notes.map((n) => upsertNote(uid, n)),
      ...events.map((e) => upsertEvent(uid, e)),
      ...observations.map((o) => upsertObservation(uid, o)),
    ]);

    return {
      success: true,
      synced: {
        callings: callings.length,
        responsibilities: responsibilities.length,
        notes: notes.length,
        events: events.length,
        observations: observations.length,
      },
    };
  } catch (error: any) {
    console.error('Error syncing leadership data to cloud:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync to cloud',
      synced: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
    };
  }
}

/**
 * Hydrate local stores from cloud
 * 
 * Only hydrates if:
 * - CLOUD_SYNC_ENABLED is true
 * - User is authenticated
 * - Local stores are empty (no overwrite without consent)
 * 
 * Returns summary of what was hydrated.
 */
export async function hydrateLeadershipFromCloud(): Promise<{
  success: boolean;
  error?: string;
  hydrated: {
    callings: number;
    responsibilities: number;
    notes: number;
    events: number;
    observations: number;
  };
}> {
  // Check feature flag
  if (!FLAGS.CLOUD_SYNC_ENABLED) {
    return {
      success: false,
      error: 'Cloud sync is disabled',
      hydrated: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
    };
  }

  // Check authentication
  const user = getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: 'User not authenticated',
      hydrated: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
    };
  }

  try {
    const uid = user.uid;

    // Check if local stores are empty
    const localCallings = useCallingsStore.getState().callings;
    const localResponsibilities = useResponsibilitiesStore.getState().responsibilities;
    const localNotes = useLeadershipNotesStore.getState().notes;
    const localEvents = useEventsStore.getState().events;
    const localObservations = useObservationsStore.getState().observations;

    const hasLocalData =
      localCallings.length > 0 ||
      localResponsibilities.length > 0 ||
      localNotes.length > 0 ||
      localEvents.length > 0 ||
      localObservations.length > 0;

    if (hasLocalData) {
      return {
        success: false,
        error: 'Local data exists. Clear local data first to hydrate from cloud.',
        hydrated: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
      };
    }

    // Fetch from cloud
    const [cloudCallings, cloudResponsibilities, cloudNotes, cloudEvents, cloudObservations] =
      await Promise.all([
        listCallings(uid),
        listResponsibilities(uid),
        listNotes(uid),
        listEvents(uid),
        listObservations(uid),
      ]);

    // Hydrate stores (only if local is empty)
    if (cloudCallings.length > 0) {
      useCallingsStore.setState({ callings: cloudCallings });
    }
    if (cloudResponsibilities.length > 0) {
      useResponsibilitiesStore.setState({ responsibilities: cloudResponsibilities });
    }
    if (cloudNotes.length > 0) {
      useLeadershipNotesStore.setState({ notes: cloudNotes });
    }
    if (cloudEvents.length > 0) {
      useEventsStore.setState({ events: cloudEvents });
    }
    if (cloudObservations.length > 0) {
      useObservationsStore.setState({ observations: cloudObservations });
    }

    return {
      success: true,
      hydrated: {
        callings: cloudCallings.length,
        responsibilities: cloudResponsibilities.length,
        notes: cloudNotes.length,
        events: cloudEvents.length,
        observations: cloudObservations.length,
      },
    };
  } catch (error: any) {
    console.error('Error hydrating leadership data from cloud:', error);
    return {
      success: false,
      error: error.message || 'Failed to hydrate from cloud',
      hydrated: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
    };
  }
}

/**
 * Force hydrate from cloud (overwrites local data)
 * 
 * WARNING: This will overwrite local data. Use with caution.
 * Only use if user explicitly requests it.
 */
export async function forceHydrateLeadershipFromCloud(): Promise<{
  success: boolean;
  error?: string;
  hydrated: {
    callings: number;
    responsibilities: number;
    notes: number;
    events: number;
    observations: number;
  };
}> {
  // Check feature flag
  if (!FLAGS.CLOUD_SYNC_ENABLED) {
    return {
      success: false,
      error: 'Cloud sync is disabled',
      hydrated: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
    };
  }

  // Check authentication
  const user = getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: 'User not authenticated',
      hydrated: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
    };
  }

  try {
    const uid = user.uid;

    // Fetch from cloud
    const [cloudCallings, cloudResponsibilities, cloudNotes, cloudEvents, cloudObservations] =
      await Promise.all([
        listCallings(uid),
        listResponsibilities(uid),
        listNotes(uid),
        listEvents(uid),
        listObservations(uid),
      ]);

    // Force hydrate (overwrite local)
    useCallingsStore.setState({ callings: cloudCallings });
    useResponsibilitiesStore.setState({ responsibilities: cloudResponsibilities });
    useLeadershipNotesStore.setState({ notes: cloudNotes });
    useEventsStore.setState({ events: cloudEvents });
    useObservationsStore.setState({ observations: cloudObservations });

    return {
      success: true,
      hydrated: {
        callings: cloudCallings.length,
        responsibilities: cloudResponsibilities.length,
        notes: cloudNotes.length,
        events: cloudEvents.length,
        observations: cloudObservations.length,
      },
    };
  } catch (error: any) {
    console.error('Error force hydrating leadership data from cloud:', error);
    return {
      success: false,
      error: error.message || 'Failed to force hydrate from cloud',
      hydrated: { callings: 0, responsibilities: 0, notes: 0, events: 0, observations: 0 },
    };
  }
}
