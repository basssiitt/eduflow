'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Printer,
  Search,
  UserCheck,
  Users,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { fetchTeachers } from '@/lib/live-data'

type FacultyAttendance = {
  id: string
  code: string
  name: string
  department: string
  timeIn: string
  status: 'Present' | 'Late' | 'Absent' | 'Leave'
  note?: string
}

export default function FacultyAttendancePage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [faculty, setFaculty] = useState<FacultyAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  useEffect(() => {
    async function loadTeachers() {
      setLoading(true)
      try {
        const res = await fetchTeachers()
        const teachers = res.data || []

        let savedRecords: Record<string, Partial<FacultyAttendance>> = {}
        if (typeof window !== 'undefined') {
          try {
            const cached = localStorage.getItem(`eduflow_faculty_attendance_${selectedDate}`)
            if (cached) savedRecords = JSON.parse(cached)
          } catch {}
        }

        const list: FacultyAttendance[] = teachers.map((t) => {
          const idStr = String(t.id)
          const saved = savedRecords[idStr]
          return {
            id: idStr,
            code: t.employee_code || `TCH-${t.id}`,
            name: t.name,
            department: t.department || 'Academics',
            timeIn: saved?.timeIn || '07:45 AM',
            status: (saved?.status as FacultyAttendance['status']) || 'Present',
            note: saved?.note || '',
          }
        })
        setFaculty(list)
      } finally {
        setLoading(false)
      }
    }

    loadTeachers()
  }, [selectedDate])

  const saveAttendanceState = (updated: FacultyAttendance[]) => {
    setFaculty(updated)
    if (typeof window !== 'undefined') {
      const recordsMap: Record<string, Partial<FacultyAttendance>> = {}
      for (const f of updated) {
        recordsMap[f.id] = { status: f.status, timeIn: f.timeIn, note: f.note }
      }
      try {
        localStorage.setItem(`eduflow_faculty_attendance_${selectedDate}`, JSON.stringify(recordsMap))
      } catch {}
    }
  }

  const markAllPresent = () => {
    if (faculty.length === 0) return
    const updated = faculty.map(f => ({
      ...f,
      status: 'Present' as const,
      timeIn: f.timeIn === '—' ? '07:45 AM' : f.timeIn,
    }))
    saveAttendanceState(updated)
    notify('All faculty marked Present for today.')
  }

  const updateStatus = (id: string, status: FacultyAttendance['status']) => {
    const updated = faculty.map(f =>
      f.id === id
        ? {
            ...f,
            status,
            timeIn: status === 'Absent' || status === 'Leave' ? '—' : f.timeIn === '—' ? '07:50 AM' : f.timeIn,
          }
        : f
    )
    saveAttendanceState(updated)
  }

  const filtered = faculty.filter(
    f => f.name.toLowerCase().includes(query.toLowerCase()) || f.code.toLowerCase().includes(query.toLowerCase())
  )

  const presentCount = faculty.filter(f => f.status === 'Present').length
  const lateCount = faculty.filter(f => f.status === 'Late').length
  const leaveCount = faculty.filter(f => f.status === 'Leave').length
  const absentCount = faculty.filter(f => f.status === 'Absent').length

  return (
    <div className="space-y-6">
      <nav className="flex items-center justify-between text-xs text-slate-500 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition flex items-center gap-1 text-slate-600">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <Link href="/admin/teachers" className="hover:text-blue-600 transition text-slate-600">
            Faculty
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Faculty Attendance</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/attendance" className="hover:text-blue-600 transition font-medium text-slate-500">
            Student Attendance →
          </Link>
        </div>
      </nav>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Staff Haziri Register</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Faculty Daily Attendance</h1>
          <p className="text-slate-500">Record daily staff check-in timestamps and sync with monthly payroll deductions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
            <Printer className="mr-1.5 size-4 text-slate-500" /> Print Haziri Sheet
          </Button>
          <Button
            onClick={markAllPresent}
            disabled={faculty.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs font-semibold"
          >
            <UserCheck className="mr-1.5 size-4 text-white" /> Mark All Present
          </Button>
        </div>
      </header>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <section className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all">
          <span className="text-xs font-semibold text-slate-500">Present Today</span>
          <p className="mt-2 text-2xl font-black text-emerald-600">{presentCount}</p>
          <span className="text-[10px] text-slate-400">On duty in classrooms</span>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all">
          <span className="text-xs font-semibold text-slate-500">Late Arrivals</span>
          <p className="mt-2 text-2xl font-black text-amber-600">{lateCount}</p>
          <span className="text-[10px] text-slate-400">Arrived after 08:00 AM</span>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all">
          <span className="text-xs font-semibold text-slate-500">Excused Leave</span>
          <p className="mt-2 text-2xl font-black text-slate-800">{leaveCount}</p>
          <span className="text-[10px] text-slate-400">Casual / Sick leave</span>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all">
          <span className="text-xs font-semibold text-slate-500">Unexcused Absent</span>
          <p className="mt-2 text-2xl font-black text-rose-600">{absentCount}</p>
          <span className="text-[10px] text-slate-400">Auto salary penalty synced</span>
        </article>
      </section>

      {/* Roster & Controls */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 w-auto rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
            />
          </div>
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
              <Input
                placeholder="Search faculty name or code..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 pl-9 rounded-xl border-slate-200 bg-white text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="size-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-medium text-slate-500">Loading faculty attendance records...</p>
          </div>
        ) : faculty.length === 0 ? (
          <div className="p-6">
            <ZeroDataEmptyState
              icon={Users}
              title="No Faculty Members Found"
              description="Your school does not have any registered faculty members yet. Add teachers in the Faculty Directory to begin tracking daily attendance and payroll deductions."
              actionLabel="Add Faculty Member"
              onAction={() => router.push('/admin/teachers')}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No teachers matched your search &quot;{query}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 text-[10px] uppercase tracking-wider bg-slate-50 font-semibold">
                  <th className="px-5 py-3 font-semibold">Teacher Code</th>
                  <th className="px-5 py-3 font-semibold">Faculty Name</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Time-In</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Remarks</th>
                  <th className="px-5 py-3 font-semibold text-right">Quick Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-mono text-slate-500 font-semibold">{teacher.code}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{teacher.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{teacher.department}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-800">{teacher.timeIn}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        teacher.status === 'Present' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20' :
                        teacher.status === 'Late' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20' :
                        teacher.status === 'Leave' ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' :
                        'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20'
                      }`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 italic text-[11px]">{teacher.note || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => updateStatus(teacher.id, 'Present')}
                          className={`size-7 rounded-lg text-xs font-bold transition ${teacher.status === 'Present' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'}`}
                          title="Mark Present"
                        >
                          P
                        </button>
                        <button
                          onClick={() => updateStatus(teacher.id, 'Late')}
                          className={`size-7 rounded-lg text-xs font-bold transition ${teacher.status === 'Late' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'}`}
                          title="Mark Late"
                        >
                          L
                        </button>
                        <button
                          onClick={() => updateStatus(teacher.id, 'Leave')}
                          className={`size-7 rounded-lg text-xs font-bold transition ${teacher.status === 'Leave' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                          title="Mark Leave"
                        >
                          LV
                        </button>
                        <button
                          onClick={() => updateStatus(teacher.id, 'Absent')}
                          className={`size-7 rounded-lg text-xs font-bold transition ${teacher.status === 'Absent' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'}`}
                          title="Mark Absent"
                        >
                          A
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
