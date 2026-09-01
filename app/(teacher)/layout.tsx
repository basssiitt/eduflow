import { RoleGate } from '@/components/role-gate'
import { TeacherShell } from '@/components/teacher-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teacher Classroom Console | EduFlow OS',
  description: 'Daily classroom attendance, audio voice diaries, and student notes.',
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGate role="teacher">
      <TeacherShell>
        {children}
      </TeacherShell>
    </RoleGate>
  )
}
