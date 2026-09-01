import { RoleGate } from '@/components/role-gate'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parent Portal | EduFlow OS',
  description: 'Track student attendance, voice diaries, homework, and fee payment receipts.',
}

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGate role="parent">
      {children}
    </RoleGate>
  )
}
