'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, CreditCard, FileText, GraduationCap, ReceiptText, Settings, Users, WalletCards, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchAdminStats, fetchTeachers, fetchStudents } from '@/lib/live-data'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<{
    students: number
    attendance: any[]
    invoices: any[]
    expenses: any[]
  }>({
    students: 0,
    attendance: [],
    invoices: [],
    expenses: [],
  })
  const [teacherCount, setTeacherCount] = useState(0)
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchAdminStats(),
      fetchTeachers(),
      fetchStudents(),
    ]).then(([adminRes, teacherRes, studentsRes]) => {
      if (adminRes.data) {
        setStats(adminRes.data)
      }
      if (teacherRes.data) {
        setTeacherCount(teacherRes.data.length)
      }
      if (studentsRes.data) {
        setStudentsList(studentsRes.data)
      }
      setLoading(false)
    })
  }, [])

  const paidInvoices = stats.invoices.filter((inv) => inv.status === 'Paid')
  const totalCollected = paidInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0)
  const totalInvoiced = stats.invoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0)
  const presentToday = stats.attendance.filter((att) => att.status === 'Present' || att.status === 'present').length

  const attendanceRate = useMemo(() => {
    if (!stats.attendance || stats.attendance.length === 0) return 0
    return Math.round((presentToday / stats.attendance.length) * 100)
  }, [stats.attendance, presentToday])

  const uniqueClasses = useMemo(() => {
    const set = new Set(studentsList.map((s: any) => s.class).filter(Boolean))
    return Array.from(set)
  }, [studentsList])

  const classBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of studentsList) {
      const cls = s.class || 'General'
      counts[cls] = (counts[cls] || 0) + 1
    }
    const total = studentsList.length || 1
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      progress: Math.min(100, Math.round((count / total) * 100)),
    }))
  }, [studentsList])

  const [activeGrowthTab, setActiveGrowthTab] = useState<'performance' | 'annual'>('performance')

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header matching Screen 3 */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Admin Portal Dashboard</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">Admin Dashboard · Session 2026–2027</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search in Campus Records..."
              className="h-9 w-64 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>
          <Link
            href="/admin/billing"
            className="inline-flex items-center rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            Manage School
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards with Sparklines (Screen 3) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Students */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">+12%</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-slate-900">
              {loading ? '—' : stats.students.toLocaleString()}
            </p>
            {/* Blue Wave Sparkline */}
            <svg className="h-7 w-20 text-blue-500 shrink-0" viewBox="0 0 100 30" fill="none">
              <path d="M0 20 Q 25 5, 50 18 T 100 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enrolled Students</span>
            <Link href="/admin/students" className="text-blue-600 hover:underline font-semibold">View list →</Link>
          </div>
        </div>

        {/* Metric 2: Active Classes */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Classes</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">Live</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-slate-900">
              {loading ? '—' : uniqueClasses.length.toLocaleString()}
            </p>
            {/* Wave Sparkline */}
            <svg className="h-7 w-20 text-blue-500 shrink-0" viewBox="0 0 100 30" fill="none">
              <path d="M0 22 Q 30 25, 55 10 T 100 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Faculty Sections</span>
            <Link href="/admin/teachers" className="text-blue-600 hover:underline font-semibold">Classes →</Link>
          </div>
        </div>

        {/* Metric 3: Average Metrics / Pass */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Attendance Rate</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Today</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-slate-900">
              {loading ? '—' : `${attendanceRate}%`}
            </p>
            {/* Wave Sparkline */}
            <svg className="h-7 w-20 text-emerald-500 shrink-0" viewBox="0 0 100 30" fill="none">
              <path d="M0 18 Q 20 8, 50 15 T 100 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Campus Register</span>
            <Link href="/admin/attendance" className="text-blue-600 hover:underline font-semibold">Reports →</Link>
          </div>
        </div>

        {/* Metric 4: Faculty & Teachers */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Faculty Staff</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">Active</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-slate-900">
              {loading ? '—' : teacherCount.toLocaleString()}
            </p>
            {/* Wave Sparkline */}
            <svg className="h-7 w-20 text-blue-500 shrink-0" viewBox="0 0 100 30" fill="none">
              <path d="M0 25 Q 35 15, 65 8 T 100 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Overall Campus Rate</span>
            <Link href="/admin/fees" className="text-blue-600 hover:underline font-semibold">Collections →</Link>
          </div>
        </div>
      </div>

      {/* Annual Platform Growth Card with Smooth Blue Curved Area Wave Chart */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Annual Platform Growth</h2>
            <p className="text-xs text-slate-500">Student enrollment &amp; academic progress curve</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveGrowthTab('performance')}
              className={`rounded-full px-4 py-1 text-xs font-bold transition ${
                activeGrowthTab === 'performance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Performance Metrics
            </button>
            <button
              type="button"
              onClick={() => setActiveGrowthTab('annual')}
              className={`rounded-full px-4 py-1 text-xs font-bold transition ${
                activeGrowthTab === 'annual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Annual Metrics
            </button>
          </div>
        </div>

        {/* Smooth Area Wave Chart */}
        <div className="mt-6 relative">
          {/* Floating Data Badge Indicator */}
          <div className="absolute top-8 left-[45%] -translate-x-1/2 z-10 hidden sm:flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white shadow-md">
            <span>Active Enrollment: {loading ? '—' : stats.students}</span>
          </div>

          <svg className="w-full h-48 sm:h-64 overflow-visible" viewBox="0 0 800 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="blueWaveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="110" x2="800" y2="110" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="170" x2="800" y2="170" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="230" x2="800" y2="230" stroke="#e2e8f0" />

            {/* Curved Area Fill */}
            <path
              d="M 0 200 C 120 180, 180 150, 260 120 C 340 90, 390 40, 460 30 C 530 20, 580 90, 660 60 C 720 40, 760 50, 800 40 L 800 230 L 0 230 Z"
              fill="url(#blueWaveGrad)"
            />

            {/* Curved Stroke Line */}
            <path
              d="M 0 200 C 120 180, 180 150, 260 120 C 340 90, 390 40, 460 30 C 530 20, 580 90, 660 60 C 720 40, 760 50, 800 40"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Target Peak Data Point Dot */}
            <circle cx="460" cy="30" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
          </svg>

          {/* X-axis Timestamps */}
          <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-2 px-1">
            <span>22:10</span>
            <span>22:11</span>
            <span>22:12</span>
            <span>22:13</span>
            <span>22:14</span>
            <span>22:15</span>
            <span>22:16</span>
            <span>22:17</span>
            <span>22:18</span>
            <span>22:19</span>
            <span>22:20</span>
          </div>
        </div>
      </div>

      {/* Class Performance Table (Screen 3 Bottom Card) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Class Performance</h2>
            <p className="text-xs text-slate-500">Student enrollment and completion rates by class</p>
          </div>
          <Link href="/admin/students" className="text-xs font-semibold text-blue-600 hover:underline">
            View All Classes →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Class Name</th>
                <th className="pb-3 text-center">Students</th>
                <th className="pb-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    No enrolled students or active classes found for this campus.
                  </td>
                </tr>
              ) : (
                classBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 font-bold text-slate-800">{row.name}</td>
                    <td className="py-3 text-center font-semibold text-slate-700">{row.count}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-bold text-slate-900">{row.progress}%</span>
                        <div className="h-2 w-28 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campus Workspaces & Action Modules */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">Campus Modules &amp; Workspaces</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/students" className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Users className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Student Directory</h3>
            <p className="mt-1 text-xs text-slate-500">Manage enrolled students, parent contact details, and bulk CSV uploads.</p>
          </Link>

          <Link href="/admin/teachers" className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <GraduationCap className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Faculty &amp; Teachers</h3>
            <p className="mt-1 text-xs text-slate-500">Onboard new faculty, assign subjects, and manage campus teaching staff.</p>
          </Link>

          <Link href="/admin/attendance" className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CalendarCheck className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Daily Attendance Register</h3>
            <p className="mt-1 text-xs text-slate-500">Inspect classroom haziri logs, unexcused absences, and section reports.</p>
          </Link>

          <Link href="/admin/fees" className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <ReceiptText className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Fee Challans</h3>
            <p className="mt-1 text-xs text-slate-500">Generate 3-copy bank challans, track collections, and print receipts.</p>
          </Link>

          <Link href="/admin/finance" className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <WalletCards className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Finance &amp; Ledger</h3>
            <p className="mt-1 text-xs text-slate-500">Record vouchers, view expenses, and manage payroll disbursals.</p>
          </Link>

          <Link href="/admin/billing" className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <CreditCard className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Billing &amp; Subscription</h3>
            <p className="mt-1 text-xs text-slate-500">Manage SaaS license tier, SLA status, and campus platform invoices.</p>
          </Link>

          <Link href="/admin/settings" className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Settings className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Campus Settings</h3>
            <p className="mt-1 text-xs text-slate-500">Configure school name, WhatsApp absent broadcasts, and preferences.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
