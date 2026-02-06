/**
 * Role Configuration - Leadership Callings
 * 
 * Sistema de roles basado en llamamientos específicos de La Iglesia.
 * Cada rol tiene permisos y acceso diferente según su responsabilidad.
 */

// ============================================================================
// TIPOS DE ROLES
// ============================================================================

export type LeadershipRole =
  // Obispado
  | 'bishop'
  | 'first_counselor_bishopric'
  | 'second_counselor_bishopric'
  | 'ward_clerk'
  | 'executive_secretary'
  // Presidentes de Organizaciones
  | 'elders_quorum_president'
  | 'relief_society_president'
  | 'sunday_school_president'
  | 'young_women_president'
  | 'young_men_president'
  | 'primary_president'
  // Otros
  | 'ward_mission_leader'
  | 'other_leader';

// ============================================================================
// DEFINICIONES DE ROLES
// ============================================================================

export interface RoleDefinition {
  id: LeadershipRole;
  label: string;
  labelEn: string;
  icon: string;
  organization: string;
  level: 'bishopric' | 'organization' | 'auxiliary';
  permissions: RolePermissions;
}

export interface RolePermissions {
  // Puede ver todos los llamamientos del barrio
  canViewAllCallings: boolean;
  // Puede crear/editar llamamientos
  canManageCallings: boolean;
  // Puede ver todos los miembros
  canViewAllMembers: boolean;
  // Puede ver notas de otros líderes
  canViewOtherNotes: boolean;
  // Puede acceder a configuración del barrio
  canAccessWardSettings: boolean;
  // Puede aprobar llamamientos
  canApproveCallings: boolean;
}

// Permisos por nivel
const BISHOPRIC_PERMISSIONS: RolePermissions = {
  canViewAllCallings: true,
  canManageCallings: true,
  canViewAllMembers: true,
  canViewOtherNotes: true,
  canAccessWardSettings: true,
  canApproveCallings: true,
};

const ORGANIZATION_PERMISSIONS: RolePermissions = {
  canViewAllCallings: false, // Solo su organización
  canManageCallings: true,   // Puede proponer
  canViewAllMembers: true,
  canViewOtherNotes: false,
  canAccessWardSettings: false,
  canApproveCallings: false,
};

const AUXILIARY_PERMISSIONS: RolePermissions = {
  canViewAllCallings: false,
  canManageCallings: false,
  canViewAllMembers: false,
  canViewOtherNotes: false,
  canAccessWardSettings: false,
  canApproveCallings: false,
};

// ============================================================================
// CATÁLOGO DE ROLES
// ============================================================================

