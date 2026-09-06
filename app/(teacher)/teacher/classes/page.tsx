import { redirect } from 'next/navigation'

/**
 * /teacher/classes redirects to /teacher (teacher dashboard).
 * Stub for ROLE_PORTAL_ROUTES["teacher"].
 */
export default function TeacherClassesRedirect() {
  redirect("/teacher")
}
