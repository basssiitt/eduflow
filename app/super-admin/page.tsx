import { EduFlowShell } from '@/components/eduflow-shell'
import { SuperAdminPortal } from '@/components/super-admin-portal'
import { RoleGate } from '@/components/role-gate'

export default function SuperAdminPage() {
  return (
    <RoleGate role="super-admin"><EduFlowShell>
      <SuperAdminPortal />
    </EduFlowShell></RoleGate>
  )
}
