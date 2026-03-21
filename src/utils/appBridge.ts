/**
 * App Bridge - Cross-App Communication (Leaders App)
 * 
 * Utilities for receiving data from other xTheGospel apps.
 */

import { UniversalUserProfile, ShareableProfile } from '../types/user';

// ============================================
// APP URLS
// ============================================

export const APP_URLS = {
  member: import.meta.env.VITE_APP_URL_MEMBER || 'https://app.xthegospel.com',
  leader: import.meta.env.VITE_APP_URL_LEADER || 'https://leader.xthegospel.com',
} as const;

// ============================================
// QR CODE PARSING
// ============================================

/**
 * Parse QR code data from a scanned URL or text
 */
export function parseProfileQRData(input: string): { 
  xthegospelId: string; 
  displayName?: string 
} | null {
  try {
    // Direct ID format: XTG-2026-ABC123
    if (/^XTG-\d{4}-[A-Z0-9]{6}$/i.test(input.trim())) {
      return { xthegospelId: input.trim().toUpperCase() };
    }
    
    // Try parsing as URL
    const urlObj = new URL(input);
    const dataParam = urlObj.searchParams.get('data');
    
    if (dataParam) {
      // Encoded data format
      const data = JSON.parse(atob(dataParam));
      if (data.type === 'xtg-profile' && data.id) {
        return {
          xthegospelId: data.id,
          displayName: data.name,
        };
      }
    }
    
    // Try path format: /lookup/XTG-2026-ABC123
    const pathMatch = urlObj.pathname.match(/\/(lookup|profile)\/(XTG-\d{4}-[A-Z0-9]{6})/i);
    if (pathMatch) {
      return { xthegospelId: pathMatch[2].toUpperCase() };
    }
    
    // Try query param: ?xtgId=XTG-2026-ABC123
    const idParam = urlObj.searchParams.get('xtgId') || urlObj.searchParams.get('id');
    if (idParam && /^XTG-\d{4}-[A-Z0-9]{6}$/i.test(idParam)) {
      return { xthegospelId: idParam.toUpperCase() };
    }
    
    return null;
  } catch {
    // Not a URL, check if it's a direct ID
    const match = input.match(/XTG-\d{4}-[A-Z0-9]{6}/i);
    if (match) {
      return { xthegospelId: match[0].toUpperCase() };
    }
    return null;
  }
}

// ============================================
// URL PARAMETER EXTRACTION
// ============================================

/**
 * Check if current URL has xTheGospel ID parameter
 */
export function getXtgIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('xtgId') || params.get('id');
  
  if (idParam && /^XTG-\d{4}-[A-Z0-9]{6}$/i.test(idParam)) {
    return idParam.toUpperCase();
  }
  
  const pathMatch = window.location.pathname.match(
    /\/(profile|lookup)\/(XTG-\d{4}-[A-Z0-9]{6})/i
  );
  
  if (pathMatch) {
    return pathMatch[2].toUpperCase();
  }
  
  return null;
}

// ============================================
// DEEP LINKS
// ============================================

/**
 * Generate a deep link to lookup a specific profile
 */
export function generateLookupLink(xthegospelId: string): string {
  return `${APP_URLS.leader}/?xtgId=${xthegospelId}`;
}

/**
 * Open member app for a specific user
 */
export function openMemberProfile(xthegospelId: string): void {
  const url = `${APP_URLS.member}/profile/${xthegospelId}`;
  window.open(url, '_blank');
}

// ============================================
// CLIPBOARD
// ============================================

/**
 * Read xTheGospel ID from clipboard
 */
export async function readXtgIdFromClipboard(): Promise<string | null> {
  try {
    const text = await navigator.clipboard.readText();
    const parsed = parseProfileQRData(text);
    return parsed?.xthegospelId || null;
  } catch {
    return null;
  }
}
