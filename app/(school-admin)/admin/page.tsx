'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, ReceiptText, Users, WalletCards, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchAdminStats } from '@/lib/live-data'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats().then(({ data }) => {
      if (data) {
        setStats(data)
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
          <p className="text-muted-foreground">Monitor campus enrollment, fee collections, and financial ledgers.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Enrolled Students</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">{loading ? '—' : stats.students}</p>
          <p className="mt-1 text-xs text-muted-foreground">Active students registered</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fee Collection</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
              <ReceiptText className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">Rs. {loading ? '—' : totalCollected.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalInvoiced > 0 ? `${Math.round((totalCollected / totalInvoiced) * 100)}% of total invoices collected` : 'No invoices issued'}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Today&apos;s Attendance</span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
              <FileText className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold">
            {loading ? '—' : stats.attendance.length > 0 ? `${presentToday} Present` : 'Not recorded'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.attendance.length > 0 ? `${stats.attendance.length} total attendance marks today` : 'Attendance marked by teachers'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/admin/students" className="group block rounded-xl border bg-card p-6 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Student Directory</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage enrolled students, parent contact details, and bulk CSV uploads.</p>
        </Link>

        <Link href="/admin/fees" className="group block rounded-xl border bg-card p-6 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ReceiptText className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Fee Challans</h2>
          <p className="mt-1 text-sm text-muted-foreground">Generate 3-copy bank challans, track collections, and print receipts.</p>
        </Link>

        <Link href="/admin/finance" className="group block rounded-xl border bg-card p-6 shadow-xs transition hover:border-primary/50 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <WalletCards className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Finance &amp; Ledger</h2>
          <p className="mt-1 text-sm text-muted-foreground">Record vouchers, view expenses, and manage payroll disbursals.</p>
        </Link>
      </div>
    </div>
  )
}
