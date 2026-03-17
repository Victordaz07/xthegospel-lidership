/**
 * Sync Error Logging
 *
 * Technical logging for sync errors. Non-blocking UX.
 * Future: write to users/{uid}/sync_logs or Sentry.
 */

const isDev = import.meta.env.DEV;

export type SyncScope = 'leadership' | 'hydrate' | 'force-hydrate';

export function logSyncError(
  scope: SyncScope,
  error: unknown,
  meta?: Record<string, unknown>
): void {
  const message = error instanceof Error ? error.message : String(error);
  if (isDev) {
    console.error(`[Sync:${scope}]`, message, meta ?? '');
  }
  // Future: write to Firestore users/{uid}/sync_logs or Sentry
}
