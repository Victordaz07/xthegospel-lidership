/**
 * Ward Membership Cache
 *
 * LocalStorage cache for ward + membership when cloud fails or offline.
 * Key: xtg:wardMembership:${uid}
 * TTL: 7 days (stale after, but still usable with "Puede estar desactualizado").
 *
 * EPIC 2.1: Ward Cloud Load Hardening.
 */

import type { Ward, UserWardMembership } from '../../types/ward';

const CACHE_KEY_PREFIX = 'xtg:wardMembership:';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface WardMembershipCacheEntry {
  membership: UserWardMembership;
  ward: Ward;
  loadedAt: number;
}

function getCacheKey(uid: string): string {
  return `${CACHE_KEY_PREFIX}${uid}`;
}

export function saveWardMembershipCache(
  uid: string,
  membership: UserWardMembership,
  ward: Ward
): void {
  try {
    const entry: WardMembershipCacheEntry = {
      membership,
      ward,
      loadedAt: Date.now(),
    };
    localStorage.setItem(getCacheKey(uid), JSON.stringify(entry));
  } catch (e) {
    console.warn('Could not save ward membership cache:', e);
  }
}

export function readWardMembershipCache(
  uid: string
): WardMembershipCacheEntry | null {
  try {
    const raw = localStorage.getItem(getCacheKey(uid));
    if (!raw) return null;

    const entry = JSON.parse(raw) as WardMembershipCacheEntry;
    if (!entry?.membership || !entry?.ward || !entry?.loadedAt) return null;

    return entry;
  } catch {
    return null;
  }
}

export function isCacheStale(loadedAt: number): boolean {
  return Date.now() - loadedAt > TTL_MS;
}

export function clearWardMembershipCache(uid: string): void {
  try {
    localStorage.removeItem(getCacheKey(uid));
  } catch {
    // ignore
  }
}
