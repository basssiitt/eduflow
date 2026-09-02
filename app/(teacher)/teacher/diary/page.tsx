import { TeacherDiarySection } from '@/components/teacher-diary'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Voice Diary | EduFlow OS',
  description: 'Record audio voice notes and written diaries for parents.',
}

export default function TeacherDiaryPage() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Class Audio Voice Diary</h1>
        <p className="text-slate-500 dark:text-slate-400">Broadcast homework instructions and classroom updates directly to parents.</p>
      </div>
      <TeacherDiarySection />
    </div>
  )
}
