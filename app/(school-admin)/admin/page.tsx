'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, CreditCard, FileText, GraduationCap, ReceiptText, Settings, Users, WalletCards, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchAdminStats, fetchTeachers } from '@/lib/live-data'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchAdminStats(),
      fetchTeachers(),
    ]).then(([adminRes, teacherRes]) => {
      if (adminRes.data) {
        setStats(adminRes.data)
      }
      if (teacherRes.data) {
        setTeacherCount(teacherRes.data.length)
      }
      setLoading(false)
    })
  }, [])

  const paidInvoices = stats.invoices.filter((inv) => inv.status === 'Paid')
  const totalCollected = paidInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0)
  const totalInvoiced = stats.invoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0)
  const presentToday = stats.attendance.filter((att) => att.status === 'Present').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 font-semibold">Campus Overview</Badge>
            <span className="text-sm text-slate-500">Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">School Administration</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor campus enrollment, fee collections, attendance, and financial ledgers.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/students" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 group-hover:text-blue-600 font-medium transition">Enrolled Students</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{loading ? '—' : stats.students}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Active students registered</span>
            <span className="text-blue-600 font-semibold group-hover:underline flex items-center">View list →</span>
          </div>
        </Link>

        <Link href="/admin/teachers" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 group-hover:text-blue-600 font-medium transition">Faculty &amp; Teachers</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <GraduationCap className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{loading ? '—' : teacherCount}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Active campus educators</span>
            <span className="text-blue-600 font-semibold group-hover:underline flex items-center">Manage →</span>
          </div>
        </Link>

        <Link href="/admin/fees" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 group-hover:text-emerald-700 font-medium transition">Fee Collection</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ReceiptText className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">Rs. {loading ? '—' : totalCollected.toLocaleString()}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>
              {totalInvoiced > 0 ? `${Math.round((totalCollected / totalInvoiced) * 100)}% collected` : 'No invoices issued'}
            </span>
            <span className="text-emerald-700 font-semibold group-hover:underline flex items-center">Challans →</span>
          </div>
        </Link>

        <Link href="/admin/attendance" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 group-hover:text-amber-700 font-medium transition">Today&apos;s Attendance</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <CalendarCheck className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {loading ? '—' : stats.attendance.length > 0 ? `${presentToday} Present` : 'View Register'}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>
              {stats.attendance.length > 0 ? `${stats.attendance.length} total marks today` : 'Daily teacher register'}
            </span>
            <span className="text-amber-700 font-semibold group-hover:underline flex items-center">Register →</span>
          </div>
        </Link>
      </div>

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
