import { FinanceWorkspace } from '@/components/finance-workspace'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing & Plan | EduFlow OS',
  description: 'Manage EduFlow school billing and finance operations.',
}

export default function BillingPage() {
  return <FinanceWorkspace />
}
