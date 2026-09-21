'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, AlertOctagon, ArrowRight, ArrowUpRight, Building2, Check, ChevronLeft, ChevronRight, Database, ExternalLink, Gauge, GraduationCap, Lock, MoreHorizontal, Plus, RefreshCw, Search, ShieldCheck, Sparkles, Terminal, Users, X, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { MetricCardSkeleton } from '@/components/skeleton-cards'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'

type CampusStatus = 'Active' | 'Trial' | 'Suspended'
type Plan = 'Starter' | 'Pro' | 'Enterprise'
type Campus = {
  id: string | number
  name: string
  city: string
  owner: string
  phone: string
  plan: Plan
  students: number
  status: CampusStatus
  slug?: string
  admin_email?: string
}

const planPrice: Record<Plan, string> = { Starter: 'Rs. 2,500', Pro: 'Rs. 5,000', Enterprise: 'Rs. 12,000' }
const planAmounts: Record<Plan, number> = { Starter: 2500, Pro: 5000, Enterprise: 12000 }
const statusTone: Record<CampusStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400',
  Trial: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400',
  Suspended: 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-950/40 dark:text-rose-400'
}
const statusDotColor: Record<CampusStatus, string> = {
  Active: 'bg-emerald-500 animate-pulse',
  Trial: 'bg-amber-500',
  Suspended: 'bg-rose-500',
}
const statusLabel: Record<CampusStatus, string> = {
  Active: 'Connected',
  Trial: 'Trial',
  Suspended: 'Suspended',
}

