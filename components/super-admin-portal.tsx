'use client'

import { useMemo, useState } from 'react'
import { Activity, ArrowUpRight, Building2, Check, Database, Gauge, MoreHorizontal, Plus, ShieldCheck, Sparkles, Users, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type CampusStatus = 'Active' | 'Trial' | 'Suspended'
type Plan = 'Starter' | 'Pro' | 'Enterprise'
type Campus = { id: number; name: string; city: string; owner: string; phone: string; plan: Plan; students: number; status: CampusStatus }

const planPrice: Record<Plan, string> = { Starter: 'Rs. 2,500', Pro: 'Rs. 5,000', Enterprise: 'Rs. 12,000' }
const planAmounts: Record<Plan, number> = { Starter: 2500, Pro: 5000, Enterprise: 12000 }
const statusTone: Record<CampusStatus, string> = { Active: 'bg-emerald-500/10 text-emerald-700', Trial: 'bg-amber-500/10 text-amber-700', Suspended: 'bg-rose-500/10 text-rose-700' }

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
  const [tempPassword, setTempPassword] = useState('')

  const slug = useMemo(() => school.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 24) || 'campus-slug', [school])
  const activeCount = campuses.filter((campus) => campus.status === 'Active').length
  const totalStudents = campuses.reduce((acc, c) => acc + c.students, 0)
  const totalMrr = campuses.filter(c => c.status === 'Active').reduce((acc, c) => acc + planAmounts[c.plan], 0)

  const addCampus = () => {
    if (!school || !owner || !email) return
    setCampuses((items) => [{ id: Date.now(), name: school, city, owner, phone, plan, students: 0, status: 'Active' }, ...items])
    setCreated(true)
    setOpen(false)
    setSchool('')
    setOwner('')
    setPhone('')
    setEmail('')
    setTempPassword('')
  }

  const toggleCampus = (id: number) => setCampuses((items) => items.map((campus) => campus.id === id ? { ...campus, status: campus.status === 'Suspended' ? 'Active' : 'Suspended' } : campus))
  const changePlan = (id: number, nextPlan: Plan) => setCampuses((items) => items.map((campus) => campus.id === id ? { ...campus, plan: nextPlan } : campus))

  return (
    <section className="mx-auto flex max-w-[1500px] flex-col gap-6 pb-16">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
              <ShieldCheck className="mr-1 size-3" />Platform control
            </Badge>
            <span className="text-sm text-muted-foreground">Multi-Campus Management · Academic Session 2026–27</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">Super Admin Control Portal</h2>
          <p className="text-muted-foreground">Provision, monitor, and configure every school tenant in the EduFlow network.</p>
        </div>
        <Button data-testid="btn-add-campus" onClick={() => setOpen(true)}>
          <Plus data-icon="inline-start" className="mr-1 size-4" />Onboard New School Campus
        </Button>
      </div>

      <div id="subscriptions" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Registered campuses', value: String(campuses.length), detail: `${activeCount} active schools`, icon: Building2 },
          { label: 'Enrolled students', value: totalStudents.toLocaleString(), detail: 'Across all active campuses', icon: Users },
          { label: 'Monthly recurring revenue', value: `Rs. ${totalMrr.toLocaleString()}`, detail: 'Active subscriptions', icon: ArrowUpRight },
          { label: 'Active subscriptions', value: String(activeCount), detail: `${campuses.filter(c => c.plan === 'Starter').length} Starter · ${campuses.filter(c => c.plan === 'Pro').length} Pro · ${campuses.filter(c => c.plan === 'Enterprise').length} Enterprise`, icon: Activity },
        ].map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div id="campuses" className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold">Campus Provisioning &amp; Management</h3>
              <p className="mt-1 text-sm text-muted-foreground">Manage tenant access, subscription tiers, and campus administrators.</p>
            </div>
            <Badge variant="outline">{campuses.length} visible tenants</Badge>
          </div>

          {campuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Building2 className="size-7" />
              </div>
              <h3 className="mt-4 text-base font-semibold">No campus tenants onboarded yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Get started by onboarding your first school branch into EduFlow OS.
              </p>
              <Button className="mt-5" onClick={() => setOpen(true)}>
                <Plus className="mr-2 size-4" /> Onboard School Campus
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table data-testid="campus-table" className="w-full min-w-[930px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">School / Campus</th>
                    <th className="px-5 py-3 font-medium">City</th>
                    <th className="px-5 py-3 font-medium">Principal / Owner</th>
                    <th className="px-5 py-3 font-medium">Plan tier</th>
                    <th className="px-5 py-3 font-medium">Students</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {campuses.map((campus) => (
                    <tr key={campus.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <p className="font-medium">{campus.name}</p>
                        <p className="mt-1 font-mono text-[11px] text-muted-foreground">{campus.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 22)}</p>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{campus.city}</td>
                      <td className="px-5 py-4">
                        <p>{campus.owner}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{campus.phone || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          aria-label={`Change plan for ${campus.name}`}
                          value={campus.plan}
                          onChange={(event) => changePlan(campus.id, event.target.value as Plan)}
                          className="h-8 rounded-md border bg-background px-2 text-xs font-medium"
                        >
                          <option>Starter</option>
                          <option>Pro</option>
                          <option>Enterprise</option>
                        </select>
                        <p className="mt-1 text-xs text-muted-foreground">{planPrice[campus.plan]} / mo</p>
                      </td>
                      <td className="px-5 py-4 font-mono">{campus.students.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <Badge className={`${statusTone[campus.status]} hover:${statusTone[campus.status]}`}>
                          {campus.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCampus(campus.id)}
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
          )}
        </div>

        <aside id="health" className="flex flex-col gap-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">System health</p>
                <h3 className="mt-1 text-lg font-semibold">Global Telemetry</h3>
              </div>
              <Gauge className="size-5 text-primary" />
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {[
                { label: 'Database latency', value: 'Healthy', detail: 'Supabase PostgreSQL connected', icon: Database, tone: 'text-emerald-700' },
                { label: 'Gemini AI API', value: 'Operational', detail: 'Chat Companion ready', icon: Sparkles, tone: 'text-emerald-700' },
                { label: 'Authentication Engine', value: 'Active', detail: 'SSR Cookie sessions active', icon: ShieldCheck, tone: 'text-emerald-700' },
              ].map(({ label, value, detail, icon: Icon, tone }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-background">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`font-semibold text-xs ${tone}`}>{value}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {created && (
        <div role="status" className="fixed bottom-5 right-5 z-30 flex max-w-sm items-center gap-3 rounded-xl border bg-card p-4 shadow-lg">
          <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Campus created successfully</p>
            <p className="text-xs text-muted-foreground">Admin credentials generated for tenant.</p>
          </div>
          <button type="button" aria-label="Dismiss notification" className="ml-2 text-muted-foreground" onClick={() => setCreated(false)}>
            <X className="size-4" />
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="onboard-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">New tenant</p>
                <h3 id="onboard-title" className="mt-1 text-xl font-semibold">Onboard New Campus</h3>
                <p className="mt-1 text-sm text-muted-foreground">Create the school workspace and configure access details.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close onboarding modal" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
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
                <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 font-mono text-xs text-muted-foreground">
                  eduflow.pk/{slug}
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                City
                <select value={city} onChange={(e) => setCity(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
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
                      className={`rounded-lg border p-3 text-left ${plan === item ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/40'}`}
                    >
                      <p className="text-sm font-semibold">{item}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{planPrice[item]} / month</p>
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
                <Input type="password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Set initial password" />
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={addCampus}>
                <Check data-icon="inline-start" className="mr-1 size-4" />Create Campus Tenant
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
