'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchStudents, saveAttendance, uploadVoiceDiary } from '@/lib/live-data'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { Check, CircleCheck, Mic, Pause, Save, Send, UserRound, Volume2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OfflineStatusBar, useEduFlow } from '@/components/eduflow-provider'

type Status = 'Present' | 'Absent' | 'Leave'
type Student = { id: number | string; name: string; father: string; status: Status; note: string }

const subjects = ['English', 'Urdu', 'Mathematics', 'Science', 'Islamiat']
const statusStyles: Record<Status, string> = {
  Present: 'bg-emerald-600 text-white hover:bg-emerald-700',
  Absent: 'bg-rose-600 text-white hover:bg-rose-700',
  Leave: 'bg-amber-500 text-white hover:bg-amber-600',
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

  return (
    <section className="mx-auto flex max-w-[1500px] flex-col gap-6 pb-28">
      <OfflineStatusBar />
      {!isOnline && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          <strong>Offline Mode:</strong> Changes are saved locally on this device and will sync automatically when the connection is restored.
        </div>
      )}
      {isOnline && pendingActions.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <span><strong>{pendingActions.length} offline change{pendingActions.length === 1 ? '' : 's'}</strong> ready to sync.</span>
          <button type="button" className="font-semibold underline" onClick={() => window.location.reload()}>Sync Now</button>
        </div>
      )}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Teacher Workspace</Badge>
            <span className="text-sm text-muted-foreground">Academic Session · 2026–2027</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">Classroom Console</h2>
          <p className="text-muted-foreground">Take daily attendance, publish voice diaries, and record classroom notes.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm font-medium">Class
            <select className="h-10 rounded-lg border bg-background px-3 text-sm">
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
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Check data-icon="inline-start" className="mr-1 size-4" />Mark All Present
        </Button>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border bg-card px-4 py-3 text-sm shadow-sm">
            <span className="font-semibold">Total: {students.length}</span>
            <span className="text-emerald-700">Present: {counts.Present}</span>
            <span className="text-rose-700">Absent: {counts.Absent}</span>
            <span className="text-amber-700">Leave: {counts.Leave}</span>
          </div>

          {students.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center shadow-xs">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <UserRound className="size-7" />
              </div>
              <h3 className="mt-4 text-base font-semibold">No students in this class roster</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                No enrolled students found. Contact your school administrator to register students.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Roll No</th>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Father / Guardian</th>
                      <th className="px-4 py-3 font-medium">Attendance</th>
                      <th className="px-4 py-3 font-medium">Quick Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((student, idx) => (
                      <tr key={student.id} data-testid="student-row" className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">2026-{String(idx + 1).padStart(3, '0')}</td>
                        <td className="px-4 py-3 font-medium">{student.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{student.father || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex w-fit rounded-lg border bg-muted/40 p-1" role="group" aria-label={`Attendance for ${student.name}`}>
                            {(['Present', 'Absent', 'Leave'] as Status[]).map((status) => (
                              <button
                                key={status}
                                type="button"
                                aria-pressed={student.status === status}
                                onClick={() => setStatus(student.id, status)}
                                className={`min-w-8 rounded-md px-2 py-1 text-xs font-bold transition-colors ${
                                  student.status === status ? statusStyles[status] : 'text-muted-foreground hover:bg-background'
                                }`}
                              >
                                {status[0]}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            aria-label={`Quick note for ${student.name}`}
                            value={student.note}
                            onChange={(event) =>
                              setStudents((current) =>
                                current.map((item) => (item.id === student.id ? { ...item, note: event.target.value } : item))
                              )
                            }
                            placeholder="Add note..."
                            className="h-8 min-w-32 text-xs"
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

        <aside className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Class diary</p>
              <h3 className="mt-1 text-lg font-semibold">Daily Diary &amp; Voice Homework</h3>
            </div>
            <Volume2 className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div className="mt-5 flex flex-wrap gap-1 rounded-lg bg-muted/50 p-1">
            {subjects.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setSubject(item)}
                className={`rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                  subject === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRecording((value) => !value)}
            className={`mt-5 flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors ${
              recording ? 'border-rose-300 bg-rose-50' : 'border-amber-300 bg-amber-50/60 hover:bg-amber-50'
            }`}
            aria-label="Hold or click to record voice note"
          >
            <span className={`flex size-12 items-center justify-center rounded-full ${recording ? 'bg-rose-600 text-white' : 'bg-primary text-primary-foreground'}`}>
              {recording ? <Pause aria-hidden="true" /> : <Mic aria-hidden="true" />}
            </span>
            <span className="text-center text-sm font-semibold">{recording ? 'Recording voice note...' : 'Click to Record Voice Note'}</span>
            <span className="text-xs text-muted-foreground">{recording ? 'Recording in progress' : 'Audio note for parents'}</span>
          </button>
          <label className="mt-5 flex flex-col gap-2 text-sm font-medium">
            Written instructions
            <textarea
              value={diary}
              onChange={(event) => setDiary(event.target.value)}
              placeholder="Type homework instructions for today..."
              rows={4}
              className="resize-none rounded-lg border bg-background px-3 py-2 text-sm font-normal outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <Button
            className="mt-4 w-full"
            disabled={!diary.trim() && !recording}
            onClick={async () => {
              const studentId = students[0]?.id ?? 1
              const result = await uploadVoiceDiary(audioRef.current ?? new Blob([diary], { type: 'text/plain' }), studentId, diary)
              if (result.error && isOnline && isSupabaseConfigured) queueAction('Voice diary sync failed; kept locally for retry')
              setPublished(true)
            }}
          >
            <Send data-icon="inline-start" className="mr-1 size-4" />Publish Diary Entry
          </Button>
          {published && (
            <p role="status" className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <CircleCheck className="size-4" />Diary entry published successfully!
            </p>
          )}
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <p className="hidden text-sm text-muted-foreground sm:block">Review all student entries before saving today&apos;s register.</p>
          <Button onClick={handleSaveAttendance} disabled={saving || students.length === 0} className="ml-auto">
            <Save data-icon="inline-start" className="mr-1 size-4" />
            {saving ? 'Saving...' : "Save & Finalize Today's Attendance"}
          </Button>
        </div>
      </div>

      {finalized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="summary-title" className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CircleCheck />
                </div>
                <h3 id="summary-title" className="mt-4 text-xl font-semibold">Attendance Saved</h3>
                <p className="mt-1 text-sm text-muted-foreground">Academic Register · Session 2026–27</p>
              </div>
              <button type="button" onClick={() => setFinalized(false)} aria-label="Close summary" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-xl font-semibold text-emerald-700">{counts.Present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-3 text-center">
                <p className="text-xl font-semibold text-rose-700">{counts.Absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <p className="text-xl font-semibold text-amber-700">{counts.Leave}</p>
                <p className="text-xs text-muted-foreground">Leave</p>
              </div>
            </div>
            <Button className="mt-5 w-full" onClick={() => setFinalized(false)}>Done</Button>
          </div>
        </div>
      )}
    </section>
  )
}
