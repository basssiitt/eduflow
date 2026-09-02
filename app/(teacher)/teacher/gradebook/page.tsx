import { TeacherGradebook } from '@/components/teacher-gradebook'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gradebook & Marks | EduFlow OS',
  description: 'Manage student examination scores and report card marks.',
}

export default function TeacherGradebookPage() {
  return <TeacherGradebook />
}
