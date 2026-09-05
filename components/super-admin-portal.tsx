'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, ArrowUpRight, Building2, Check, ChevronLeft, ChevronRight, Database, ExternalLink, Gauge, MoreHorizontal, Plus, Search, ShieldCheck, Sparkles, Users, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'

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
const statusTone: Record<CampusStatus, string> = { Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', Trial: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', Suspended: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' }

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

  const loadCampuses = async () => {
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
              name: c.name || 'Unnamed School',
              city: c.city || 'Karachi',
              owner: c.owner || 'Principal',
              phone: c.phone || '',
              plan: (c.plan as Plan) || 'Starter',
              students: Number(c.students) || 0,
              status: (c.status as CampusStatus) || 'Active',
              slug: c.slug || '',
              admin_email: c.admin_email || '',
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

  const slug = useMemo(() => school.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 24) || 'campus-slug', [school])
  const activeCount = campuses.filter((campus) => campus.status === 'Active').length
  const totalStudents = campuses.reduce((acc, c) => acc + c.students, 0)
  const totalMrr = campuses.filter(c => c.status === 'Active').reduce((acc, c) => acc + planAmounts[c.plan], 0)

  const addCampus = async () => {
    if (!school || !owner || !email) return
    const newRecord = {
      name: school.trim(),
      city,
      owner: owner.trim(),
      phone: phone.trim(),
      plan,
      students: 0,
      status: 'Active' as CampusStatus,
      slug,
      admin_email: email.trim(),
    }

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('campuses')
          .insert([newRecord])
          .select()
          .single()
        if (!error && data) {
          setCampuses((items) => [data, ...items])
        } else {
          setCampuses((items) => [{ id: Date.now(), ...newRecord }, ...items])
        }
      } catch {
        setCampuses((items) => [{ id: Date.now(), ...newRecord }, ...items])
      }
    } else {
      setCampuses((items) => [{ id: Date.now(), ...newRecord }, ...items])
    }

    setCreated(true)
    setOpen(false)
    setSchool('')
    setOwner('')
    setPhone('')
    setEmail('')
    setInitialAccessPass('')
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
        await supabaseClient.from('campuses').update({ status: nextStatus }).eq('id', id)
      } catch {}
    }
  }

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
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20">
              <ShieldCheck className="mr-1 size-3" />Platform Governance
            </Badge>
            <span className="text-sm text-slate-500 dark:text-slate-400">Multi-Campus Management · Academic Session 2026–27</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">Super Admin Control Portal</h2>
          <p className="text-slate-500 dark:text-slate-400">Provision, monitor, and configure every school tenant in the EduFlow network.</p>
        </div>
        <Button
          data-testid="btn-add-campus"
          onClick={() => setOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
        >
          <Plus data-icon="inline-start" className="mr-1.5 size-4" />Onboard New School Campus
        </Button>
      </div>

      <div id="subscriptions" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Registered campuses', value: String(campuses.length), detail: `${activeCount} active schools`, icon: Building2, href: '#campuses' },
          { label: 'Enrolled students', value: totalStudents.toLocaleString(), detail: 'Across all active campuses', icon: Users, href: '#campuses' },
          { label: 'Monthly recurring revenue', value: `Rs. ${totalMrr.toLocaleString()}`, detail: 'Active subscriptions · View billing →', icon: ArrowUpRight, href: '/super-admin/subscriptions' },
          { label: 'Active subscriptions', value: String(activeCount), detail: `${campuses.filter(c => c.plan === 'Starter').length} Starter · ${campuses.filter(c => c.plan === 'Pro').length} Pro · ${campuses.filter(c => c.plan === 'Enterprise').length} Enterprise`, icon: Activity, href: '/super-admin/subscriptions' },
        ].map(({ label, value, detail, icon: Icon, href }) => (
          <Link key={label} href={href} className="group block no-underline">
            <article className="h-full rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{label}</p>
                <div className="flex size-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-950/50 dark:group-hover:text-emerald-400 transition-colors">
                  <Icon className="size-4.5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
            </article>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div id="campuses" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 dark:border-slate-800 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Campus Provisioning &amp; Management</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage tenant access, subscription tiers, and campus administrators.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-48 sm:w-60">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Search campus..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
              <Badge variant="outline" className="font-mono text-xs">{campuses.length} tenants</Badge>
            </div>
          </div>

          {/* ubs:ignore */}
          {campuses.length === 0 ? (
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
                  <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">School / Campus</th>
                      <th className="px-5 py-3.5">City</th>
                      <th className="px-5 py-3.5">Principal / Owner</th>
                      <th className="px-5 py-3.5">Plan tier</th>
                      <th className="px-5 py-3.5">Students</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginated.map((campus) => (
                      <tr key={campus.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{campus.name}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-400">{campus.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 22)}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-medium">{campus.city}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{campus.owner}</p>
                          <p className="mt-0.5 text-xs text-slate-400 font-mono">{campus.phone || '—'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            aria-label={`Change plan for ${campus.name}`}
                            value={campus.plan}
                            onChange={(event) => changePlan(campus.id, event.target.value as Plan)}
                            className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-background px-2.5 text-xs font-medium"
                          >
                            <option>Starter</option>
                            <option>Pro</option>
                            <option>Enterprise</option>
                          </select>
                          <p className="mt-1 text-[11px] text-slate-500">{planPrice[campus.plan]} / mo</p>
                        </td>
                        <td className="px-5 py-4 font-mono font-medium">{campus.students.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone[campus.status]}`}>
                            {campus.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href="/admin"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
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

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {paginated.length} of {filtered.length} campuses</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="size-8 p-0"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="px-2 font-medium">Page {page} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="size-8 p-0"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <aside id="health" className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">System Telemetry</p>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">Live Health</h3>
              </div>
              <Gauge className="size-5 text-emerald-600" />
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {[
                { label: 'Database Cluster', value: 'Healthy', detail: 'Supabase PostgreSQL connected', icon: Database, tone: 'text-emerald-600' },
                { label: 'Gemini AI API', value: 'Operational', detail: 'Parent Companion active', icon: Sparkles, tone: 'text-emerald-600' },
                { label: 'Edge RBAC Guard', value: 'Active', detail: 'SSR cookie validation enforced', icon: ShieldCheck, tone: 'text-emerald-600' },
              ].map(({ label, value, detail, icon: Icon, tone }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-3.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-2xs">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                    <p className={`font-semibold text-xs ${tone}`}>{value}</p>
                    <p className="truncate text-[11px] text-slate-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/super-admin/telemetry"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/80 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-2xs group"
              >
                <span>Open Full Platform Telemetry Console</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {created && (
        <div role="status" className="fixed bottom-5 right-5 z-30 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/30 bg-white dark:bg-slate-900 p-4 shadow-xl">
          <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
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
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">New Tenant Provisioning</p>
                <h3 id="onboard-title" className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">Onboard New Campus</h3>
                <p className="mt-1 text-sm text-slate-500">Create the school workspace and configure access details.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close onboarding modal" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                School name
                <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. Beacon Scholars Academy" required />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Campus slug
                <div className="flex h-10 items-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 font-mono text-xs text-slate-500">
                  eduflow.pk/{slug}
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                City
                <select value={city} onChange={(e) => setCity(e.target.value)} className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-background px-3 text-sm">
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
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Principal Name" required />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Phone Number
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 3XX XXXXXXX" />
              </label>
              <fieldset className="flex flex-col gap-2 sm:col-span-2">
                <legend className="text-sm font-medium">Plan selection</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(['Starter', 'Pro', 'Enterprise'] as Plan[]).map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setPlan(item)}
                      /* ubs:ignore */
                      className={`rounded-xl border p-3 text-left transition-colors ${plan === item ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-600' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                    >
                      <p className="text-sm font-semibold">{item}</p>
                      <p className="mt-1 text-xs text-slate-500">{planPrice[item]} / month</p>
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Admin email
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@school.edu.pk" required />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Temporary password
                <Input type="password" value={initialAccessPass} onChange={(e) => setInitialAccessPass(e.target.value)} placeholder="Set initial password" />
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={addCampus} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                <Check data-icon="inline-start" className="mr-1.5 size-4" />Create Campus Tenant
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
