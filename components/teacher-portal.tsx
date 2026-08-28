'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchStudents, saveAttendance, uploadVoiceDiary } from '@/lib/live-data'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { Check, ChevronDown, CircleCheck, Mic, Pause, Save, Send, Volume2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OfflineStatusBar, useEduFlow } from '@/components/eduflow-provider'

type Status = 'Present' | 'Absent' | 'Leave'
type Student = { id: number; name: string; father: string; status: Status; note: string }

const initialStudents: Student[] = [
  { id: 1, name: 'Sara Khan', father: 'Imran Khan', status: 'Present', note: '' },
  { id: 2, name: 'Ali Ahmed', father: 'Naveed Ahmed', status: 'Present', note: '' },
  { id: 3, name: 'Zainab Siddiqui', father: 'Rashid Siddiqui', status: 'Leave', note: 'Medical leave' },
  { id: 4, name: 'Bilal Shah', father: 'Tariq Shah', status: 'Present', note: '' },
  { id: 5, name: 'Fatima Malik', father: 'Aamir Malik', status: 'Present', note: '' },
  { id: 6, name: 'Usman Rehman', father: 'Sohail Rehman', status: 'Absent', note: 'Parent informed' },
  { id: 7, name: 'Ayesha Noor', father: 'Khalid Noor', status: 'Present', note: '' },
  { id: 8, name: 'Hamza Iqbal', father: 'Javed Iqbal', status: 'Present', note: '' },
  { id: 9, name: 'Hira Yousuf', father: 'Yousuf Ali', status: 'Present', note: '' },
  { id: 10, name: 'Omar Farooq', father: 'Farooq Ahmed', status: 'Present', note: '' },
]

const subjects = ['English', 'Urdu', 'Mathematics', 'Science', 'Islamiat']
const statusStyles: Record<Status, string> = {
  Present: 'bg-emerald-600 text-white hover:bg-emerald-700',
  Absent: 'bg-rose-600 text-white hover:bg-rose-700',
  Leave: 'bg-amber-500 text-white hover:bg-amber-600',
}

