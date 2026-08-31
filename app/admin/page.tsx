import { AdminPortal } from "@/components/admin-portal"
import { RoleGate } from '@/components/role-gate'
import { EduFlowShell } from '@/components/eduflow-shell'

export default function AdminPage() {
  return (
    <RoleGate role="school-admin">
      <EduFlowShell>
        <AdminPortal />
      </EduFlowShell>
    </RoleGate>
  )
}
