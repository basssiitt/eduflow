import { FinanceWorkspace } from "@/components/finance-workspace"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finance Control Center | EduFlow OS",
  description: "School cashflow, expenses, payroll, and petty cash operations.",
}

export default function FinancePage() {
  return <FinanceWorkspace />
}
