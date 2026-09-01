import { AdminPortal } from '@/components/admin-portal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fee Challans & Management | EduFlow OS',
  description: 'Manage 3-copy fee challans, collections, and student payment receipts.',
}

export default function FeesPage() {
  return <AdminPortal />
}
