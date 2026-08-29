import type { Metadata } from 'next'
import { FinanceWorkspace } from '@/components/finance-workspace'
import { RoleGate } from '@/components/role-gate'

export const metadata: Metadata = { title: 'Billing & Plan | EduFlow OS', description: 'Manage EduFlow school billing and finance operations.' }

export default function BillingPage() {
  return <RoleGate role="school-admin"><FinanceWorkspace /></RoleGate>
}
