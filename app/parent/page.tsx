import { ParentPortal } from '@/components/parent-portal'
import { RoleGate } from '@/components/role-gate'

export default function ParentPage() {
  return <RoleGate role="parent"><ParentPortal /></RoleGate>
}