export function TeacherPortal() {
  const [students, setStudents] = useState(initialStudents)
  const [subject, setSubject] = useState('Mathematics')
  const [diary, setDiary] = useState('Math: Exercise 3.2 Questions 1 to 5 on notebook')
  const [recording, setRecording] = useState(false)
  const [published, setPublished] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const { isOnline, queueAction, pendingActions } = useEduFlow()
  const audioRef = useRef<Blob | null>(null)
  useEffect(() => { let active = true; fetchStudents().then(({ data }) => { if (!active || !data?.length) return; setStudents(data.map((row: any, index: number) => ({ id: Number(row.id) || index + 1, name: row.name ?? 'Student', father: row.father_name ?? '', status: 'Present', note: '' }))) }); return () => { active = false } }, [])
  const counts = useMemo(() => ({ Present: students.filter((s) => s.status === 'Present').length, Absent: students.filter((s) => s.status === 'Absent').length, Leave: students.filter((s) => s.status === 'Leave').length }), [students])
  const setStatus = (id: number, status: Status) => { setStudents((current) => current.map((student) => student.id === id ? { ...student, status } : student)); if (!isOnline) queueAction(`Attendance updated for roll 2026-${String(id).padStart(3, '0')}`) }
  const markAll = () => { setStudents((current) => current.map((student) => ({ ...student, status: 'Present' }))); if (!isOnline) queueAction('Mark all students present') }

  return (
    <section className="mx-auto flex max-w-[1500px] flex-col gap-6 pb-28">
      <OfflineStatusBar />
      {!isOnline && <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status"><strong>35 attendance records queued.</strong> Changes are safe on this device and will sync automatically when the connection returns.</div>}
      {isOnline && pendingActions.length > 0 && <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><span><strong>{pendingActions.length} offline change{pendingActions.length === 1 ? '' : 's'}</strong> ready to sync.</span><button type="button" className="font-semibold underline" onClick={() => window.location.reload()}>Sync Now</button></div>}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2"><Badge className="bg-primary/10 text-primary hover:bg-primary/10">Teacher workspace</Badge><span className="text-sm text-muted-foreground">Tuesday, 18 August 2026</span></div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">Teacher Classroom Console</h2>
          <p className="text-muted-foreground">Take attendance, share today&apos;s learning, and keep parents in the loop.</p>
        </div>
        <Badge variant="outline" className="w-fit border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-amber-700">Session 2026-2027</Badge>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm font-medium">Class<select className="h-10 rounded-lg border bg-background px-3 text-sm"><option>Class 5</option><option>Class 6</option><option>Class 7</option></select></label>
          <label className="flex items-center gap-2 text-sm font-medium">Section<select className="h-10 rounded-lg border bg-background px-3 text-sm"><option>Section A</option><option>Section B</option></select></label>
        </div>
        <Button data-testid="btn-mark-all-present" onClick={markAll} className="bg-emerald-600 text-white hover:bg-emerald-700"><Check data-icon="inline-start" />Mark All Present</Button>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border bg-card px-4 py-3 text-sm shadow-sm"><span className="font-semibold">Total: {students.length}</span><span className="text-emerald-700">Present: {counts.Present}</span><span className="text-rose-700">Absent: {counts.Absent}</span><span className="text-amber-700">Leave: {counts.Leave}</span></div>
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Roll No</th><th className="px-4 py-3 font-medium">Student Name</th><th className="px-4 py-3 font-medium">Father&apos;s Name</th><th className="px-4 py-3 font-medium">Attendance</th><th className="px-4 py-3 font-medium">Quick Note</th></tr></thead><tbody className="divide-y">
              {students.map((student) => <tr key={student.id} data-testid="student-row" className="transition-colors hover:bg-muted/20"><td className="px-4 py-3 font-mono text-xs text-muted-foreground">2026-{String(student.id).padStart(3, '0')}</td><td className="px-4 py-3 font-medium">{student.name}</td><td className="px-4 py-3 text-muted-foreground">{student.father}</td><td className="px-4 py-3"><div className="flex w-fit rounded-lg border bg-muted/40 p-1" role="group" aria-label={`Attendance for ${student.name}`}>{(['Present', 'Absent', 'Leave'] as Status[]).map((status) => <button key={status} type="button" aria-pressed={student.status === status} onClick={() => setStatus(student.id, status)} className={`min-w-8 rounded-md px-2 py-1 text-xs font-bold transition-colors ${student.status === status ? statusStyles[status] : 'text-muted-foreground hover:bg-background'}`}>{status[0]}</button>)}</div></td><td className="px-4 py-3"><Input aria-label={`Quick note for ${student.name}`} value={student.note} onChange={(event) => setStudents((current) => current.map((item) => item.id === student.id ? { ...item, note: event.target.value } : item))} placeholder="Add note..." className="h-8 min-w-32 text-xs" /></td></tr>)}
            </tbody></table></div>
          </div>
        </div>

        <aside className="rounded-xl border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Parent communication</p><h3 className="mt-1 text-lg font-semibold">Daily Class Diary &amp; Audio Homework</h3></div><Volume2 className="size-5 text-amber-600" aria-hidden="true" /></div>
          <div className="mt-5 flex flex-wrap gap-1 rounded-lg bg-muted/50 p-1">{subjects.map((item) => <button type="button" key={item} onClick={() => setSubject(item)} className={`rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${subject === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{item}</button>)}</div>
          <button type="button" onClick={() => setRecording((value) => !value)} className={`mt-5 flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors ${recording ? 'border-rose-300 bg-rose-50' : 'border-amber-300 bg-amber-50/60 hover:bg-amber-50'}`} aria-label="Hold or click to record voice note"><span className={`flex size-12 items-center justify-center rounded-full ${recording ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>{recording ? <Pause aria-hidden="true" /> : <Mic aria-hidden="true" />}</span><span className="text-center text-sm font-semibold">{recording ? 'Recording voice note...' : 'Hold / Click to Record Voice Note'}</span>{recording ? <span className="flex items-center gap-1" aria-label="Recording duration"><span className="h-3 w-1 animate-pulse rounded-full bg-rose-500" /><span className="h-5 w-1 animate-pulse rounded-full bg-rose-500 [animation-delay:150ms]" /><span className="h-4 w-1 animate-pulse rounded-full bg-rose-500 [animation-delay:300ms]" /><span className="ml-2 font-mono text-xs text-rose-700">0:14 / 0:30</span></span> : <span className="text-xs text-muted-foreground">Up to 30 seconds</span>}</button>
          <label className="mt-5 flex flex-col gap-2 text-sm font-medium">Written instructions<textarea value={diary} onChange={(event) => setDiary(event.target.value)} rows={4} className="resize-none rounded-lg border bg-background px-3 py-2 text-sm font-normal outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" /></label>
          <Button className="mt-4 w-full" onClick={async () => { const result = await uploadVoiceDiary(audioRef.current ?? new Blob([diary], { type: 'text/plain' }), students[0]?.id ?? 1, diary); if (result.error && isOnline && isSupabaseConfigured) queueAction('Voice diary sync failed; kept locally for retry'); setPublished(true) }}><Send data-icon="inline-start" />Publish Diary to Parents</Button>{published && <p role="status" className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700"><CircleCheck className="size-4" />Voice diary &amp; homework sent to parents via WhatsApp!</p>}
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 px-4 py-3 backdrop-blur md:left-64 md:px-8"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4"><p className="hidden text-sm text-muted-foreground sm:block">Review all rows before finalizing today&apos;s register.</p><Button onClick={async () => { const result = await saveAttendance(students.map((student) => ({ student_id: student.id, status: student.status, note: student.note }))); if (result.error && isOnline && isSupabaseConfigured) queueAction('Attendance sync failed; kept locally for retry'); setFinalized(true) }} className="ml-auto"><Save data-icon="inline-start" />Save &amp; Finalize Today&apos;s Attendance</Button></div></div>
      {finalized && <div className="fixed inset-0 z-20 flex items-center justify-center bg-foreground/30 p-4" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="summary-title" className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl"><div className="flex items-start justify-between"><div><div className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CircleCheck /></div><h3 id="summary-title" className="mt-4 text-xl font-semibold">Attendance finalized</h3><p className="mt-1 text-sm text-muted-foreground">Class 5 · Section A · 18 August 2026</p></div><button type="button" onClick={() => setFinalized(false)} aria-label="Close summary" className="rounded-md p-1 text-muted-foreground hover:bg-muted"><X /></button></div><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-lg bg-emerald-50 p-3 text-center"><p className="text-xl font-semibold text-emerald-700">{counts.Present}</p><p className="text-xs text-muted-foreground">Present</p></div><div className="rounded-lg bg-rose-50 p-3 text-center"><p className="text-xl font-semibold text-rose-700">{counts.Absent}</p><p className="text-xs text-muted-foreground">Absent</p></div><div className="rounded-lg bg-amber-50 p-3 text-center"><p className="text-xl font-semibold text-amber-700">{counts.Leave}</p><p className="text-xs text-muted-foreground">Leave</p></div></div><Button className="mt-5 w-full" onClick={() => setFinalized(false)}>Done</Button></div></div>}
    </section>
  )
}

