import { redirect } from 'next/navigation'

/**
 * /admin/overview redirects to /admin (school dashboard).
 * Stub for ROLE_PORTAL_ROUTES["school_admin"].
 */
export default function AdminOverviewRedirect() {
  redirect("/admin")
}
