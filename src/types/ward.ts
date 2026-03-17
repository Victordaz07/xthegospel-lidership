/**
 * Ward (Barrio) Types
 * 
 * Defines the structure for wards/branches and their join codes.
 */

// ============================================================================
// WARD / BARRIO
// ============================================================================

export interface Ward {
  id: string;
  name: string;
  type: 'ward' | 'branch'; // Barrio o Rama
  
  // Stake / District info
  stakeId?: string;
  stakeName?: string;
  stakeType?: 'stake' | 'district'; // Estaca o Distrito
  
  // Location
  country?: string;
  city?: string;
  
  // Join code
  joinCode: string;
  joinCodeCreatedAt: number; // timestamp
  joinCodeCreatedBy: string; // uid del creador
  
  // Metadata
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  
  // Stats (optional, updated periodically)
  memberCount?: number;
  leaderCount?: number;

  /** UIDs de miembros (para reglas Firestore v2). Incluye líderes. */
  memberIds?: string[];
  /** UIDs de líderes (obispado, etc.) con permisos de escritura en ward. */
  leaderIds?: string[];
}

// ============================================================================
// JOIN CODE
// ============================================================================

export interface WardJoinCode {
  code: string;
  wardId: string;
  wardName: string;
  stakeId?: string;
  stakeName?: string;
  
  // Security
  createdAt: number;
  createdBy: string;
  expiresAt?: number; // Optional expiration
  isActive: boolean;
  
  // Usage tracking
  maxUses?: number;
  currentUses: number;
}

// ============================================================================
// USER WARD MEMBERSHIP
// ============================================================================

export interface UserWardMembership {
  wardId: string;
  wardName: string;
  stakeId?: string;
  stakeName?: string;
  joinedAt: number;
  joinedVia: 'code' | 'created' | 'invited';
  /** Si true, puede leer/escribir preparación bautismal. Creator = true, join por code = false. */
  isLeader?: boolean;
}

// ============================================================================
// CREATE WARD REQUEST
// ============================================================================

export interface CreateWardRequest {
  name: string;
  type: 'ward' | 'branch';
  stakeName?: string;
  stakeType?: 'stake' | 'district';
  country?: string;
  city?: string;
}

// ============================================================================
// JOIN WARD REQUEST
// ============================================================================

export interface JoinWardRequest {
  code: string;
}

// ============================================================================
// HELPERS
// ============================================================================

export function generateWardCode(): string {
  // Generate a 6-character alphanumeric code
  // Format: XXX-XXX (e.g., ABC-123)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Format with dash
  return `${code.slice(0, 3)}-${code.slice(3, 6)}`;
}

export function normalizeWardCode(code: string): string {
  // Remove spaces, dashes, and convert to uppercase
  return code.replace(/[\s-]/g, '').toUpperCase();
}

export function formatWardCode(code: string): string {
  // Format code as XXX-XXX
  const normalized = normalizeWardCode(code);
  if (normalized.length !== 6) return code;
  return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}`;
}
