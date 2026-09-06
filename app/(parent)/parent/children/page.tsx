import { redirect } from 'next/navigation'

/**
 * /parent/children redirects to /parent (parent dashboard).
 * Stub for ROLE_PORTAL_ROUTES["parent"].
 */
export default function ParentChildrenRedirect() {
  redirect("/parent")
}
