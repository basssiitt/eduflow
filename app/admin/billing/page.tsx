import type { Metadata } from 'next'
import { FinanceWorkspace } from '@/components/finance-workspace'
import { RoleGate } from '@/components/role-gate'
import { EduFlowShell } from '@/components/eduflow-shell'

export const metadata: Metadata = { title: 'Billing & Plan | EduFlow OS', description: 'Manage EduFlow school billing and finance operations.' }

export default function BillingPage() {
  return (
    <RoleGate role="school-admin">
      <EduFlowShell>
        <FinanceWorkspace />
      </EduFlowShell>
    </RoleGate>
  )
}
