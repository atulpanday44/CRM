/**
 * Central role checks for the CRM.
 * Superadmin and admin have full access; hr has admin-like access for leave/users.
 */

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  HR: 'hr',
  USER: 'user',
  FINANCE: 'finance',
  TECH_SUPPORT: 'tech_support',
};

export const ALLOWED_ROLES_FOR_UI = [
  { value: 'user', label: 'User' },
  { value: 'hr', label: 'HR' },
  { value: 'admin', label: 'Admin' },
  { value: 'finance', label: 'Finance' },
  { value: 'tech_support', label: 'Tech Support' },
];

export function isSuperadmin(role) {
  return (role || '').toLowerCase() === ROLES.SUPERADMIN;
}

export function isAdminOrSuperadmin(role) {
  const r = (role || '').toLowerCase();
  return r === ROLES.ADMIN || r === ROLES.SUPERADMIN;
}

export function isAdminOrHr(role) {
  const r = (role || '').toLowerCase();
  return r === ROLES.ADMIN || r === ROLES.SUPERADMIN || r === ROLES.HR;
}

export function canManageUsers(role) {
  return isAdminOrHr(role);
}

export function canManageLeave(role) {
  return isAdminOrHr(role);
}

export function canAssignTasks(role) {
  return isAdminOrHr(role);
}

export function canAccessAdminPanel(role) {
  return isAdminOrSuperadmin(role);
}
