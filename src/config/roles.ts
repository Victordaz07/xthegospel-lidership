/**
 * Role Configuration for Leaders App
 * 
 * Simplified role system for ward/stake leaders.
 */

export type UserRoleKey = 'leader';

export const ROLE_DEFINITIONS: Record<UserRoleKey, {
  id: UserRoleKey;
  i18nKey: string;
  icon: string;
  defaultRoute: string;
}> = {
  leader: {
    id: 'leader',
    i18nKey: 'roles.leader.title',
    icon: '👔',
    defaultRoute: '/',
  },
};

export const ALL_ROLES: UserRoleKey[] = ['leader'];

export function normalizeStoredRole(value: string | null): UserRoleKey | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();
  
  if (normalized === 'leader') {
    return 'leader';
  }
  
  return null;
}

export function isValidRole(value: string | null): value is UserRoleKey {
  return value !== null && ALL_ROLES.includes(value as UserRoleKey);
}

export function getRoleDefaultRoute(role: UserRoleKey): string {
  return ROLE_DEFINITIONS[role].defaultRoute;
}

export function getRoleI18nKey(role: UserRoleKey): string {
  return ROLE_DEFINITIONS[role].i18nKey;
}
