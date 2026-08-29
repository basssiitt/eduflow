import { AdminPortal } from "@/components/admin-portal"
import { RoleGate } from '@/components/role-gate'

export default function AdminPage() {
  return <RoleGate role="school-admin"><AdminPortal /></RoleGate>
}
