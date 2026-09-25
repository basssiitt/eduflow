const DEFAULT_SUPER_ADMIN_EMAILS = [
  'basithunyawrr@gmail.com',
]

export const SUPER_ADMIN_EMAILS: string[] = (() => {
  const envEmails = process.env.SUPER_ADMIN_EMAILS
  const parsed = envEmails
    ? envEmails.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : []
  return Array.from(new Set([...DEFAULT_SUPER_ADMIN_EMAILS, ...parsed]))
})()

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const clean = email.toLowerCase().trim()
  return SUPER_ADMIN_EMAILS.includes(clean)
}

export function normalizeRole(role: string | null | undefined): string {
  if (!role) return ''
  return role.toLowerCase().trim().replace(/-/g, '_')
}

/**
 * 3 Public Portals:
 * 1. School Admin (/admin) - School Owner
 * 2. Teacher (/teacher) - Teacher Workspace
 * 3. Parent (/parent) - Parents Portal (includes children learning progress, attendance, and reports)
 *
 * 1 Hidden/Private Portal:
 * Super Admin (/super-admin) - Website Owner Exclusive (basithunyawrr@gmail.com)
 */
export const ROLE_HOME_ROUTES: Record<string, string> = {
  super_admin: '/super-admin',
  school_admin: '/admin',
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
  student: '/parent', // Student portal is merged into Parents Portal
}

/** Specific portal landing pages per role (used by the OAuth callback) */
export const ROLE_PORTAL_ROUTES: Record<string, string> = {
  super_admin: '/super-admin/dashboard',
  school_admin: '/admin/overview',
  admin: '/admin/overview',
  teacher: '/teacher/classes',
  parent: '/parent/children',
  student: '/parent/children', // Student portal is merged into Parents Portal
}

export function getHomeRoute(role: string | null | undefined, email?: string | null): string {
  if (isSuperAdminEmail(email)) {
    return '/super-admin'
  }
  const normalized = normalizeRole(role)
  if (normalized === 'super_admin') {
    return isSuperAdminEmail(email) ? '/super-admin' : '/admin'
  }
  return ROLE_HOME_ROUTES[normalized] || '/admin'
}
