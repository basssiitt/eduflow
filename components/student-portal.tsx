'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  Headphones,
  Pause,
  Play,
  Sparkles,
  TrendingUp,
  Volume2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { DashboardSkeleton } from '@/components/skeleton-cards'
import { fetchCurrentStudentData } from '@/lib/live-data'
import { cn } from '@/lib/utils'

type SubjectGrade = {
  subject: string
  totalMarks: number
  obtainedMarks: number
  grade: string
  status: 'Pass' | 'Distinction' | 'Needs Work'
}

const mockSubjects: SubjectGrade[] = [
  { subject: 'Mathematics', totalMarks: 100, obtainedMarks: 92, grade: 'A*', status: 'Distinction' },
  { subject: 'English Language', totalMarks: 100, obtainedMarks: 85, grade: 'A', status: 'Pass' },
  { subject: 'Science (Physics/Chem)', totalMarks: 100, obtainedMarks: 88, grade: 'A', status: 'Distinction' },
  { subject: 'Urdu Literature', totalMarks: 100, obtainedMarks: 79, grade: 'B', status: 'Pass' },
  { subject: 'Islamiat / Pakistan Studies', totalMarks: 100, obtainedMarks: 90, grade: 'A*', status: 'Distinction' },
]

export function StudentPortal() {
  const [data, setData] = useState<{
    student: any
    attendance: any[]
    diaries: any[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentStudentData().then(({ data: resData }) => {
      if (resData) {
        setData(resData)
      }
      setLoading(false)
    })
  }, [])

  const attendanceRate = useMemo(() => {
    if (!data?.attendance || data.attendance.length === 0) return 96
    const present = data.attendance.filter((r) => r.status === 'Present').length
    return Math.round((present / data.attendance.length) * 100)
  }, [data])

  const averageGrade = useMemo(() => {
    const total = mockSubjects.reduce((acc, curr) => acc + curr.obtainedMarks, 0)
    return Math.round(total / mockSubjects.length)
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  const studentName = data?.student?.name || 'Student Learner'
  const studentClass = data?.student?.class ? `Class ${data.student.class} · Section ${data.student.section || 'A'}` : 'Class 8 · Section A'
  const rollNo = data?.student?.roll_no || '08'

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
              {studentClass}
            </Badge>
            <span className="text-xs text-slate-400 font-medium">Roll No: {rollNo}</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {studentName} 👋
          </h1>
          <p className="text-slate-500">
            Check your daily homework, test results, attendance rate, and teacher voice notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/student/grades">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs">
              <Award className="mr-1.5 size-4" /> Full Report Card
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 - Attendance Rate */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Term Attendance</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CalendarCheck className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {attendanceRate}%
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5">
              <TrendingUp className="size-3" /> Excellent Presence
            </span>
          </div>
        </article>

        {/* Card 2 - Term Average */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Average</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Award className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {averageGrade}%
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-800">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5">
              <Sparkles className="size-3 text-blue-600" /> Grade A* (Honors)
            </span>
          </div>
        </article>

        {/* Card 3 - Subject Count */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enrolled Courses</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <BookOpen className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {mockSubjects.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">Matric / Cambridge Stream</p>
        </article>

        {/* Card 4 - Daily Tasks */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Diaries &amp; Tasks</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {data?.diaries?.length ?? 0}
          </p>
          <p className="mt-2 text-xs text-slate-500">Active teacher instructions</p>
        </article>
      </section>

      {/* Main Grid: Homework Diary & Subject Marks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Homework & Audio Voice Diary */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Headphones className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Teacher Homework Diaries</h2>
                <p className="text-xs text-slate-500">Daily instructions and recorded voice notes</p>
              </div>
            </div>
            <Link href="/student/diary" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>

          <div className="p-5 flex-1 flex flex-col gap-4">
            {data?.diaries && data.diaries.length > 0 ? (
              data.diaries.map((diaryItem: any, idx: number) => (
                <div
                  key={diaryItem.id || idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:bg-slate-100/70"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Daily Instruction
                    </span>
                    <time className="text-[11px] text-slate-400">
                      {diaryItem.created_at ? new Date(diaryItem.created_at).toLocaleDateString() : 'Today'}
                    </time>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {diaryItem.note || 'Complete the assigned chapter exercises and prepare for tomorrow\'s test.'}
                  </p>
                  {diaryItem.audio_url && (
                    <div className="mt-3 flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPlayingId(playingId === diaryItem.id ? null : diaryItem.id)}
                        className="h-8 gap-1.5 rounded-lg border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50"
                      >
                        {playingId === diaryItem.id ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                        <span>{playingId === diaryItem.id ? 'Pause Voice Note' : 'Play Voice Note'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <ZeroDataEmptyState
                icon={BookOpen}
                title="No diaries posted today"
                description="Your class teachers haven't published homework or voice notes for today yet."
              />
            )}
          </div>
        </section>

        {/* Academic Marks & Subjects Summary */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Award className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Subject Performance</h2>
                <p className="text-xs text-slate-500">Mid-Term Assessment &amp; Quiz Marks</p>
              </div>
            </div>
            <Link href="/student/grades" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Details →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3 text-center">Score</th>
                  <th className="px-5 py-3 text-center">Grade</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockSubjects.map((item) => (
                  <tr key={item.subject} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {item.subject}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-slate-900">
                      {item.obtainedMarks} / {item.totalMarks}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-bold text-slate-800">
                        {item.grade}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
                          item.status === 'Distinction'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
