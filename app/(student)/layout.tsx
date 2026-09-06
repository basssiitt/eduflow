import { StudentShell } from '@/components/student-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Portal | EduFlow OS',
  description: 'View your homework, attendance, exam grades, and teacher diaries.',
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentShell>{children}</StudentShell>
}
