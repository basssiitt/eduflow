'use client'

import { useEffect, useState } from 'react'
import { fetchAdminStats } from '@/lib/live-data'
import { Badge } from '@/components/ui/badge'
import { CalendarCheck, CheckCircle2, UserX, Clock, Users } from 'lucide-react'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats().then(({ data }) => {
      if (data?.attendance) {
        setAttendance(data.attendance)
      }
      setLoading(false)
    })
  }, [])

  const presentCount = attendance.filter((a) => a.status === 'Present').length
  const absentCount = attendance.filter((a) => a.status === 'Absent').length
  const leaveCount = attendance.filter((a) => a.status === 'Leave').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Academic Register</Badge>
            <span className="text-sm text-muted-foreground">Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Campus Attendance Overview</h1>
          <p className="text-muted-foreground">Monitor daily student attendance recorded across all classroom sections.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Present Students</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{loading ? '—' : presentCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Marked present today</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Absent Students</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-700">
              <UserX className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{loading ? '—' : absentCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Marked absent today</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Approved Leaves</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{loading ? '—' : leaveCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Medical or excused leaves</p>
        </div>
      </div>

      {attendance.length === 0 && !loading ? (
        <ZeroDataEmptyState
          icon={CalendarCheck}
          title="No attendance records for today"
          description="Teachers take daily attendance using their 1-click Haziri console. Records will sync here automatically."
        />
      ) : (
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <h2 className="text-base font-semibold">Today&apos;s Attendance Stream</h2>
          <p className="mt-1 text-xs text-muted-foreground">Live register marks recorded for today.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Record #</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Recorded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendance.map((att, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">ATT-{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        att.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                        att.status === 'Absent' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date().toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
