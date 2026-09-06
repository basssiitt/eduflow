'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchStudents, saveAttendance, uploadVoiceDiary } from '@/lib/live-data'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Award, ArrowRight, BookOpen, Check, CircleCheck, Mic, Pause, Save, Send, UserRound, Volume2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OfflineStatusBar, useEduFlow } from '@/components/eduflow-provider'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { cn } from '@/lib/utils'

type Status = 'Present' | 'Absent' | 'Leave'
type Student = { id: number | string; name: string; father: string; status: Status; note: string }

const subjects = ['English', 'Urdu', 'Mathematics', 'Science', 'Islamiat']
const statusStyles: Record<Status, string> = {
  Present: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs',
  Absent: 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs',
  Leave: 'bg-amber-500 text-white hover:bg-amber-600 shadow-2xs',
}

export function TeacherPortal() {
  const [students, setStudents] = useState<Student[]>([])
  const [subject, setSubject] = useState('Mathematics')
  const [diary, setDiary] = useState('')
  const [recording, setRecording] = useState(false)
  const [published, setPublished] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { isOnline, queueAction, pendingActions } = useEduFlow()
  const audioRef = useRef<Blob | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchStudents().then(({ data }) => {
      if (!active) return
      if (data && data.length > 0) {
        setStudents(
          data.map((row: any, index: number) => ({
            id: row.id ?? index + 1,
            name: row.name ?? 'Student',
            father: row.father_name ?? '',
            status: 'Present' as Status,
            note: '',
          }))
        )
      } else {
        setStudents([])
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const counts = useMemo(
    () => ({
      Present: students.filter((s) => s.status === 'Present').length,
      Absent: students.filter((s) => s.status === 'Absent').length,
      Leave: students.filter((s) => s.status === 'Leave').length,
    }),
    [students]
  )

  const setStatus = (id: number | string, status: Status) => {
    setStudents((current) => current.map((student) => (student.id === id ? { ...student, status } : student)))
    if (!isOnline) queueAction(`Attendance updated for student #${id}`)
  }

  const markAll = () => {
    setStudents((current) => current.map((student) => ({ ...student, status: 'Present' })))
    if (!isOnline) queueAction('Mark all students present')
  }

  const handleSaveAttendance = async () => {
    if (students.length === 0) return
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    const payload = students.map((student) => ({
      student_id: student.id,
      status: student.status,
      note: student.note,
      date: today,
    }))

    const result = await saveAttendance(payload)
    if (result.error && isOnline && isSupabaseConfigured) {
      queueAction('Attendance sync failed; kept locally for retry')
    }
    setSaving(false)
    setFinalized(true)
  }

  const handlePublishDiary = () => {
    void (async () => {
      const studentId = students[0]?.id ?? 1
      const result = await uploadVoiceDiary(audioRef.current ?? new Blob([diary], { type: 'text/plain' }), studentId, diary)
      if (result.error && isOnline && isSupabaseConfigured) queueAction('Voice diary sync failed; kept locally for retry')
      setPublished(true)
    })()
  }

  return (
    <section className="mx-auto flex max-w-[1500px] flex-col gap-6 pb-28">
      <OfflineStatusBar />
      {!isOnline && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-xs" role="status">
          <strong>Offline Mode:</strong> Changes are saved locally on this device and will sync automatically when the connection is restored.
        </div>
      )}
      {isOnline && pendingActions.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-xs">
          <span><strong>{pendingActions.length} offline change{pendingActions.length === 1 ? '' : 's'}</strong> ready to sync.</span>
          <button type="button" className="font-semibold underline hover:text-emerald-700" onClick={() => window.location.reload()}>Sync Now</button>
        </div>
      )}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-500/20 font-semibold">
              Teacher Workspace
            </Badge>
            <span className="text-sm text-slate-500 dark:text-slate-400">Academic Session · 2026–2027</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">Classroom Console</h2>
          <p className="text-slate-500 dark:text-slate-400">Take daily attendance, publish voice diaries, and record classroom notes.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Class
            <select className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 text-sm font-medium">
              <option>All Enrolled</option>
              <option>Class 5</option>
              <option>Class 6</option>
              <option>Class 7</option>
              <option>Class 8</option>
              <option>Class 9</option>
              <option>Class 10</option>
            </select>
          </label>
        </div>
        <Button
          data-testid="btn-mark-all-present"
          onClick={markAll}
          disabled={students.length === 0}
          className="bg-sky-600 text-white hover:bg-sky-700 font-semibold shadow-sm shadow-sky-200"
        >
          <Check data-icon="inline-start" className="mr-1.5 size-4" />Mark All Present
        </Button>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{students.length}</p>
          <p className="mt-1 text-xs text-slate-400">Active class roster</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Present</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-600">{counts.Present}</p>
          <p className="mt-1 text-xs text-slate-400">
            {students.length > 0 ? `${Math.round((counts.Present / students.length) * 100)}% attendance` : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Absent</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-rose-600">{counts.Absent}</p>
          <p className="mt-1 text-xs text-slate-400">Requires follow-up</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">On Leave</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-amber-600">{counts.Leave}</p>
          <p className="mt-1 text-xs text-slate-400">Sanctioned absence</p>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          {loading ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="py-4 flex items-center justify-between animate-pulse">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
              <ZeroDataEmptyState
                icon={UserRound}
                title="No students in this class roster"
                description="No enrolled students found. Contact your school administrator to register students."
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5">Roll No</th>
                      <th className="px-5 py-3.5">Student Name</th>
                      <th className="px-5 py-3.5">Father / Guardian</th>
                      <th className="px-5 py-3.5">Attendance</th>
                      <th className="px-5 py-3.5">Quick Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((student, idx) => (
                      <tr key={student.id} data-testid="student-row" className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-4 font-mono text-xs font-bold text-sky-700 dark:text-sky-400">2026-{String(idx + 1).padStart(3, '0')}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{student.name}</td>
                        <td className="px-5 py-4 text-slate-500">{student.father || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex w-fit rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-1" role="group" aria-label={`Attendance for ${student.name}`}>
                            {(['Present', 'Absent', 'Leave'] as Status[]).map((status) => (
                              <button
                                key={status}
                                type="button"
                                aria-pressed={student.status === status}
                                onClick={() => setStatus(student.id, status)}
                                className={`min-w-8 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                  student.status === status ? statusStyles[status] : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800'
                                }`}
                              >
                                {status[0]}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Input
                            aria-label={`Quick note for ${student.name}`}
                            value={student.note}
                            onChange={(event) =>
                              setStudents((current) =>
                                current.map((item) => (item.id === student.id ? { ...item, note: event.target.value } : item))
                              )
                            }
                            placeholder="Add note..."
                            className="h-8 min-w-32 text-xs rounded-lg border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <aside id="diary" className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Class Diary</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">Daily Diary &amp; Voice Homework</h3>
            </div>
            <Link href="/teacher/diary" className="rounded-xl p-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors" title="Open full diary page">
              <Volume2 className="size-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-2">
            <Link href="/teacher/diary" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
              Open Dedicated Voice Diary Studio <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-1 rounded-xl bg-slate-50 dark:bg-slate-950 p-1.5 border border-slate-100 dark:border-slate-800">
            {subjects.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setSubject(item)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  subject === item ? 'bg-white text-slate-900 shadow-xs font-bold dark:bg-slate-800 dark:text-slate-100' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRecording((value) => !value)}
            className={`mt-5 flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all duration-200 ${
              recording ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/20' : 'border-sky-300 bg-sky-50/50 hover:bg-sky-50 dark:border-sky-800 dark:bg-sky-950/20'
            }`}
            aria-label="Hold or click to record voice note"
          >
            <span className={`flex size-12 items-center justify-center rounded-full shadow-sm ${recording ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'}`}>
              {recording ? <Pause aria-hidden="true" /> : <Mic aria-hidden="true" />}
            </span>
            <span className="text-center text-sm font-bold text-slate-900 dark:text-slate-100">{recording ? 'Recording voice note...' : 'Click to Record Voice Note'}</span>
            <span className="text-xs text-slate-500">{recording ? 'Recording in progress' : 'Audio note broadcasts to parents'}</span>
          </button>
          <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Written instructions
            <textarea
              value={diary}
              onChange={(event) => setDiary(event.target.value)}
              placeholder="Type homework instructions for today..."
              rows={4}
              className="resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 py-2 text-sm font-normal outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <Button
            className="mt-4 w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm shadow-sky-200"
            disabled={!diary.trim() && !recording}
            onClick={handlePublishDiary}
          >
            <Send data-icon="inline-start" className="mr-1.5 size-4" />Publish Diary Entry
          </Button>
          {published && (
            <p role="status" className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CircleCheck className="size-4" />Diary entry published successfully!
            </p>
          )}
        </aside>
      </div>

      <section id="gradebook" className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Term Evaluation</span>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">Gradebook &amp; Marks Entry</h3>
            <p className="text-xs text-slate-500">Record midterm and final term examination scores and generate student report cards.</p>
          </div>
          <Link
            href="/teacher/gradebook"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-200 transition-colors"
          >
            <Award className="size-4" /> Open Gradebook Register <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50">
              <BookOpen className="size-5" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Active Examination Session: Mid-Term Examination 2026</p>
              <p className="text-slate-500">Enter marks for Mathematics, English, General Science, and Urdu.</p>
            </div>
          </div>
          <Link href="/teacher/gradebook" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
            Score Entry →
          </Link>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 md:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <p className="hidden text-sm text-slate-500 sm:block">Review all student entries before saving today&apos;s register.</p>
          <Button onClick={handleSaveAttendance} disabled={saving || students.length === 0} className="ml-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm shadow-sky-200">
            <Save data-icon="inline-start" className="mr-1.5 size-4" />
            {saving ? 'Saving...' : "Save & Finalize Today's Attendance"}
          </Button>
        </div>
      </div>

      {finalized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="summary-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CircleCheck className="size-6" />
                </div>
                <h3 id="summary-title" className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">Attendance Saved</h3>
                <p className="mt-1 text-sm text-slate-500">Academic Register · Session 2026–27</p>
              </div>
              <button type="button" onClick={() => setFinalized(false)} aria-label="Close summary" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-center border border-emerald-100">
                <p className="text-xl font-bold text-emerald-700">{counts.Present}</p>
                <p className="text-xs text-slate-500 font-medium">Present</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 text-center border border-rose-100">
                <p className="text-xl font-bold text-rose-700">{counts.Absent}</p>
                <p className="text-xs text-slate-500 font-medium">Absent</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-center border border-amber-100">
                <p className="text-xl font-bold text-amber-700">{counts.Leave}</p>
                <p className="text-xs text-slate-500 font-medium">Leave</p>
              </div>
            </div>
            <Button className="mt-5 w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs" onClick={() => setFinalized(false)}>Done</Button>
          </div>
        </div>
      )}
    </section>
  )
}
