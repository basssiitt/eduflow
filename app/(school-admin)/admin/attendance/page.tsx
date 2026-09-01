'use client'

import { useEffect, useState, useMemo } from 'react'
import { fetchStudents } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarCheck, CheckCircle2, Clock, Download, Search, UserX, Users } from 'lucide-react'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20">
              Academic Register
            </Badge>
            <span className="text-sm text-slate-500 dark:text-slate-400">Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Daily Attendance Register</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor student haziri records marked by teachers across all sections.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Date
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 text-xs rounded-xl w-40"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Present</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{loading ? '—' : presentCount}</p>
          <p className="mt-1 text-xs text-slate-500">
            {attendance.length > 0 ? `${Math.round((presentCount / attendance.length) * 100)}% attendance rate` : 'No records'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Absent</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <UserX className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{loading ? '—' : absentCount}</p>
          <p className="mt-1 text-xs text-slate-500">Unexcused absences</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Leave</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{loading ? '—' : leaveCount}</p>
          <p className="mt-1 text-xs text-slate-500">Medical or sanctioned leave</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
              <button
                key={cls}
                onClick={() => setClassFilter(cls)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  classFilter === cls
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300'
                }`}
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
              className="pl-9 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950"
            />
          </div>
        </div>

        {attendance.length === 0 && !loading ? (
          <div className="mt-6">
            <ZeroDataEmptyState
              icon={CalendarCheck}
              title="No attendance records found"
              description="No students are enrolled or attendance has not been marked for this date."
            />
          </div>
        ) : (
          <>
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5">Roll No</th>
                      <th className="px-4 py-3.5">Student Name</th>
                      <th className="px-4 py-3.5">Class &amp; Section</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Teacher Note</th>
                      <th className="px-4 py-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((r) => (
                      <tr key={r.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-500">{r.roll_no}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{r.student_name}</td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {r.class} · Section {r.section}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            r.status === 'Present' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' :
                            r.status === 'Absent' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' :
                            'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{r.note || '—'}</td>
                        <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filtered.length} of {attendance.length} attendance entries</span>
              <Button variant="ghost" size="sm" onClick={() => window.print()} disabled={attendance.length === 0}>
                <Download className="mr-1.5 size-3.5" /> Print Attendance Sheet
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
