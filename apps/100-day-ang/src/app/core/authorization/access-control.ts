import type { UserRole } from '../../features/auth/models/auth.model';

export const PERMISSIONS = [
  'dashboard:view',

  'booking:view',
  'booking:create',
  'booking:update',
  'booking:update-status',
  'booking:delete',

  'customer:view',
  'customer:create',
  'customer:update',
  'customer:delete',

  'service:view',
  'service:create',
  'service:update',
  'service:archive',

  'category:view',
  'category:create',
  'category:update',
  'category:delete',

  'staff:view',
  'staff:create',
  'staff:update',
  'staff:delete',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: PERMISSIONS,

  manager: ['dashboard:view', 'booking:view', 'booking:update-status', 'customer:view'],

  staff: ['booking:view', 'booking:update-status'],
};
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  return !!role && ROLE_PERMISSIONS[role].includes(permission);
}