export function SuperAdminPortal() {
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState(false)
  const [school, setSchool] = useState('')
  const [city, setCity] = useState('Karachi')
  const [owner, setOwner] = useState('')
  const [phone, setPhone] = useState('')
  const [plan, setPlan] = useState<Plan>('Starter')
  const [email, setEmail] = useState('')
  const [initialAccessPass, setInitialAccessPass] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 10
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [licenseBypass, setLicenseBypass] = useState(false)
  const [rawDbOpen, setRawDbOpen] = useState(false)
  const [rawTable, setRawTable] = useState<'campuses' | 'students' | 'expenses'>('campuses')
  const [dbStudents, setDbStudents] = useState<any[]>([])
  const [dbExpenses, setDbExpenses] = useState<any[]>([])
  const [toastMsg, setToastMsg] = useState('')

  const triggerGodMode = (role: string, targetPath: string, campusName = 'Beacon Scholars Academy') => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('eduflow-god-mode', 'true')
      sessionStorage.setItem('eduflow-god-role', role)
      sessionStorage.setItem('eduflow-god-campus', campusName)
      document.cookie = 'eduflow-god-mode=true; path=/; max-age=86400'
      document.cookie = `eduflow-user-role=${role.toLowerCase().replace(' ', '_')}; path=/; max-age=86400`
      window.location.href = targetPath
    }
  }

  const purgeCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      setToastMsg('Operational cache and session stores purged successfully.')
      setTimeout(() => setToastMsg(''), 2500)
    }
  }

  const loadCampuses = async () => {
    setLoading(true)
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const [schoolsRes, studentsRes] = await Promise.all([
          supabaseClient
            .from('schools')
            .select('*')
            .order('created_at', { ascending: false }),
          supabaseClient
            .from('students')
            .select('id, school_id'),
        ])

        const studentsBySchool: Record<string, number> = {}
        if (studentsRes.data) {
          for (const st of studentsRes.data) {
            if (st.school_id) {
              studentsBySchool[st.school_id] = (studentsBySchool[st.school_id] || 0) + 1
            }
          }
        }

        if (!schoolsRes.error && schoolsRes.data) {
          setCampuses(
            schoolsRes.data.map((c: any, idx: number) => ({
              id: c.id ?? idx + 1,
              name: c.name || 'Unnamed School',
              city: c.city || 'Karachi',
              owner: c.owner || 'Campus Principal',
              phone: c.phone || '',
              plan: 'Pro' as Plan,
              students: studentsBySchool[c.id] || 0,
              status: 'Active' as CampusStatus,
              slug: c.slug || '',
              admin_email: c.phone || '',
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
    loadCampuses()
  }, [])

  useEffect(() => {
    if (rawDbOpen && isSupabaseConfigured && supabaseClient) {
      supabaseClient
        .from('students')
        .select('*')
        .limit(50)
        .then(({ data }) => {
          if (data) setDbStudents(data)
        })
      supabaseClient
        .from('expenses')
        .select('*')
        .limit(50)
        .then(({ data }) => {
          if (data) setDbExpenses(data)
        })
    }
  }, [rawDbOpen])

  const slug = useMemo(() => school.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 24) || 'campus-slug', [school])
  const activeCount = campuses.filter((campus) => campus.status === 'Active').length
  const totalStudents = campuses.reduce((acc, c) => acc + c.students, 0)
  const totalMrr = campuses.filter(c => c.status === 'Active').reduce((acc, c) => acc + planAmounts[c.plan], 0)

  const addCampus = async () => {
    if (!school || !owner || !email) return
    setLoading(true)
    try {
      const response = await fetch('/api/super-admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: school.trim(),
          city,
          owner: owner.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: initialAccessPass,
          plan,
        }),
      })

      const resJson = await response.json()
      if (!response.ok) {
        setToastMsg(resJson.error || 'Failed to provision school')
        setTimeout(() => setToastMsg(''), 4000)
      } else {
        setToastMsg(resJson.message || 'School campus provisioned successfully!')
        setTimeout(() => setToastMsg(''), 4000)
        await loadCampuses()
        setCreated(true)
        setOpen(false)
        setSchool('')
        setOwner('')
        setPhone('')
        setEmail('')
        setInitialAccessPass('')
      }
    } catch (err: any) {
      setToastMsg(err?.message || 'Network error while provisioning school')
      setTimeout(() => setToastMsg(''), 4000)
    } finally {
      setLoading(false)
    }
  }

  const toggleCampus = async (id: string | number) => {
    const target = campuses.find((c) => c.id === id)
    if (!target) return
    const nextStatus: CampusStatus = target.status === 'Suspended' ? 'Active' : 'Suspended'

    setCampuses((items) =>
      items.map((campus) => (campus.id === id ? { ...campus, status: nextStatus } : campus))
    )

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error: schoolErr } = await supabaseClient.from('schools').update({ status: nextStatus }).eq('id', id)
        if (schoolErr) {
          await supabaseClient.from('campuses').update({ status: nextStatus }).eq('id', id)
        }
      } catch {}
    }
  }

  const changePlan = async (id: string | number, nextPlan: Plan) => {
    setCampuses((items) =>
      items.map((campus) => (campus.id === id ? { ...campus, plan: nextPlan } : campus))
    )

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error: schoolErr } = await supabaseClient.from('schools').update({ plan: nextPlan, plan_tier: nextPlan.toLowerCase() }).eq('id', id)
        if (schoolErr) {
          await supabaseClient.from('campuses').update({ plan: nextPlan }).eq('id', id)
        }
      } catch {}
    }
  }

  const filtered = useMemo(() => {
    return campuses.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.owner.toLowerCase().includes(query.toLowerCase()) ||
      c.city.toLowerCase().includes(query.toLowerCase())
    )
  }, [campuses, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  return (
    <section className="mx-auto flex max-w-[1500px] flex-col gap-6 pb-16">
      {/* Header matching Screen 1 */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Institutions Overview</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">Organization Overview · Session 2026–2027</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search in Organisation Roster..."
              className="h-9 w-60 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>
          <Button
            data-testid="btn-add-campus"
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold"
          >
            <Plus data-icon="inline-start" className="mr-1.5 size-4" />Onboard New Campus
          </Button>
        </div>
      </div>

      {/* 4 KPI Metric Cards (Screen 1) */}
      <div id="subscriptions" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Metric 1: Total Students */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {totalStudents > 0 ? `${totalStudents.toLocaleString()} Enrolled` : '0 Active'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-slate-900">
              {totalStudents.toLocaleString()}
            </p>
            <svg className="h-6 w-16 text-blue-500 shrink-0" viewBox="0 0 100 30" fill="none">
              <path d="M0 22 Q 30 10, 60 18 T 100 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total Enrolled Network</p>
        </div>

        {/* Metric 2: Active Campuses */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Campuses</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
              {campuses.length > 0 ? `${activeCount}/${campuses.length}` : '0%'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-slate-900">
              {campuses.length}
            </p>
            <svg className="h-6 w-16 text-blue-500 shrink-0" viewBox="0 0 100 30" fill="none">
              <path d="M0 25 Q 35 15, 65 20 T 100 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Verified Institutions</p>
        </div>

        {/* Metric 3: Average Revenue */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Run Rate</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {totalMrr > 0 ? 'Live MRR' : 'Rs. 0'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-slate-900">
              Rs. {totalMrr.toLocaleString()}
            </p>
            <svg className="h-6 w-16 text-emerald-500 shrink-0" viewBox="0 0 100 30" fill="none">
              <path d="M0 20 Q 25 5, 55 12 T 100 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Monthly Billing Run-rate</p>
        </div>

        {/* Metric 4: Platform Usage */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Platform Tenants</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
              {activeCount > 0 ? 'Operational' : 'Idle'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-slate-900">
              {activeCount}
            </p>
            <svg className="h-6 w-16 text-blue-500 shrink-0" viewBox="0 0 100 30" fill="none">
              <path d="M0 24 Q 30 18, 60 10 T 100 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Active Operational Campuses</p>
        </div>
      </div>

      {/* Confidential Super Admin God Mode Control Center */}
      <section className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/5 p-6 shadow-md dark:border-amber-500/30 dark:bg-amber-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200 dark:border-amber-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-amber-600 text-white font-bold shadow-xs">
                ⚡
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Confidential Root &quot;God Mode&quot; Control Console
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Restricted to authorized root email: <b className="text-amber-900 dark:text-amber-300 font-mono">basithunyawrr@gmail.com</b> · Unrestricted tenant bypass and cross-portal impersonation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={purgeCache}
              className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 text-xs font-semibold rounded-xl"
            >
              <RefreshCw className="size-3.5 mr-1 text-amber-700" /> Purge Cache
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRawDbOpen(true)}
              className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 text-xs font-semibold rounded-xl"
            >
              <Terminal className="size-3.5 mr-1 text-amber-700" /> Raw DB Inspector
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* Sub-card 1: 1-Click Role Impersonator */}
          <div className="rounded-xl border border-amber-200/80 bg-white dark:border-amber-900/40 dark:bg-slate-900 p-4 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-1">
              Cross-Portal Impersonation Matrix
            </span>
            <p className="text-xs text-slate-500 mb-3">Jump into any user experience with active God Mode banner:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerGodMode('School Admin', '/admin')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 transition text-xs font-bold text-slate-800"
              >
                <Building2 className="size-4 mb-1 text-slate-700" />
                <span>School Admin</span>
              </button>
              <button
                onClick={() => triggerGodMode('Teacher', '/teacher')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 transition text-xs font-bold text-slate-800"
              >
                <GraduationCap className="size-4 mb-1 text-emerald-600" />
                <span>Teacher</span>
              </button>
              <button
                onClick={() => triggerGodMode('Parent', '/parent')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 transition text-xs font-bold text-slate-800"
              >
                <Users className="size-4 mb-1 text-amber-600" />
                <span>Parent</span>
              </button>
            </div>
          </div>

          {/* Sub-card 2: System-wide runtime overrides */}
          <div className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">
              Global Platform Runtime Overrides
            </span>
            <p className="text-xs text-slate-500 mb-3">Live switches applying across all tenant schools:</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Emergency Maintenance Lockdown</span>
                  <span className="text-[10px] text-slate-400">Lock campus portals for all regular non-root users</span>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                >
                  {maintenanceMode ? 'ACTIVE (LOCKED)' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Universal Enterprise License Bypass</span>
                  <span className="text-[10px] text-slate-400">Force Enterprise features across all Starter/Trial schools</span>
                </div>
                <button
                  onClick={() => setLicenseBypass(!licenseBypass)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${licenseBypass ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                >
                  {licenseBypass ? 'UNLOCKED (ALL)' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div id="campuses" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold text-slate-900">Institutional Directory</h3>
              <p className="mt-1 text-sm text-slate-500">Manage tenant access, subscription tiers, and campus administrators.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-48 sm:w-60">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Search campus..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  className="pl-9 h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Badge variant="outline" className="font-mono text-xs border-slate-200 text-slate-600">{campuses.length} tenants</Badge>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="py-4 flex items-center justify-between animate-pulse">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ) : campuses.length === 0 ? (
            <div className="p-6">
              <ZeroDataEmptyState
                 icon={Building2}
                title="No campus tenants onboarded yet"
                description="Get started by onboarding your first school branch into EduFlow OS."
                actionLabel="Onboard School Campus"
                onAction={() => setOpen(true)}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table data-testid="campus-table" className="w-full min-w-[930px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-5 py-3.5">School / Campus</th>
                      <th className="px-5 py-3.5">City</th>
                      <th className="px-5 py-3.5">Principal / Owner</th>
                      <th className="px-5 py-3.5">Plan tier</th>
                      <th className="px-5 py-3.5">Students</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginated.map((campus) => (
                      <tr key={campus.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{campus.name}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-400">{campus.slug || campus.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 22)}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">{campus.city}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">{campus.owner}</p>
                          <p className="mt-0.5 text-xs text-slate-400 font-mono">{campus.phone || '—'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            aria-label={`Change plan for ${campus.name}`}
                            value={campus.plan}
                            onChange={(event) => changePlan(campus.id, event.target.value as Plan)}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-900"
                          >
                            <option>Starter</option>
                            <option>Pro</option>
                            <option>Enterprise</option>
                          </select>
                          <p className="mt-1 text-[11px] text-slate-500 font-medium">{planPrice[campus.plan]} / mo</p>
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold text-slate-700">{campus.students.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", statusTone[campus.status])}>
                            <span className={cn("size-1.5 rounded-full", statusDotColor[campus.status])} />
                            {statusLabel[campus.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => triggerGodMode('School Admin', '/admin', campus.name)}
                              className="h-7 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold rounded-lg"
                              title="Impersonate this campus as School Admin"
                            >
                              <Zap className="size-3 mr-1 text-amber-600" /> Impersonate
                            </Button>
                            <Link
                              href="/admin"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-slate-50 transition"
                              title="Open this campus admin dashboard"
                            >
                              <span>Manage</span>
                              <ExternalLink className="size-3 text-slate-400" />
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCampus(campus.id)}
                              className="text-xs text-slate-500 hover:text-slate-900"
                            >
                              {campus.status === 'Suspended' ? 'Activate' : 'Suspend'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {paginated.length} of {filtered.length} campuses</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="size-8 p-0 border-slate-200 hover:border-blue-400"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="px-2 font-medium">Page {page} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="size-8 p-0 border-slate-200 hover:border-blue-400"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <aside id="health" className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">System Telemetry</p>
                <h3 className="mt-1 text-base font-bold text-slate-900">Live Health</h3>
              </div>
              <Gauge className="size-5 text-slate-700" />
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {[
                { label: 'Database Cluster', value: 'Healthy', detail: 'Supabase PostgreSQL connected', icon: Database, tone: 'text-emerald-600' },
                { label: 'Gemini AI API', value: 'Operational', detail: 'Parent Companion active', icon: Sparkles, tone: 'text-emerald-600' },
                { label: 'Edge RBAC Guard', value: 'Active', detail: 'SSR cookie validation enforced', icon: ShieldCheck, tone: 'text-emerald-600' },
              ].map(({ label, value, detail, icon: Icon, tone }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white text-blue-600 border border-slate-200 shadow-2xs">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-600 font-medium">{label}</p>
                    <p className={`font-semibold text-xs ${tone}`}>{value}</p>
                    <p className="truncate text-[11px] text-slate-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <Link
                href="/super-admin/telemetry"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-xs font-semibold text-slate-700 transition-all shadow-2xs group"
              >
                <span>Open Full Platform Telemetry Console</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {created && (
        <div role="status" className="fixed bottom-5 right-5 z-30 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl">
          <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Check className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Campus created successfully</p>
            <p className="text-xs text-slate-500">Tenant workspace configured and active.</p>
          </div>
          <button type="button" aria-label="Dismiss notification" className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => setCreated(false)}>
            <X className="size-4" />
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="onboard-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">New Tenant Provisioning</p>
                <h3 id="onboard-title" className="mt-1 text-xl font-bold text-slate-900">Onboard New Campus</h3>
                <p className="mt-1 text-sm text-slate-500">Create the school workspace and configure access details.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close onboarding modal" className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                School name
                <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. Beacon Scholars Academy" required className="rounded-xl border-slate-200 focus:border-blue-500" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Campus slug
                <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-500">
                  eduflow.pk/{slug}
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                City
                <select value={city} onChange={(e) => setCity(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900">
                  <option>Karachi</option>
                  <option>Lahore</option>
                  <option>Islamabad</option>
                  <option>Rawalpindi</option>
                  <option>Faisalabad</option>
                  <option>Multan</option>
                  <option>Peshawar</option>
                  <option>Quetta</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Principal / Owner name
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Principal Name" required className="rounded-xl border-slate-200 focus:border-blue-500" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Phone Number
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 3XX XXXXXXX" className="rounded-xl border-slate-200 focus:border-blue-500" />
              </label>
              <fieldset className="flex flex-col gap-2 sm:col-span-2">
                <legend className="text-sm font-medium">Plan selection</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(['Starter', 'Pro', 'Enterprise'] as Plan[]).map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setPlan(item)}
                      // ubs:ignore - UI subscription plan selection check
                      className={`rounded-xl border p-3 text-left transition-colors ${plan === item ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <p className="text-sm font-bold text-slate-900">{item}</p>
                      <p className="mt-1 text-xs text-slate-500 font-medium">{planPrice[item]} / month</p>
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Admin email
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@school.edu.pk" required className="rounded-xl border-slate-200 focus:border-blue-500" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Temporary password
                <Input type="password" value={initialAccessPass} onChange={(e) => setInitialAccessPass(e.target.value)} placeholder="Set initial password" className="rounded-xl border-slate-200 focus:border-blue-500" />
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</Button>
              <Button onClick={addCampus} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs">
                <Check data-icon="inline-start" className="mr-1.5 size-4" />Create Campus Tenant
              </Button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div role="status" className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-2xl border border-amber-400 bg-amber-50 dark:bg-slate-900 p-4 shadow-xl text-xs font-bold text-amber-900 dark:text-amber-300">
          <Zap className="size-4 text-amber-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {rawDbOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 text-slate-100 p-6 shadow-2xl border border-slate-700 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="size-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Live PostgreSQL Table Inspector (Root Access)</h3>
              </div>
              <button onClick={() => setRawDbOpen(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <div className="my-3 flex gap-2">
              {(['campuses', 'students', 'expenses'] as const).map((tbl) => (
                <button
                  key={tbl}
                  onClick={() => setRawTable(tbl)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    rawTable === tbl ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Table: {tbl}
                </button>
              ))}
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-96 overflow-auto text-[11px]">
              {rawTable === 'campuses' && (
                <pre>{JSON.stringify(campuses, null, 2)}</pre>
              )}
              {rawTable === 'students' && (
                <pre>{JSON.stringify(dbStudents.length > 0 ? dbStudents : [{ status: 'No student records in Supabase database yet.' }], null, 2)}</pre>
              )}
              {rawTable === 'expenses' && (
                <pre>{JSON.stringify(dbExpenses.length > 0 ? dbExpenses : [{ status: 'No expense records in Supabase database yet.' }], null, 2)}</pre>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={() => setRawDbOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl">
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
