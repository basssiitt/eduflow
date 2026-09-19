import { redirect } from 'next/navigation'

/**
 * Online Admissions Desk has been deprecated and removed.
 * Redirects to Student Directory.
 */
export default function AdminAdmissionsPage() {
  redirect('/admin/students')
}
