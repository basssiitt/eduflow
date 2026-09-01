import { RoleGate } from '@/components/role-gate'
import { SuperAdminShell } from '@/components/super-admin-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Super Admin Control Plane | EduFlow OS',
  description: 'Global multi-campus provisioning and tenancy control.',
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGate role="super-admin">
      <SuperAdminShell>
        {children}
      </SuperAdminShell>
    </RoleGate>
  )
}
