'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  GraduationCap,
  Loader2,
  MapPin,
  Phone,
  Globe,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface FormData {
  schoolName: string
  campusName: string
  phone: string
  address: string
  city: string
  slug: string
}

const STEPS = [
  { id: 1, title: 'School Info', icon: Building2 },
  { id: 2, title: 'Campus Details', icon: MapPin },
  { id: 3, title: 'Review & Launch', icon: CheckCircle2 },
] as const

/* ─── Slug helper ───────────────────────────────────────────────────────────── */
function toSlug(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const [form, setForm] = useState<FormData>({
    schoolName: '',
    campusName: '',
    phone: '',
    address: '',
    city: '',
    slug: '',
  })

  /* ── Guard: if not school_admin or already onboarded, redirect ── */
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setUserEmail(user.email ?? '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.onboarding_completed) {
        router.replace('/admin/overview')
      }
    }
    check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Derived field helpers ── */
  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-generate slug from school name on step 1
      if (key === 'schoolName') {
        next.slug = toSlug(value)
        if (!prev.campusName) {
          next.campusName = value + ' Main Campus'
        }
      }
      return next
    })
  }

  /* ── Validation per step ── */
  const isStepValid = () => {
    if (step === 1) return form.schoolName.trim().length >= 2
    if (step === 2)
      return (
        form.campusName.trim().length >= 2 &&
        form.phone.trim().length >= 7 &&
        form.city.trim().length >= 2
      )
    return true
  }

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Session expired. Please log in again.')

      // 1. Create the school record
      const { data: school, error: schoolErr } = await supabase
        .from('schools')
        .insert({
          name: form.schoolName.trim(),
          slug: form.slug || toSlug(form.schoolName),
          admin_email: userEmail,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (schoolErr) throw schoolErr

      // 2. Create the campus under the school
      const { data: campus, error: campusErr } = await supabase
        .from('campuses')
        .insert({
          name: form.campusName.trim(),
          city: form.city.trim(),
          address: form.address.trim() || null,
          phone: form.phone.trim() || null,
          school_id: school.id,
          admin_email: userEmail,
          plan: 'Pro',
          students: 0,
          status: 'Active',
          owner: user.user_metadata?.full_name || userEmail.split('@')[0],
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (campusErr) throw campusErr

      // 3. Update profile: link school_id, mark onboarding_completed
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          school_id: school.id,
          campus_id: campus.id,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileErr) throw profileErr

      // 4. Done — send to admin portal
      router.push('/admin/overview')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  /* ─── Render ────────────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg">
            <GraduationCap className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome to EduFlow OS
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Let&apos;s set up your school in under 2 minutes
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            const active = step === s.id
            const done = step > s.id
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={[
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                    done
                      ? 'bg-emerald-600 text-white'
                      : active
                      ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
                  ].join(' ')}
                >
                  <Icon className="size-3.5" />
                  {s.title}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-px w-6 ${step > s.id ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <form
          onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep((s) => s + 1) } : handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 space-y-5"
        >
          {/* ── Step 1: School Info ── */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  School Information
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  This is the official name of your institution.
                </p>
              </div>

              <FieldGroup label="School Name" required>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    className="pl-9"
                    placeholder="e.g. Beacon Scholars Academy"
                    value={form.schoolName}
                    onChange={set('schoolName')}
                    required
                    autoFocus
                  />
                </div>
              </FieldGroup>

              <FieldGroup label="Subdomain / Slug" hint="Auto-generated — you can edit it">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    className="pl-9 font-mono text-sm"
                    placeholder="beacon-scholars"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, slug: toSlug(e.target.value) }))
                    }
                  />
                </div>
                {form.slug && (
                  <p className="text-xs text-slate-400 mt-1">
                    Your portal:{' '}
                    <span className="text-emerald-600 font-mono">
                      {form.slug}.eduflow.pk
                    </span>
                  </p>
                )}
              </FieldGroup>
            </>
          )}

          {/* ── Step 2: Campus Details ── */}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Campus Details
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your main campus location and contact info.
                </p>
              </div>

              <FieldGroup label="Campus Name" required>
                <Input
                  placeholder="e.g. Main Campus"
                  value={form.campusName}
                  onChange={set('campusName')}
                  required
                  autoFocus
                />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="City" required>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      className="pl-9"
                      placeholder="e.g. Karachi"
                      value={form.city}
                      onChange={set('city')}
                      required
                    />
                  </div>
                </FieldGroup>

                <FieldGroup label="Phone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      className="pl-9"
                      placeholder="+92 300 0000000"
                      value={form.phone}
                      onChange={set('phone')}
                      type="tel"
                    />
                  </div>
                </FieldGroup>
              </div>

              <FieldGroup label="Address">
                <Input
                  placeholder="Street, Area, City"
                  value={form.address}
                  onChange={set('address')}
                />
              </FieldGroup>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Review &amp; Launch
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Everything look good? Click Launch to create your school.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <ReviewRow label="School Name" value={form.schoolName} />
                <ReviewRow label="Subdomain" value={form.slug || toSlug(form.schoolName)} mono />
                <ReviewRow label="Campus" value={form.campusName} />
                <ReviewRow label="City" value={form.city} />
                {form.phone && <ReviewRow label="Phone" value={form.phone} />}
                {form.address && <ReviewRow label="Address" value={form.address} />}
                <ReviewRow label="Admin Email" value={userEmail} />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-3">
                  {error}
                </p>
              )}
            </>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={submitting}
              >
                <ArrowLeft className="size-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="submit"
              disabled={!isStepValid() || submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Launching…
                </>
              ) : step < 3 ? (
                <>
                  Next
                  <ArrowRight className="size-4 ml-1" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Launch My School
                </>
              )}
            </Button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          EduFlow OS · Pakistan Ka Pehla AI School Operating System
        </p>
      </div>
    </main>
  )
}

/* ─── Helper sub-components ─────────────────────────────────────────────────── */
function FieldGroup({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="ml-2 font-normal text-slate-400 text-xs">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function ReviewRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-slate-800 dark:text-slate-200 font-medium ${mono ? 'font-mono text-emerald-600 dark:text-emerald-400' : ''}`}>
        {value}
      </span>
    </div>
  )
}
