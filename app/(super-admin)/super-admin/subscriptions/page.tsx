'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  Loader2,
  Phone,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import {
  SchoolSubscription,
  SubscriptionPaymentRecord,
  formatFriendlyDate,
} from '@/lib/subscription'

type Plan = 'Starter' | 'Pro' | 'Enterprise'

const planRates: Record<Plan, number> = {
  Starter: 2500,
  Pro: 5000,
  Enterprise: 12000,
}

const planFeatures: Record<Plan, string[]> = {
  Starter: ['1-Click Haziri Attendance', 'Voice & Text Diaries', 'Basic Gradebook'],
  Pro: ['3-Copy Fee Challans', 'Automated SMS Fee Reminders', 'Automated Term Exam Cards'],
  Enterprise: ['24/7 Gemini AI Companion', 'Full Accounting Ledger', 'Multi-Campus Clustering'],
}

export default function SuperAdminSubscriptionsPage() {
  const [schools, setSchools] = useState<SchoolSubscription[]>([])
  const [payments, setPayments] = useState<SubscriptionPaymentRecord[]>([])
  const [query, setQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 10

  // Payment Recording Modal State
  const [selectedSchool, setSelectedSchool] = useState<SchoolSubscription | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('5000')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [referenceNo, setReferenceNo] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [recordingPayment, setRecordingPayment] = useState(false)
  const [recordSuccess, setRecordSuccess] = useState('')
  const [recordError, setRecordError] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/subscription?all=true')
      if (res.ok) {
        const data = await res.json()
        if (data?.schools && Array.isArray(data.schools)) {
          setSchools(data.schools)
        }
        if (data?.payments && Array.isArray(data.payments)) {
          setPayments(data.payments)
        }
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openPaymentModal = (school: SchoolSubscription) => {
    setSelectedSchool(school)
    setPaymentAmount(String(school.monthlyAmount || 5000))
    setPaymentMethod('bank_transfer')
    setReferenceNo(`MB-${Date.now().toString().slice(-6)}`)
    setPaymentNotes(`Monthly subscription fee for ${school.name}`)
    setRecordSuccess('')
    setRecordError('')
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool) return

    setRecordingPayment(true)
    setRecordSuccess('')
    setRecordError('')

    try {
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: selectedSchool.id,
          amount: Number(paymentAmount) || 5000,
          billingCycle: 'monthly',
          paymentMethod,
          referenceNo: referenceNo.trim() || `REF-${Date.now()}`,
          notes: paymentNotes.trim(),
        }),
      })

      const data = await res.json()
      if (data?.success) {
        setRecordSuccess(
          `Payment of PKR ${Number(paymentAmount).toLocaleString()} recorded! Next billing date scheduled for ${formatFriendlyDate(data.nextBillingDate)}.`
        )
        // Refresh live data
        await loadData()
        setTimeout(() => {
          setSelectedSchool(null)
          setRecordSuccess('')
        }, 1800)
      } else {
        setRecordError(data?.error || 'Failed to record subscription payment.')
      }
    } catch (err: any) {
      setRecordError(err?.message || 'Network error while recording payment.')
    } finally {
      setRecordingPayment(false)
    }
  }

  const activeSchools = schools.filter((s) => s.planStatus === 'active')
  const trialSchools = schools.filter((s) => s.isTrial)
  const totalMrr = activeSchools.reduce((acc, s) => acc + (s.monthlyAmount || 5000), 0)
  const totalArr = totalMrr * 12
  const starterCount = schools.filter((s) => s.planTier === 'starter').length
  const proCount = schools.filter((s) => s.planTier === 'pro').length
  const enterpriseCount = schools.filter((s) => s.planTier === 'enterprise').length

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      const matchesPlan =
        planFilter === 'All' || s.planTier.toLowerCase() === planFilter.toLowerCase()
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && s.planStatus === 'active') ||
        (statusFilter === 'Trial' && s.isTrial) ||
        (statusFilter === 'Past Due' && s.isExpired)

      const matchesQuery =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(query.toLowerCase()) ||
        s.adminEmail.toLowerCase().includes(query.toLowerCase()) ||
        s.city.toLowerCase().includes(query.toLowerCase())

      return matchesPlan && matchesStatus && matchesQuery
    })
  }, [schools, planFilter, statusFilter, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const exportSubscriptionsCsv = () => {
    const headers = [
      'School Name',
      'City',
      'Owner',
      'Admin Email',
      'Phone',
      'Plan Tier',
      'Monthly Rate (PKR)',
      'Status',
      'Trial Ends At',
      'Days Left',
      'First Paid Date',
      'Next Billing Date',
    ]
    const rows = schools.map((s) =>
      [
        s.name,
        s.city,
        s.ownerName,
        s.adminEmail,
        s.phone,
        s.planTier.toUpperCase(),
        s.monthlyAmount,
        s.isTrial ? (s.isExpired ? 'Trial Expired' : 'Trial Active') : 'Active Paid',
        s.trialEndsAt,
        s.daysRemaining,
        s.firstPaidAt || 'Unpaid',
        s.nextBillingDate,
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const headerRow = headers.map((h) => `"${h}"`).join(',')
    const csvContent = [headerRow, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eduflow-tenant-subscriptions.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6 pb-16">
      {/* Breadcrumb Header */}
      <nav className="flex items-center justify-between text-xs text-slate-500 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/super-admin" className="hover:text-blue-600 transition flex items-center gap-1 text-slate-600">
            <ArrowLeft className="size-3.5" /> Control Plane
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Subscriptions &amp; Revenue</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/super-admin/telemetry" className="hover:text-blue-600 transition font-medium text-slate-600">
            Platform Telemetry →
          </Link>
          <span className="text-slate-200">|</span>
          <Link href="/admin" className="hover:text-blue-600 transition font-medium text-slate-600">
            Campus Admin View →
          </Link>
        </div>
      </nav>

      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200/60 font-medium">
              <CreditCard className="mr-1 size-3 text-blue-600" /> Database-Backed SaaS Billing
            </Badge>
            <span className="text-sm text-slate-500">Live Supabase Engine</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Tenant Subscriptions &amp; Revenue
          </h1>
          <p className="text-slate-600">
            Real 30-day trial countdowns, verified first-payment tracking, and automated +1 month renewal schedules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportSubscriptionsCsv}
            disabled={schools.length === 0}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Download className="mr-2 size-4 text-slate-500" /> Export Revenue CSV
          </Button>
          <Link
            href="/super-admin"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-xs"
          >
            <Plus className="mr-1.5 size-4" /> Onboard School
          </Link>
        </div>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Monthly Recurring Revenue</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
            PKR {totalMrr.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">From {activeSchools.length} paying schools</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Annualized Run Rate (ARR)</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Activity className="size-4.5 text-blue-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
            PKR {totalArr.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">12-Month Projected Value</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Trial Pipeline</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="size-4.5 text-amber-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
            {trialSchools.length} Schools on Trial
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {starterCount} Starter · {proCount} Pro · {enterpriseCount} Enterprise
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Avg Revenue / Paying School</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="size-4.5 text-blue-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
            PKR {activeSchools.length > 0 ? Math.round(totalMrr / activeSchools.length).toLocaleString() : '0'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Per active campus per month</p>
        </div>
      </div>

      {/* Plan Tiers Reference Matrix */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(['Starter', 'Pro', 'Enterprise'] as Plan[]).map((p) => (
          <div
            key={p}
            className={`rounded-2xl border p-5 transition-all shadow-xs ${
              p === 'Pro'
                ? 'border-blue-300 bg-blue-50/30'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{p} Tier</span>
              <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-900">
                PKR {planRates[p].toLocaleString()} / mo
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              {planFeatures[p].map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-blue-600 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Subscription Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-base text-slate-900">Tenant Subscription Register</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Exact database timestamps: Trial creation, remaining days, first payment date, and next renewal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200/60 p-1 text-xs">
              {['All', 'Starter', 'Pro', 'Enterprise'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setPlanFilter(tab)
                    setPage(1)
                  }}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                    planFilter === tab
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200/60 p-1 text-xs">
              {['All', 'Active', 'Trial', 'Past Due'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st)
                    setPage(1)
                  }}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                placeholder="Search school, owner, email..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-9 h-9 text-xs rounded-xl border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {schools.length === 0 && !loading ? (
          <div className="p-6">
            <ZeroDataEmptyState
              icon={Receipt}
              title="No tenant subscriptions in database"
              description="Onboard your first school campus or create an account to begin tracking real trials."
              actionLabel="Onboard School"
              onAction={() => window.location.href = '/super-admin'}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-5 py-3.5">School / Tenant</th>
                    <th className="px-5 py-3.5">Owner / Contact</th>
                    <th className="px-5 py-3.5">Plan Tier</th>
                    <th className="px-5 py-3.5">Rate</th>
                    <th className="px-5 py-3.5">Trial / Subscription Status</th>
                    <th className="px-5 py-3.5">First Paid Date</th>
                    <th className="px-5 py-3.5">Next Renewal</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((school) => (
                    <tr key={school.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{school.name}</p>
                        <p className="text-[11px] font-mono text-slate-500">
                          {school.city} · eduflow.pk/{school.slug || school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 18)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Registered: {formatFriendlyDate(school.createdAt)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{school.ownerName || 'School Admin'}</p>
                        <p className="text-xs text-slate-500 font-mono">{school.adminEmail}</p>
                        {school.phone && <p className="text-[11px] text-slate-400 font-mono">{school.phone}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 capitalize">
                          {school.planTier} Tier
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        PKR {school.monthlyAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        {school.isTrial ? (
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                school.isExpired
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {school.isExpired
                                ? 'Trial Expired'
                                : `Trial (${school.daysRemaining} days left)`}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Ends: {formatFriendlyDate(school.trialEndsAt)}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            Active (Paid)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-slate-600">
                        {school.firstPaidAt ? formatFriendlyDate(school.firstPaidAt) : 'Unpaid'}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-900">
                        {formatFriendlyDate(school.nextBillingDate)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => openPaymentModal(school)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-2xs font-medium"
                          >
                            <DollarSign className="mr-1 size-3.5" /> Record Payment
                          </Button>
                          {school.phone && (
                            <a
                              href={`tel:${school.phone.replace(/[^0-9+]/g, '')}`}
                              className="rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              title={`Call ${school.ownerName}`}
                            >
                              <Phone className="size-4" />
                            </a>
                          )}
                          <Link
                            href="/admin"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="size-3 text-slate-400" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {paginated.length} of {filtered.length} tenant schools</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="size-8 p-0 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 font-medium">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="size-8 p-0 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Record Subscription Payment Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Subscription Payment</h3>
                <p className="text-xs text-slate-500">
                  Update database records, activate paid status, and advance billing renewal +1 month.
                </p>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            {recordSuccess && (
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                <span>{recordSuccess}</span>
              </div>
            )}

            {recordError && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800">
                {recordError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="mt-5 space-y-4 text-xs font-semibold text-slate-900">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <span className="text-[11px] text-slate-500 font-medium">Tenant School</span>
                <p className="text-sm font-bold text-slate-900">{selectedSchool.name}</p>
                <p className="text-[11px] text-slate-600 font-mono mt-0.5">{selectedSchool.adminEmail}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                  <span>Current: {selectedSchool.isTrial ? 'Trial Period' : 'Active Subscription'}</span>
                  <span>·</span>
                  <span>First Paid: {selectedSchool.firstPaidAt ? formatFriendlyDate(selectedSchool.firstPaidAt) : 'None recorded'}</span>
                </div>
              </div>

              <div>
                <label className="block mb-1">Amount Paid (PKR)</label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="bank_transfer">Direct Bank Transfer (Meezan Bank IBAN)</option>
                  <option value="payfast">PayFast Online Gateway</option>
                  <option value="cash_cheque">Cash / Cheque Slip</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Reference / Transaction Number</label>
                <Input
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. MB-781920 or Cheque #1290"
                  required
                  className="rounded-xl border-slate-200 text-sm font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">Internal Audit Notes (Optional)</label>
                <Input
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid via IBAN transfer; verified by finance desk"
                  className="rounded-xl border-slate-200 text-sm text-slate-900"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedSchool(null)}
                  className="border-slate-200 text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={recordingPayment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  {recordingPayment ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Recording...
                    </>
                  ) : (
                    <>
                      <Check className="mr-1.5 size-4" /> Confirm &amp; Credit Subscription
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
