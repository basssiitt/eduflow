import { RoleGate } from '@/components/role-gate'
import { SchoolAdminShell } from '@/components/school-admin-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campus Administration | EduFlow OS',
  description: 'School administration, student enrollment, fee challans, and financial operations.',
}

export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGate role="school-admin">
      <SchoolAdminShell>
        {children}
      </SchoolAdminShell>
    </RoleGate>
  )
}
