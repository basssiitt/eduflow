'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  ExternalLink,
  MessageCircle,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'

type Plan = 'Starter' | 'Pro' | 'Enterprise'
type SubscriptionStatus = 'Active' | 'Trial' | 'Past Due' | 'Suspended'

type CampusSubscription = {
  id: string | number
  name: string
  city: string
  owner: string
  phone: string
  plan: Plan
  students: number
  status: SubscriptionStatus
  slug?: string
  billingCycle: 'Monthly' | 'Annual'
  nextRenewal: string
  created_at?: string
}

const planRates: Record<Plan, number> = {
  Starter: 2500,
  Pro: 5000,
  Enterprise: 12000,
}

const planFeatures: Record<Plan, string[]> = {
  Starter: ['1-Click Haziri Attendance', 'Voice & Text Diaries', 'Basic Gradebook'],
  Pro: ['3-Copy Fee Challans', 'WhatsApp Fee Reminders', 'Automated Term Exam Cards'],
  Enterprise: ['24/7 Gemini AI Companion', 'Full Accounting Ledger', 'Multi-Campus Clustering'],
}

export default function SuperAdminSubscriptionsPage() {
  const [campuses, setCampuses] = useState<CampusSubscription[]>([])
  const [query, setQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 10

  const loadData = async () => {
    setLoading(true)
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('campuses')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          setCampuses(
            data.map((c: any, idx: number) => ({
              id: c.id ?? idx + 1,
              name: c.name || 'Unnamed Campus',
              city: c.city || 'Karachi',
              owner: c.owner || 'Principal',
              phone: c.phone || '',
              plan: (c.plan as Plan) || 'Starter',
              students: Number(c.students) || 0,
              status: (c.status as SubscriptionStatus) || 'Active',
              slug: c.slug || '',
              billingCycle: 'Monthly',
              nextRenewal: '10 Oct 2026',
            }))
          )
        } else {
          setCampuses([])
        }
      } catch {
        setCampuses([])
      }
    } else {
      setCampuses([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const changePlan = async (id: string | number, nextPlan: Plan) => {
    setCampuses((items) =>
      items.map((campus) => (campus.id === id ? { ...campus, plan: nextPlan } : campus))
    )

    if (isSupabaseConfigured && supabaseClient) {
      try {
        await supabaseClient.from('campuses').update({ plan: nextPlan }).eq('id', id)
      } catch {}
    }
  }

  const activeCampuses = campuses.filter((c) => c.status === 'Active')
  const totalMrr = activeCampuses.reduce((acc, c) => acc + (planRates[c.plan] || 2500), 0)
  const totalArr = totalMrr * 12
  const starterCount = activeCampuses.filter((c) => c.plan === 'Starter').length
  const proCount = activeCampuses.filter((c) => c.plan === 'Pro').length
  const enterpriseCount = activeCampuses.filter((c) => c.plan === 'Enterprise').length

  const filtered = useMemo(() => {
    return campuses.filter((c) => {
      const matchesPlan = planFilter === 'All' || c.plan === planFilter
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.owner.toLowerCase().includes(query.toLowerCase()) ||
        c.city.toLowerCase().includes(query.toLowerCase())
      return matchesPlan && matchesQuery
    })
  }, [campuses, planFilter, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const exportSubscriptionsCsv = () => {
    const headers = ['School Name', 'City', 'Owner', 'Phone', 'Plan', 'Monthly Rate (PKR)', 'Status', 'Renewal Date']
    const rows = campuses.map((c) =>
      [c.name, c.city, c.owner, c.phone, c.plan, planRates[c.plan], c.status, c.nextRenewal]
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
          <Link href="/super-admin" className="hover:text-[#c5a059] transition flex items-center gap-1 text-[#5c4a3e]">
            <ArrowLeft className="size-3.5" /> Control Plane
          </Link>
          <span>/</span>
          <span className="text-[#2c1d17] font-semibold">Subscriptions &amp; Revenue</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/super-admin/telemetry" className="hover:text-[#c5a059] transition font-medium text-[#8c7a6b]">
            Platform Telemetry →
          </Link>
          <span className="text-[#e7e2da]">|</span>
          <Link href="/admin" className="hover:text-[#c5a059] transition font-medium text-[#8c7a6b]">
            Campus Admin View →
          </Link>
        </div>
      </nav>

      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#faf9f5] text-[#2c1d17] border-[#c5a059]/30">
              <CreditCard className="mr-1 size-3 text-[#c5a059]" /> Recurring Revenue Control
            </Badge>
            <span className="text-sm text-[#786c62]">Multi-Tenant Billing Engine</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#2c1d17] md:text-4xl">
            Tenant Subscriptions &amp; MRR
          </h1>
          <p className="text-[#786c62]">
            Monitor SaaS revenue, manage school plan tiers, and reconcile automated monthly renewals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportSubscriptionsCsv} disabled={campuses.length === 0} className="border-[#e7e2da] bg-white text-[#2c1d17] hover:bg-[#faf9f5]">
            <Download className="mr-2 size-4" /> Export Revenue CSV
          </Button>
          <Link
            href="/super-admin"
            className="inline-flex items-center justify-center rounded-xl bg-[#2c1d17] hover:bg-[#3d2a20] px-4 py-2 text-sm font-semibold text-white shadow-xs"
          >
            <Plus className="mr-1.5 size-4" /> Onboard School
          </Link>
        </div>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] font-medium">Monthly Recurring Revenue</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-[#166534]">
              <ArrowUpRight className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#2c1d17]">
            Rs. {totalMrr.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[#786c62]">From {activeCampuses.length} actively paying campuses</p>
        </div>

        <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] font-medium">Annualized Run Rate (ARR)</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
              <Activity className="size-4.5 text-[#c5a059]" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#2c1d17]">
            Rs. {totalArr.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[#166534] font-semibold">Estimated 12-month value</p>
        </div>

        <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] font-medium">Tier Breakdown</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
              <Receipt className="size-4.5 text-[#c5a059]" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#2c1d17]">
            {activeCampuses.length} Active
          </p>
          <p className="mt-1 text-xs text-[#786c62]">
            {starterCount} Starter · {proCount} Pro · {enterpriseCount} Enterprise
          </p>
        </div>

        <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] font-medium">Average Revenue / School</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
              <Building2 className="size-4.5 text-[#c5a059]" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#2c1d17]">
            Rs. {activeCampuses.length > 0 ? Math.round(totalMrr / activeCampuses.length).toLocaleString() : '0'}
          </p>
          <p className="mt-1 text-xs text-[#786c62]">Per active campus per month</p>
        </div>
      </div>

      {/* Plan Tiers Reference Matrix */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(['Starter', 'Pro', 'Enterprise'] as Plan[]).map((p) => (
          <div
            key={p}
            className={`rounded-2xl border p-5 transition-all shadow-xs ${
              p === 'Pro'
                ? 'border-[#c5a059] bg-[#faf9f5]'
                : 'border-[#e7e2da] bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#2c1d17]">{p} Tier</span>
              <span className="rounded-full bg-white border border-[#e7e2da] px-2.5 py-0.5 text-xs font-bold text-[#2c1d17]">
                Rs. {planRates[p].toLocaleString()} / mo
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-[#5c4a3e]">
              {planFeatures[p].map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#c5a059] shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Subscription Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e7e2da] bg-white shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-[#e7e2da] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-base text-[#2c1d17]">Tenant Subscription Register</h2>
            <p className="mt-0.5 text-xs text-[#786c62]">View and adjust subscription tiers for each school campus.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl bg-[#faf9f5] border border-[#e7e2da] p-1 text-xs">
              {['All', 'Starter', 'Pro', 'Enterprise'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setPlanFilter(tab)
                    setPage(1)
                  }}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                    planFilter === tab
                      ? 'bg-[#2c1d17] text-white shadow-xs'
                      : 'text-[#786c62] hover:text-[#2c1d17]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-3 top-2.5 size-4 text-[#8c7a6b]" />
              <Input
                placeholder="Search campus..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-9 h-9 text-xs rounded-xl border-[#e7e2da] bg-white text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
              />
            </div>
          </div>
        </div>

        {campuses.length === 0 && !loading ? (
          <div className="p-6">
            <ZeroDataEmptyState
              icon={Receipt}
              title="No tenant subscriptions found"
              description="Onboard your first school campus to activate their recurring subscription."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[930px] text-left text-sm">
                <thead className="border-b border-[#e7e2da] bg-[#faf9f5] text-xs font-semibold uppercase tracking-wider text-[#8c7a6b]">
                  <tr>
                    <th className="px-5 py-3.5">Campus / Tenant</th>
                    <th className="px-5 py-3.5">Owner / Contact</th>
                    <th className="px-5 py-3.5">Plan Tier</th>
                    <th className="px-5 py-3.5">Monthly Rate</th>
                    <th className="px-5 py-3.5">Billing Cycle</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e2da]">
                  {paginated.map((campus) => (
                    <tr key={campus.id} className="hover:bg-[#faf9f5] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#2c1d17]">{campus.name}</p>
                        <p className="text-[11px] font-mono text-[#8c7a6b]">{campus.city} · eduflow.pk/{campus.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 18)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#2c1d17]">{campus.owner}</p>
                        <p className="text-xs text-[#8c7a6b] font-mono">{campus.phone || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={campus.plan}
                          onChange={(e) => changePlan(campus.id, e.target.value as Plan)}
                          className="h-8 rounded-lg border border-[#e7e2da] bg-white text-[#2c1d17] px-2.5 text-xs font-medium focus:border-[#c5a059] focus:outline-none"
                        >
                          <option>Starter</option>
                          <option>Pro</option>
                          <option>Enterprise</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-[#2c1d17]">
                        Rs. {(planRates[campus.plan] || 2500).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#5c4a3e]">
                        Monthly
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          campus.status === 'Active'
                            ? 'bg-emerald-50 text-[#166534]'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {campus.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {campus.phone && (
                            <a
                              href={`https://wa.me/${campus.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(campus.owner)}%2C%20this%20is%20regarding%20your%20EduFlow%20subscription.`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg p-1.5 text-[#786c62] hover:text-[#2c1d17] hover:bg-[#faf9f5]"
                              title="WhatsApp Principal"
                            >
                              <MessageCircle className="size-4" />
                            </a>
                          )}
                          <Link
                            href="/admin"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#e7e2da] bg-white px-2.5 py-1 text-xs font-semibold text-[#2c1d17] hover:bg-[#faf9f5]"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="size-3 text-[#8c7a6b]" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#e7e2da] flex items-center justify-between text-xs text-[#786c62]">
              <span>Showing {paginated.length} of {filtered.length} tenant subscriptions</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="size-8 p-0 border-[#e7e2da] text-[#2c1d17] hover:bg-[#faf9f5]"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 font-medium">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="size-8 p-0 border-[#e7e2da] text-[#2c1d17] hover:bg-[#faf9f5]"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
