import { FinanceWorkspace } from "@/components/finance-workspace"
import type { Metadata } from "next"
import { RoleGate } from '@/components/role-gate'
import { EduFlowShell } from '@/components/eduflow-shell'

export const metadata: Metadata = { title: "Finance Control Center | EduFlow OS", description: "School cashflow, expenses, payroll, and petty cash operations." }

export default function FinancePage() {
  return (
    <RoleGate role="school-admin">
      <EduFlowShell>
        <FinanceWorkspace />
      </EduFlowShell>
    </RoleGate>
  )
}
