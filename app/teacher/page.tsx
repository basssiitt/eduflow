import { EduFlowShell } from '@/components/eduflow-shell'
import { TeacherPortal } from '@/components/teacher-portal'
import { RoleGate } from '@/components/role-gate'

export default function TeacherPage() {
  return (
    <RoleGate role="teacher"><EduFlowShell>
      <TeacherPortal />
    </EduFlowShell></RoleGate>
  )
}
