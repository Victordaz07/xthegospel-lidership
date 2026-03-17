/**
 * Leadership Sync Bridge
 *
 * Wires cloud sync for leadership data:
 * - On mount: hydrate from cloud if local stores are empty
 * - Autosync with debounce when stores change (online only)
 * - Offline banner
 *
 * Mount in LeadershipCallingsLayout. Only active when FLAGS.CLOUD_SYNC_ENABLED.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FLAGS } from '../../../config/featureFlags';
import {
  hydrateLeadershipFromCloud,
  syncLeadershipToCloud,
} from '../state/sync/leadershipSync';
import { useSyncStatusStore } from '../state/sync/useSyncStatusStore';
import { logSyncError } from '../state/sync/logSyncError';
import { useCallingsStore } from '../state/useCallingsStore';
import { useResponsibilitiesStore } from '../state/useResponsibilitiesStore';
import { useLeadershipNotesStore } from '../state/useLeadershipNotesStore';
import { useEventsStore } from '../state/useEventsStore';
import { useObservationsStore } from '../state/useObservationsStore';

const DEBOUNCE_MS = 1000;

function useDebouncedSync() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setSyncing, setSuccess, setError } = useSyncStatusStore();

  const runSync = useCallback(async () => {
    if (!FLAGS.CLOUD_SYNC_ENABLED || !navigator.onLine) return;

    setSyncing();
    try {
      const result = await syncLeadershipToCloud();
      if (result.success) {
        setSuccess();
      } else {
        setError(result.error ?? 'Error desconocido');
        logSyncError('leadership', new Error(result.error), { result });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al sincronizar';
      setError(msg);
      logSyncError('leadership', err);
    }
  }, [setSyncing, setSuccess, setError]);

  const scheduleSync = useCallback(() => {
    if (!FLAGS.CLOUD_SYNC_ENABLED || !navigator.onLine) return;
    if (useSyncStatusStore.getState().isHydrating) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      runSync();
    }, DEBOUNCE_MS);
  }, [runSync]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return scheduleSync;
}

export default function LeadershipSyncBridge(): React.ReactElement | null {
  const { user } = useAuth();
  const scheduleSync = useDebouncedSync();
  const status = useSyncStatusStore((s) => s.status);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Hydrate on mount if flag ON, user logged in, and local stores empty
  useEffect(() => {
    if (!FLAGS.CLOUD_SYNC_ENABLED || !user) return;

    const runHydrate = async () => {
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

      if (!hasLocalData && navigator.onLine) {
        useSyncStatusStore.getState().setHydrating(true);
        try {
          const result = await hydrateLeadershipFromCloud();
          if (!result.success && result.error && !result.error.includes('Local data exists')) {
            logSyncError('hydrate', new Error(result.error), { result });
          }
        } catch (err) {
          logSyncError('hydrate', err);
        } finally {
          useSyncStatusStore.getState().setHydrating(false);
        }
      }
    };

    runHydrate();
  }, [user?.uid]);

  // Subscribe to store changes for autosync
  useEffect(() => {
    if (!FLAGS.CLOUD_SYNC_ENABLED || !user) return;

    const unsubCallings = useCallingsStore.subscribe(() => scheduleSync());
    const unsubResponsibilities = useResponsibilitiesStore.subscribe(() => scheduleSync());
    const unsubNotes = useLeadershipNotesStore.subscribe(() => scheduleSync());
    const unsubEvents = useEventsStore.subscribe(() => scheduleSync());
    const unsubObservations = useObservationsStore.subscribe(() => scheduleSync());

    return () => {
      unsubCallings();
      unsubResponsibilities();
      unsubNotes();
      unsubEvents();
      unsubObservations();
    };
  }, [user?.uid, scheduleSync]);

  if (!FLAGS.CLOUD_SYNC_ENABLED) return null;

  return (
    <>
      {!isOnline && (
        <div className="sync-offline-banner" role="status">
          Sin conexión: guardaremos los cambios y sincronizaremos al volver.
        </div>
      )}
      {isOnline && status === 'error' && (
        <div className="sync-error-banner" role="alert">
          No se pudo sincronizar. Tus cambios están guardados localmente.
        </div>
      )}
    </>
  );
}
