'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchCurrentStudentData } from '@/lib/live-data'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { DashboardSkeleton } from '@/components/skeleton-cards'
import { cn } from '@/lib/utils'

export default function StudentAttendancePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentStudentData().then(({ data: resData }) => {
      if (resData) setData(resData)
      setLoading(false)
    })
  }, [])

  if (loading) return <DashboardSkeleton />

  const attendanceList = data?.attendance ?? []
  const presentCount = attendanceList.filter((a: any) => a.status === 'Present').length
  const absentCount = attendanceList.filter((a: any) => a.status === 'Absent').length
  const leaveCount = attendanceList.filter((a: any) => a.status === 'Leave').length
  const total = attendanceList.length || 1
  const attendanceRate = Math.round((presentCount / total) * 100)

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/student" className="hover:text-blue-600 transition flex items-center gap-1 text-slate-600">
            <ArrowLeft className="size-3.5" /> Student Workspace
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Attendance Log</span>
        </div>
      </nav>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Attendance Record
        </h1>
        <p className="text-slate-500">
          Track your daily morning roll call, presence streak, and leave approvals.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Term Attendance</span>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{attendanceRate}%</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Qualified for Exams</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Days Present</span>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600">{presentCount}</p>
          <p className="mt-1 text-xs text-slate-500">In current term</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Days Absent</span>
          <p className="mt-3 text-3xl font-extrabold text-rose-600">{absentCount}</p>
          <p className="mt-1 text-xs text-slate-500">Unexcused</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved Leaves</span>
          <p className="mt-3 text-3xl font-extrabold text-amber-600">{leaveCount}</p>
          <p className="mt-1 text-xs text-slate-500">Medical / family</p>
        </div>
      </div>

      {/* Attendance Register Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-bold text-slate-900">Daily Log Entries</h2>
          <p className="text-xs text-slate-500">Official haziri marked by classroom teachers</p>
        </div>

        {attendanceList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-600 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Teacher Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceList.map((row: any, idx: number) => {
                  const status = row.status || 'Present'
                  return (
                    <tr key={row.date || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{row.date}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                            status === 'Present' && 'bg-emerald-50 text-emerald-700',
                            status === 'Absent' && 'bg-rose-50 text-rose-700',
                            status === 'Leave' && 'bg-amber-50 text-amber-700'
                          )}
                        >
                          <span
                            className={cn(
                              'size-1.5 rounded-full',
                              status === 'Present' && 'bg-emerald-500',
                              status === 'Absent' && 'bg-rose-500',
                              status === 'Leave' && 'bg-amber-500'
                            )}
                          />
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{row.note || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <ZeroDataEmptyState
              icon={CalendarCheck}
              title="No attendance records recorded yet"
              description="Your attendance logs will appear here once morning roll calls are finalized."
            />
          </div>
        )}
      </section>
    </div>
  )
}
