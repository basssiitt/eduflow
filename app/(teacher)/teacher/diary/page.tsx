import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TeacherDiarySection } from '@/components/teacher-diary'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Voice Diary | EduFlow OS',
  description: 'Record audio voice notes and written diaries for parents.',
}

export default function TeacherDiaryPage() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/teacher" className="hover:text-emerald-600 transition flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="size-3.5" /> Classroom Haziri
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Audio Voice Diary</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/teacher/gradebook" className="hover:text-emerald-600 transition font-medium text-slate-500">
            Gradebook &amp; Marks →
          </Link>
        </div>
      </nav>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Class Audio Voice Diary</h1>
        <p className="text-slate-500 dark:text-slate-400">Broadcast homework instructions and classroom updates directly to parents.</p>
      </div>
      <TeacherDiarySection />
    </div>
  )
}
