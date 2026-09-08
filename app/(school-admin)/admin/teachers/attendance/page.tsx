'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  MessageCircle,
  Plus,
  Printer,
  Search,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

type FacultyAttendance = {
  id: string
  code: string
  name: string
  department: string
  timeIn: string
  status: 'Present' | 'Late' | 'Absent' | 'Leave'
  note?: string
}

const initialFaculty: FacultyAttendance[] = [
  { id: '1', code: 'TCH-2026-001', name: 'Muhammad Asad', department: 'Sciences', timeIn: '07:42 AM', status: 'Present', note: 'Morning Assembly Duty' },
  { id: '2', code: 'TCH-2026-002', name: 'Fatima Noor', department: 'Languages', timeIn: '08:05 AM', status: 'Late', note: '15 min late - Traffic' },
  { id: '3', code: 'TCH-2026-003', name: 'Tariq Mehmood', department: 'Sciences', timeIn: '07:35 AM', status: 'Present' },
  { id: '4', code: 'TCH-2026-004', name: 'Ayesha Siddiqua', department: 'Humanities', timeIn: '—', status: 'Leave', note: 'Sick leave approved' },
  { id: '5', code: 'TCH-2026-005', name: 'Bilal Ahmed', department: 'IT', timeIn: '07:50 AM', status: 'Present' },
  { id: '6', code: 'TCH-2026-006', name: 'Zainab Bibi', department: 'Arts & Sports', timeIn: '—', status: 'Absent', note: 'Unexcused' },
]

