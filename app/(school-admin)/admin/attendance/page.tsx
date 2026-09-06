'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { fetchStudents } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CalendarCheck, CheckCircle2, Clock, Download, Search, UserX, Users } from 'lucide-react'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { cn } from '@/lib/utils'

type AttendanceRecord = {
  id: string | number
  student_id: string | number
  student_name: string
  roll_no: string
  class: string
  section: string
  status: 'Present' | 'Absent' | 'Leave'
  note?: string
  date: string
}

export default function AdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [classFilter, setClassFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const loadAttendance = async () => {
    setLoading(true)
    const { data: students } = await fetchStudents()

    if (!isSupabaseConfigured || !supabaseClient) {
      setAttendance([])
      setLoading(false)
      return
    }

    try {
      const { data: attData } = await supabaseClient
        .from('attendance')
        .select('*')
        .eq('date', selectedDate)

      const attMap = new Map((attData || []).map((a: any) => [String(a.student_id), a]))

      if (students && students.length > 0) {
        const records: AttendanceRecord[] = students.map((s: any, idx: number) => {
          const match = attMap.get(String(s.id))
          return {
            id: match?.id ?? `ATT-${s.id}-${selectedDate}`,
            student_id: s.id,
            student_name: s.name || `Student ${idx + 1}`,
            roll_no: s.roll_no || `2026-${String(idx + 1).padStart(3, '0')}`,
            class: s.class || 'Class 5',
            section: s.section || 'A',
            status: (match?.status || 'Present') as 'Present' | 'Absent' | 'Leave',
            note: match?.note || '',
            date: selectedDate,
          }
        })
        setAttendance(records)
      } else {
        setAttendance([])
      }
    } catch {
      setAttendance([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAttendance()
  }, [selectedDate])

  const filtered = useMemo(() => {
    return attendance.filter((a) => {
      const matchesClass = classFilter === 'All' || a.class.includes(classFilter)
      const matchesQuery =
        a.student_name.toLowerCase().includes(query.toLowerCase()) ||
        a.roll_no.toLowerCase().includes(query.toLowerCase())
      return matchesClass && matchesQuery
    })
  }, [attendance, classFilter, query])

  const presentCount = attendance.filter((a) => a.status === 'Present').length
  const absentCount = attendance.filter((a) => a.status === 'Absent').length
  const leaveCount = attendance.filter((a) => a.status === 'Leave').length

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-sky-600 transition flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Attendance Register</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/students" className="hover:text-sky-600 transition font-medium text-slate-500">
            Student Register →
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/teacher" className="hover:text-sky-600 transition font-semibold text-sky-600 dark:text-sky-400">
            Teacher Haziri Console →
          </Link>
        </div>
      </nav>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-500/20 font-semibold">
              Academic Register
            </Badge>
            <span className="text-sm text-slate-500 dark:text-slate-400">Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Daily Attendance Register</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor student haziri records marked by teachers across all sections.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Date
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 text-xs rounded-xl w-40 border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Present Today</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{loading ? '—' : presentCount}</p>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {attendance.length > 0 ? `${Math.round((presentCount / attendance.length) * 100)}% attendance rate` : 'No records'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Absent</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <UserX className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{loading ? '—' : absentCount}</p>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              Unexcused absences
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">On Sanctioned Leave</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{loading ? '—' : leaveCount}</p>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              Medical / planned leave
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
              <button
                key={cls}
                onClick={() => setClassFilter(cls)}
                className={cn(
                  'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all',
                  classFilter === cls
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                {cls}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Search student or roll no..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-4 flex items-center justify-between animate-pulse">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
            ))}
          </div>
        ) : attendance.length === 0 ? (
          <div className="mt-6">
            <ZeroDataEmptyState
              icon={CalendarCheck}
              title="No attendance records found"
              description="No students are enrolled or attendance has not been marked for this date."
            />
          </div>
        ) : (
          <>
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5">Roll No</th>
                      <th className="px-5 py-3.5">Student Name</th>
                      <th className="px-5 py-3.5">Class &amp; Section</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Teacher Note</th>
                      <th className="px-5 py-3.5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((r) => (
                      <tr key={r.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 rounded px-2 py-0.5">
                            {r.roll_no}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{r.student_name}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {r.class} · Section {r.section}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            r.status === 'Present' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-400',
                            r.status === 'Absent' && 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-950/50 dark:text-rose-400',
                            r.status === 'Leave' && 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-950/50 dark:text-amber-400'
                          )}>
                            <span className={cn(
                              'size-1.5 rounded-full',
                              r.status === 'Present' && 'bg-emerald-500',
                              r.status === 'Absent' && 'bg-rose-500',
                              r.status === 'Leave' && 'bg-amber-500'
                            )} aria-hidden="true" />
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">{r.note || '—'}</td>
                        <td className="px-5 py-4 text-xs font-mono text-slate-500 text-right">{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filtered.length} of {attendance.length} attendance entries</span>
              <Button variant="ghost" size="sm" onClick={() => window.print()} disabled={attendance.length === 0} className="hover:text-sky-600">
                <Download className="mr-1.5 size-3.5" /> Print Attendance Sheet
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
