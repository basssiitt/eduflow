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
            <Badge className="bg-[#f7f5f0] text-[#2c1d17] border border-[#e7e2da] hover:bg-[#f7f5f0] font-semibold">Campus Overview</Badge>
            <span className="text-sm text-[#786c62]">Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1e1b18] dark:text-slate-100">School Administration</h1>
          <p className="text-[#786c62] dark:text-slate-400">Monitor campus enrollment, fee collections, attendance, and financial ledgers.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/students" className="group rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] group-hover:text-[#2c1d17] font-medium transition">Enrolled Students</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#2c1d17] text-[#c5a059]">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#1e1b18] dark:text-slate-100">{loading ? '—' : stats.students}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-[#786c62]">
            <span>Active students registered</span>
            <span className="text-[#2c1d17] font-semibold group-hover:underline flex items-center">View list →</span>
          </div>
        </Link>

        <Link href="/admin/teachers" className="group rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] group-hover:text-[#2c1d17] font-medium transition">Faculty &amp; Teachers</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#f7f5f0] text-[#2c1d17] border border-[#e7e2da]">
              <GraduationCap className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#1e1b18] dark:text-slate-100">{loading ? '—' : teacherCount}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-[#786c62]">
            <span>Active campus educators</span>
            <span className="text-[#2c1d17] font-semibold group-hover:underline flex items-center">Manage →</span>
          </div>
        </Link>

        <Link href="/admin/fees" className="group rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] group-hover:text-[#166534] font-medium transition">Fee Collection</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#e8f5e9] text-[#166534] border border-[#c8e6c9]">
              <ReceiptText className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#1e1b18] dark:text-slate-100">Rs. {loading ? '—' : totalCollected.toLocaleString()}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-[#786c62]">
            <span>
              {totalInvoiced > 0 ? `${Math.round((totalCollected / totalInvoiced) * 100)}% collected` : 'No invoices issued'}
            </span>
            <span className="text-[#166534] font-semibold group-hover:underline flex items-center">Challans →</span>
          </div>
        </Link>

        <Link href="/admin/attendance" className="group rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] group-hover:text-[#5D4037] font-medium transition">Today&apos;s Attendance</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#efebe9] text-[#5D4037] border border-[#d7ccc8]">
              <CalendarCheck className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#1e1b18] dark:text-slate-100">
            {loading ? '—' : stats.attendance.length > 0 ? `${presentToday} Present` : 'View Register'}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-[#786c62]">
            <span>
              {stats.attendance.length > 0 ? `${stats.attendance.length} total marks today` : 'Daily teacher register'}
            </span>
            <span className="text-[#5D4037] font-semibold group-hover:underline flex items-center">Register →</span>
          </div>
        </Link>
      </div>

      <div>
        <h2 className="text-base font-bold text-[#1e1b18] dark:text-slate-100 mb-3">Campus Modules &amp; Workspaces</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/students" className="group block rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#2c1d17] text-[#c5a059]">
                <Users className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#2c1d17]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#1e1b18]">Student Directory</h3>
            <p className="mt-1 text-xs text-[#786c62]">Manage enrolled students, parent contact details, and bulk CSV uploads.</p>
          </Link>

          <Link href="/admin/teachers" className="group block rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
                <GraduationCap className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#2c1d17]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#1e1b18]">Faculty &amp; Teachers</h3>
            <p className="mt-1 text-xs text-[#786c62]">Onboard new faculty, assign subjects, and manage campus teaching staff.</p>
          </Link>

          <Link href="/admin/attendance" className="group block rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#e8f5e9] text-[#166534] border border-[#c8e6c9]">
                <CalendarCheck className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#166534]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#1e1b18]">Daily Attendance Register</h3>
            <p className="mt-1 text-xs text-[#786c62]">Inspect classroom haziri logs, unexcused absences, and section reports.</p>
          </Link>

          <Link href="/admin/fees" className="group block rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
                <ReceiptText className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#2c1d17]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#1e1b18]">Fee Challans</h3>
            <p className="mt-1 text-xs text-[#786c62]">Generate 3-copy bank challans, track collections, and print receipts.</p>
          </Link>

          <Link href="/admin/finance" className="group block rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
                <WalletCards className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#2c1d17]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#1e1b18]">Finance &amp; Ledger</h3>
            <p className="mt-1 text-xs text-[#786c62]">Record vouchers, view expenses, and manage payroll disbursals.</p>
          </Link>

          <Link href="/admin/billing" className="group block rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
                <CreditCard className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#2c1d17]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#1e1b18]">Billing &amp; Subscription</h3>
            <p className="mt-1 text-xs text-[#786c62]">Manage SaaS license tier, SLA status, and campus platform invoices.</p>
          </Link>

          <Link href="/admin/settings" className="group block rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs transition hover:border-[#c5a059] hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
                <Settings className="size-5" />
              </div>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#2c1d17]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#1e1b18]">Campus Settings</h3>
            <p className="mt-1 text-xs text-[#786c62]">Configure school name, WhatsApp absent broadcasts, and preferences.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
