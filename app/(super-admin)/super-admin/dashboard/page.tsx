import { redirect } from 'next/navigation'

/**
 * /super-admin/dashboard redirects to /super-admin.
 * Stub for ROLE_PORTAL_ROUTES["super_admin"].
 */
export default function SuperAdminDashboardRedirect() {
  redirect("/super-admin")
}
