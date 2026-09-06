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
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Campus Overview</Badge>
            <span className="text-sm text-muted-foreground">Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">School Administration</h1>
          <p className="text-muted-foreground">Monitor campus enrollment, fee collections, attendance, and financial ledgers.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/students" className="group rounded-xl border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground group-hover:text-primary font-medium transition">Enrolled Students</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{loading ? '—' : stats.students}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Active students registered</span>
            <span className="text-primary font-semibold group-hover:underline flex items-center">View list →</span>
          </div>
        </Link>

        <Link href="/admin/teachers" className="group rounded-xl border bg-card p-5 shadow-xs transition hover:border-sky-500/50 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground group-hover:text-sky-600 font-medium transition">Faculty &amp; Teachers</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
              <GraduationCap className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{loading ? '—' : teacherCount}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Active campus educators</span>
            <span className="text-sky-600 font-semibold group-hover:underline flex items-center">Manage →</span>
          </div>
        </Link>

        <Link href="/admin/fees" className="group rounded-xl border bg-card p-5 shadow-xs transition hover:border-emerald-500/50 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 font-medium transition">Fee Collection</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <ReceiptText className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">Rs. {loading ? '—' : totalCollected.toLocaleString()}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {totalInvoiced > 0 ? `${Math.round((totalCollected / totalInvoiced) * 100)}% collected` : 'No invoices issued'}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center">Challans →</span>
          </div>
        </Link>

        <Link href="/admin/attendance" className="group rounded-xl border bg-card p-5 shadow-xs transition hover:border-amber-500/50 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground group-hover:text-amber-700 dark:group-hover:text-amber-400 font-medium transition">Today&apos;s Attendance</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <CalendarCheck className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">
            {loading ? '—' : stats.attendance.length > 0 ? `${presentToday} Present` : 'View Register'}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {stats.attendance.length > 0 ? `${stats.attendance.length} total marks today` : 'Daily teacher register'}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline flex items-center">Register →</span>
          </div>
        </Link>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">Campus Modules &amp; Workspaces</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/students" className="group block rounded-xl border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Student Directory</h3>
            <p className="mt-1 text-xs text-muted-foreground">Manage enrolled students, parent contact details, and bulk CSV uploads.</p>
          </Link>

          <Link href="/admin/teachers" className="group block rounded-xl border bg-card p-5 shadow-xs transition hover:border-sky-500/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <GraduationCap className="size-5" />
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-sky-600" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Faculty &amp; Teachers</h3>
            <p className="mt-1 text-xs text-muted-foreground">Onboard new faculty, assign subjects, and manage campus teaching staff.</p>
          </Link>

          <Link href="/admin/attendance" className="group block rounded-xl border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CalendarCheck className="size-5" />
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-emerald-600" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Daily Attendance Register</h3>
            <p className="mt-1 text-xs text-muted-foreground">Inspect classroom haziri logs, unexcused absences, and section reports.</p>
          </Link>

          <Link href="/admin/fees" className="group block rounded-xl border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ReceiptText className="size-5" />
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Fee Challans</h3>
            <p className="mt-1 text-xs text-muted-foreground">Generate 3-copy bank challans, track collections, and print receipts.</p>
          </Link>

          <Link href="/admin/finance" className="group block rounded-xl border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <WalletCards className="size-5" />
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Finance &amp; Ledger</h3>
            <p className="mt-1 text-xs text-muted-foreground">Record vouchers, view expenses, and manage payroll disbursals.</p>
          </Link>

          <Link href="/admin/billing" className="group block rounded-xl border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="size-5" />
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Billing &amp; Subscription</h3>
            <p className="mt-1 text-xs text-muted-foreground">Manage SaaS license tier, SLA status, and campus platform invoices.</p>
          </Link>

          <Link href="/admin/settings" className="group block rounded-xl border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings className="size-5" />
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Campus Settings</h3>
            <p className="mt-1 text-xs text-muted-foreground">Configure school name, WhatsApp absent broadcasts, and preferences.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
