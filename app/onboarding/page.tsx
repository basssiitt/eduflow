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
  Loader2,
  MapPin,
  Phone,
  Globe,
} from 'lucide-react'
import { AcademicCrest } from '@/components/academic-crest'

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
      const hasSessionCookie = document.cookie.includes('eduflow-user-email=')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user && !hasSessionCookie) {
        router.replace('/login')
        return
      }

      if (user) {
        setUserEmail(user.email ?? '')

        // Check if user already has school_id in user_metadata
        if (user.user_metadata?.school_id || user.user_metadata?.onboarding_completed) {
          router.replace('/admin/dashboard')
          return
        }

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, school_id, onboarding_completed')
            .eq('id', user.id)
            .maybeSingle()

          if (profile?.school_id || profile?.onboarding_completed) {
            router.replace('/admin/dashboard')
            return
          }
        } catch {}
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
      const effectiveEmail = userEmail || user?.email || 'admin@school.edu.pk'
      const ownerName = user?.user_metadata?.full_name || effectiveEmail.split('@')[0] || 'School Administrator'

      // 1. Provision school tenant atomically via backend endpoint
      const setupRes = await fetch('/api/auth/setup-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: effectiveEmail,
          schoolName: form.schoolName.trim(),
          city: form.city.trim(),
          ownerName,
          phone: form.phone.trim(),
        }),
      })

      const setupResult = await setupRes.json()
      if (!setupRes.ok || !setupResult.success) {
        throw new Error(setupResult.error || 'Failed to setup school campus.')
      }

      const schoolId = setupResult.schoolId

      // 2. Resiliently update profile on client if user session is active
      if (user && schoolId) {
        try {
          await supabase
            .from('profiles')
            .update({
              school_id: schoolId,
              onboarding_completed: true,
            })
            .eq('id', user.id)
        } catch {}
      }

      // 3. Set authenticated session cookies
      document.cookie = `eduflow-user-email=${encodeURIComponent(effectiveEmail)}; path=/; max-age=86400; SameSite=Lax`
      document.cookie = 'eduflow-user-role=school_admin; path=/; max-age=86400; SameSite=Lax'

      // 4. Send directly to admin dashboard
      router.push('/admin/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  /* ─── Render ────────────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-blue-500/20">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-blue-600 text-white shadow-xs mb-4">
            <AcademicCrest className="size-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Welcome to EduFlow OS
          </h1>
          <p className="text-slate-600 mt-1 text-sm font-medium">
            Let&apos;s set up your school campus in under 2 minutes
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
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all',
                    done
                      ? 'bg-blue-600 text-white shadow-xs'
                      : active
                      ? 'bg-white text-blue-600 ring-2 ring-blue-600 shadow-xs'
                      : 'bg-white text-slate-500 border border-slate-200',
                  ].join(' ')}
                >
                  <Icon className="size-3.5" />
                  {s.title}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-px w-6 ${step > s.id ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <form
          onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep((s) => s + 1) } : handleSubmit}
          className="bg-white rounded-2xl shadow-xs border border-slate-200 p-8 space-y-5"
        >
          {/* ── Step 1: School Info ── */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  School Information
                </h2>
                <p className="text-sm text-slate-600">
                  This is the official name of your institution.
                </p>
              </div>

              <FieldGroup label="School Name" required>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    className="pl-9 border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
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
                    className="pl-9 font-mono text-sm border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
                    placeholder="beacon-scholars"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, slug: toSlug(e.target.value) }))
                    }
                  />
                </div>
                {form.slug && (
                  <p className="text-xs text-slate-500 mt-1">
                    Your portal:{' '}
                    <span className="text-blue-600 font-mono font-semibold">
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
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Campus Details
                </h2>
                <p className="text-sm text-slate-600">
                  Your main campus location and contact info.
                </p>
              </div>

              <FieldGroup label="Campus Name" required>
                <Input
                  className="border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
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
                      className="pl-9 border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
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
                      className="pl-9 border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
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
                  className="border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
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
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Review &amp; Launch
                </h2>
                <p className="text-sm text-slate-600">
                  Everything look good? Click Launch to create your school.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 divide-y divide-slate-200 text-sm">
                <ReviewRow label="School Name" value={form.schoolName} />
                <ReviewRow label="Subdomain" value={form.slug || toSlug(form.schoolName)} mono />
                <ReviewRow label="Campus" value={form.campusName} />
                <ReviewRow label="City" value={form.city} />
                {form.phone && <ReviewRow label="Phone" value={form.phone} />}
                {form.address && <ReviewRow label="Address" value={form.address} />}
                <ReviewRow label="Admin Email" value={userEmail} />
              </div>

              {error && (
                <p className="text-sm text-rose-700 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3">
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
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin text-white" />
                  Launching…
                </>
              ) : step < 3 ? (
                <>
                  Next
                  <ArrowRight className="size-4 ml-1" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2 text-white" />
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
      <label className="text-sm font-semibold text-slate-900">
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
      <span className="text-slate-500">{label}</span>
      <span className={`text-slate-900 font-semibold ${mono ? 'font-mono text-blue-600' : ''}`}>
        {value}
      </span>
    </div>
  )
}
