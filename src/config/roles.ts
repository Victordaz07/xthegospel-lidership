/**
 * Role Configuration for Leaders App
 * 
 * Simplified role system for ward/stake leaders.
 * Roles are now managed through AuthContext.
 */

export type UserRoleKey = 'leader' | 'member';

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
  member: {
    id: 'member',
    i18nKey: 'roles.member.title',
    icon: '👤',
    defaultRoute: '/',
  },
};

export const ALL_ROLES: UserRoleKey[] = ['leader', 'member'];

export function isValidRole(value: string | null): value is UserRoleKey {
  return value !== null && ALL_ROLES.includes(value as UserRoleKey);
}

export function getRoleDefaultRoute(role: UserRoleKey): string {
  return ROLE_DEFINITIONS[role].defaultRoute;
}

export function getRoleI18nKey(role: UserRoleKey): string {
  return ROLE_DEFINITIONS[role].i18nKey;
}
