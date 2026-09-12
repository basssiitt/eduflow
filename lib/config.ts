export const SUPER_ADMIN_EMAILS = [
  'basithunyawrr@gmail.com',
]

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

export function normalizeRole(role: string | null | undefined): string {
  if (!role) return ''
  return role.toLowerCase().trim().replace(/-/g, '_')
}

/** Generic home routes (used by middleware / role-gate fallbacks) */
export const ROLE_HOME_ROUTES: Record<string, string> = {
  super_admin: '/super-admin',
  school_admin: '/admin',
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
  student: '/student',
}

/** Specific portal landing pages per role (used by the OAuth callback) */
export const ROLE_PORTAL_ROUTES: Record<string, string> = {
  super_admin: '/super-admin/dashboard',
  school_admin: '/admin/overview',
  admin: '/admin/overview',
  teacher: '/teacher/classes',
  parent: '/parent/children',
  student: '/student',
}

export function getHomeRoute(role: string | null | undefined, email?: string | null): string {
  if (isSuperAdminEmail(email)) {
    return '/super-admin'
  }
  const normalized = normalizeRole(role)
  if (normalized === 'super_admin') {
    return '/super-admin'
  }
  return ROLE_HOME_ROUTES[normalized] || '/admin'
}
