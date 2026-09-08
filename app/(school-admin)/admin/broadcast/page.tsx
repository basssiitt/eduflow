import { BroadcastCenter } from '@/components/broadcast-center'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WhatsApp Broadcast Center | EduFlow OS',
  description: 'Dispatch morning haziri alerts, fee reminders, and campus circulars via WhatsApp.',
}

export default function BroadcastPage() {
  return <BroadcastCenter />
}
