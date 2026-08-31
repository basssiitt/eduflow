import { AdminPortal } from '@/components/admin-portal'
import { RoleGate } from '@/components/role-gate'
import { EduFlowShell } from '@/components/eduflow-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fee Challans & Arrears | EduFlow OS',
  description: 'Manage 3-copy fee challans, collections, and parent WhatsApp reminders.',
}

export default function FeesPage() {
  return (
    <RoleGate role="school-admin">
      <EduFlowShell>
        <AdminPortal />
      </EduFlowShell>
    </RoleGate>
  )
}