export const ROLE_DEFINITIONS: Record<LeadershipRole, RoleDefinition> = {
  // --- OBISPADO ---
  bishop: {
    id: 'bishop',
    label: 'Obispo',
    labelEn: 'Bishop',
    icon: '⛪',
    organization: 'Obispado',
    level: 'bishopric',
    permissions: BISHOPRIC_PERMISSIONS,
  },
  first_counselor_bishopric: {
    id: 'first_counselor_bishopric',
    label: 'Primer Consejero del Obispado',
    labelEn: 'First Counselor (Bishopric)',
    icon: '👔',
    organization: 'Obispado',
    level: 'bishopric',
    permissions: BISHOPRIC_PERMISSIONS,
  },
  second_counselor_bishopric: {
    id: 'second_counselor_bishopric',
    label: 'Segundo Consejero del Obispado',
    labelEn: 'Second Counselor (Bishopric)',
    icon: '👔',
    organization: 'Obispado',
    level: 'bishopric',
    permissions: BISHOPRIC_PERMISSIONS,
  },
  ward_clerk: {
    id: 'ward_clerk',
    label: 'Secretario de Barrio',
    labelEn: 'Ward Clerk',
    icon: '📋',
    organization: 'Obispado',
    level: 'bishopric',
    permissions: {
      ...BISHOPRIC_PERMISSIONS,
      canApproveCallings: false, // No puede aprobar
    },
  },
  executive_secretary: {
    id: 'executive_secretary',
    label: 'Secretario Ejecutivo',
    labelEn: 'Executive Secretary',
    icon: '📅',
    organization: 'Obispado',
    level: 'bishopric',
    permissions: {
      ...BISHOPRIC_PERMISSIONS,
      canApproveCallings: false,
      canManageCallings: false, // Solo coordina
    },
  },

  // --- PRESIDENTES DE ORGANIZACIONES ---
  elders_quorum_president: {
    id: 'elders_quorum_president',
    label: 'Presidente del Cuórum de Élderes',
    labelEn: 'Elders Quorum President',
    icon: '🙏',
    organization: 'Cuórum de Élderes',
    level: 'organization',
    permissions: ORGANIZATION_PERMISSIONS,
  },
  relief_society_president: {
    id: 'relief_society_president',
    label: 'Presidenta de la Sociedad de Socorro',
    labelEn: 'Relief Society President',
    icon: '💜',
    organization: 'Sociedad de Socorro',
    level: 'organization',
    permissions: ORGANIZATION_PERMISSIONS,
  },
  sunday_school_president: {
    id: 'sunday_school_president',
    label: 'Presidente de la Escuela Dominical',
    labelEn: 'Sunday School President',
    icon: '📖',
    organization: 'Escuela Dominical',
    level: 'organization',
    permissions: ORGANIZATION_PERMISSIONS,
  },
  young_women_president: {
    id: 'young_women_president',
    label: 'Presidenta de las Mujeres Jóvenes',
    labelEn: 'Young Women President',
    icon: '🌸',
    organization: 'Mujeres Jóvenes',
    level: 'organization',
    permissions: ORGANIZATION_PERMISSIONS,
  },
  young_men_president: {
    id: 'young_men_president',
    label: 'Presidente de los Hombres Jóvenes',
    labelEn: 'Young Men President',
    icon: '⚡',
    organization: 'Hombres Jóvenes',
    level: 'organization',
    permissions: ORGANIZATION_PERMISSIONS,
  },
  primary_president: {
    id: 'primary_president',
    label: 'Presidenta de la Primaria',
    labelEn: 'Primary President',
    icon: '🌈',
    organization: 'Primaria',
    level: 'organization',
    permissions: ORGANIZATION_PERMISSIONS,
  },

  // --- OTROS ---
  ward_mission_leader: {
    id: 'ward_mission_leader',
    label: 'Líder Misional del Barrio',
    labelEn: 'Ward Mission Leader',
    icon: '🌍',
    organization: 'Misión del Barrio',
    level: 'auxiliary',
    permissions: AUXILIARY_PERMISSIONS,
  },
  other_leader: {
    id: 'other_leader',
    label: 'Otro Líder',
    labelEn: 'Other Leader',
    icon: '👤',
    organization: 'Otro',
    level: 'auxiliary',
    permissions: AUXILIARY_PERMISSIONS,
  },
};

// ============================================================================
// HELPERS
// ============================================================================

export const ALL_ROLES = Object.keys(ROLE_DEFINITIONS) as LeadershipRole[];

export const ROLES_BY_LEVEL = {
  bishopric: ALL_ROLES.filter(r => ROLE_DEFINITIONS[r].level === 'bishopric'),
  organization: ALL_ROLES.filter(r => ROLE_DEFINITIONS[r].level === 'organization'),
  auxiliary: ALL_ROLES.filter(r => ROLE_DEFINITIONS[r].level === 'auxiliary'),
};

export function isValidRole(value: string | null): value is LeadershipRole {
  return value !== null && ALL_ROLES.includes(value as LeadershipRole);
}

export function getRoleDefinition(role: LeadershipRole): RoleDefinition {
  return ROLE_DEFINITIONS[role];
}

export function getRoleLabel(role: LeadershipRole): string {
  return ROLE_DEFINITIONS[role]?.label || 'Líder';
}

export function getRoleIcon(role: LeadershipRole): string {
  return ROLE_DEFINITIONS[role]?.icon || '👤';
}

export function getRolePermissions(role: LeadershipRole): RolePermissions {
  return ROLE_DEFINITIONS[role]?.permissions || AUXILIARY_PERMISSIONS;
}

export function canUserPerform(role: LeadershipRole, action: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(role);
  return permissions[action] || false;
}

// Helper para obtener roles agrupados (para UI de selección)
export function getRolesGrouped(): { label: string; roles: RoleDefinition[] }[] {
  return [
    {
      label: 'Obispado',
      roles: ROLES_BY_LEVEL.bishopric.map(r => ROLE_DEFINITIONS[r]),
    },
    {
      label: 'Presidentes de Organizaciones',
      roles: ROLES_BY_LEVEL.organization.map(r => ROLE_DEFINITIONS[r]),
    },
    {
      label: 'Otros',
      roles: ROLES_BY_LEVEL.auxiliary.map(r => ROLE_DEFINITIONS[r]),
    },
  ];
}