export default function FacultyAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [faculty, setFaculty] = useState<FacultyAttendance[]>(initialFaculty)
  const [department, setDepartment] = useState('All')
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  const markAllPresent = () => {
    setFaculty(prev => prev.map(f => ({ ...f, status: 'Present', timeIn: f.timeIn === '—' ? '07:45 AM' : f.timeIn })))
    notify('All faculty marked Present for today.')
  }

  const updateStatus = (id: string, status: FacultyAttendance['status']) => {
    setFaculty(prev =>
      prev.map(f => (f.id === id ? { ...f, status, timeIn: status === 'Absent' || status === 'Leave' ? '—' : f.timeIn === '—' ? '07:50 AM' : f.timeIn } : f))
    )
  }

  const filtered = faculty.filter(
    f => (department === 'All' || f.department === department) &&
      (f.name.toLowerCase().includes(query.toLowerCase()) || f.code.toLowerCase().includes(query.toLowerCase()))
  )

  const presentCount = faculty.filter(f => f.status === 'Present').length
  const lateCount = faculty.filter(f => f.status === 'Late').length
  const leaveCount = faculty.filter(f => f.status === 'Leave').length
  const absentCount = faculty.filter(f => f.status === 'Absent').length

  return (
    <div className="space-y-6">
      <nav className="flex items-center justify-between text-xs text-slate-500 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-[#2c1d17] transition flex items-center gap-1 text-slate-600">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <Link href="/admin/teachers" className="hover:text-[#2c1d17] transition text-slate-600">
            Faculty
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Faculty Attendance</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/attendance" className="hover:text-[#2c1d17] transition font-medium text-slate-500">
            Student Attendance →
          </Link>
        </div>
      </nav>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8c6d3b]">Staff Haziri Register</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Faculty Daily Attendance</h1>
          <p className="text-slate-500">Record daily staff check-in timestamps and sync with monthly payroll deductions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} className="rounded-xl border-[#e7e2da] hover:border-[#c5a059] hover:bg-[#faf9f5] hover:text-[#2c1d17]">
            <Printer className="mr-1.5 size-4 text-[#c5a059]" /> Print Haziri Sheet
          </Button>
          <Button onClick={markAllPresent} className="bg-[#2c1d17] hover:bg-[#1e130f] text-white rounded-xl shadow-xs">
            <UserCheck className="mr-1.5 size-4 text-[#c5a059]" /> Mark All Present
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
        <article className="rounded-2xl border border-[#e7e2da] bg-white p-4 shadow-xs hover:border-[#c5a059] transition-all">
          <span className="text-xs font-semibold text-[#5c4a3e]">Present Today</span>
          <p className="mt-2 text-2xl font-black text-emerald-600">{presentCount}</p>
          <span className="text-[10px] text-slate-400">On duty in classrooms</span>
        </article>
        <article className="rounded-2xl border border-[#e7e2da] bg-white p-4 shadow-xs hover:border-[#c5a059] transition-all">
          <span className="text-xs font-semibold text-[#5c4a3e]">Late Arrivals</span>
          <p className="mt-2 text-2xl font-black text-amber-600">{lateCount}</p>
          <span className="text-[10px] text-slate-400">Arrived after 08:00 AM</span>
        </article>
        <article className="rounded-2xl border border-[#e7e2da] bg-white p-4 shadow-xs hover:border-[#c5a059] transition-all">
          <span className="text-xs font-semibold text-[#5c4a3e]">Excused Leave</span>
          <p className="mt-2 text-2xl font-black text-[#2c1d17]">{leaveCount}</p>
          <span className="text-[10px] text-slate-400">Casual / Sick leave</span>
        </article>
        <article className="rounded-2xl border border-[#e7e2da] bg-white p-4 shadow-xs hover:border-[#c5a059] transition-all">
          <span className="text-xs font-semibold text-[#5c4a3e]">Unexcused Absent</span>
          <p className="mt-2 text-2xl font-black text-rose-600">{absentCount}</p>
          <span className="text-[10px] text-slate-400">Auto salary penalty synced</span>
        </article>
      </section>

      {/* Roster & Controls */}
      <section className="rounded-2xl border border-[#e7e2da] bg-white shadow-xs dark:border-[#3d2e24] dark:bg-[#1f1612] overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-[#e7e2da] dark:border-[#3d2e24] bg-[#faf9f5] dark:bg-[#261c16]">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 w-auto rounded-xl border-[#e7e2da] bg-white text-xs font-medium text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
            />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-9 rounded-xl border border-[#e7e2da] dark:border-[#3d2e24] bg-white dark:bg-[#1f1612] px-3 text-xs font-medium text-[#2c1d17] dark:text-[#f7f5f0] focus:border-[#c5a059] focus:outline-none"
            >
              <option>All</option>
              <option>Sciences</option>
              <option>Languages</option>
              <option>Humanities</option>
              <option>IT</option>
              <option>Arts &amp; Sports</option>
            </select>
          </div>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search faculty name or code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 rounded-xl border-[#e7e2da] bg-white text-xs text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e7e2da] dark:border-[#3d2e24] text-[#8c7a6b] text-[10px] uppercase tracking-wider bg-[#faf9f5] dark:bg-[#261c16]">
                <th className="px-5 py-3 font-semibold">Teacher Code</th>
                <th className="px-5 py-3 font-semibold">Faculty Name</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Time-In</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Remarks</th>
                <th className="px-5 py-3 font-semibold text-right">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e2da] dark:divide-[#3d2e24]">
              {filtered.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-[#faf9f5] dark:hover:bg-[#261c16] transition">
                  <td className="px-5 py-3.5 font-mono text-[#8c7a6b] font-semibold">{teacher.code}</td>
                  <td className="px-5 py-3.5 font-bold text-[#2c1d17] dark:text-[#f7f5f0]">{teacher.name}</td>
                  <td className="px-5 py-3.5 text-[#5c4a3e] dark:text-[#c4b5a5]">{teacher.department}</td>
                  <td className="px-5 py-3.5 font-mono text-[#2c1d17] dark:text-[#f7f5f0]">{teacher.timeIn}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      teacher.status === 'Present' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20' :
                      teacher.status === 'Late' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20' :
                      teacher.status === 'Leave' ? 'bg-[#faf9f5] text-[#2c1d17] ring-1 ring-[#e7e2da]' :
                      'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20'
                    }`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#8c7a6b] italic text-[11px]">{teacher.note || '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => updateStatus(teacher.id, 'Present')}
                        className={`size-7 rounded-lg text-xs font-bold transition ${teacher.status === 'Present' ? 'bg-[#166534] text-white' : 'bg-[#faf9f5] text-[#5c4a3e] hover:bg-emerald-50 border border-[#e7e2da]'}`}
                        title="Mark Present"
                      >
                        P
                      </button>
                      <button
                        onClick={() => updateStatus(teacher.id, 'Late')}
                        className={`size-7 rounded-lg text-xs font-bold transition ${teacher.status === 'Late' ? 'bg-[#b45309] text-white' : 'bg-[#faf9f5] text-[#5c4a3e] hover:bg-amber-50 border border-[#e7e2da]'}`}
                        title="Mark Late"
                      >
                        L
                      </button>
                      <button
                        onClick={() => updateStatus(teacher.id, 'Leave')}
                        className={`size-7 rounded-lg text-xs font-bold transition ${teacher.status === 'Leave' ? 'bg-[#2c1d17] text-white' : 'bg-[#faf9f5] text-[#5c4a3e] hover:bg-[#f2efe9] border border-[#e7e2da]'}`}
                        title="Mark Leave"
                      >
                        LV
                      </button>
                      <button
                        onClick={() => updateStatus(teacher.id, 'Absent')}
                        className={`size-7 rounded-lg text-xs font-bold transition ${teacher.status === 'Absent' ? 'bg-[#991b1b] text-white' : 'bg-[#faf9f5] text-[#5c4a3e] hover:bg-rose-50 border border-[#e7e2da]'}`}
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
      </section>
    </div>
  )
}
