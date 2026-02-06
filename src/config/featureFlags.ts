/**
 * Feature Flags
 * 
 * Controls optional features. Cloud sync is OFF by default.
 * Can be overridden via environment variable VITE_CLOUD_SYNC_ENABLED.
 */

export const FLAGS = {
  /**
   * Cloud Sync (Beta)
   * 
   * When enabled, leadership toolkit data (callings, responsibilities, notes, events, observations)
   * will sync to Firebase Firestore. Local-first: data always works locally even if sync fails.
   * 
   * Default: false (OFF)
   * Override: Set VITE_CLOUD_SYNC_ENABLED=true in .env.local
   */
  CLOUD_SYNC_ENABLED: import.meta.env.VITE_CLOUD_SYNC_ENABLED === 'true' || false,
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: keyof typeof FLAGS): boolean {
  return FLAGS[flag] === true;
}
