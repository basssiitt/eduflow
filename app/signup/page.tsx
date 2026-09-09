'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { ArrowRight, Building2, Check, Eye, EyeOff, LockKeyhole, Mail, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { AcademicCrest } from '@/components/academic-crest'

function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [city, setCity] = useState('Karachi')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleGoogleAuth = async () => {
    setError('')
    setGoogleLoading(true)

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          },
        })
        if (oauthError) throw oauthError
        return
      } catch (err: any) {
        setError(err?.message || 'Google sign-in could not be initiated.')
        setGoogleLoading(false)
        return
      }
    }

    // Demo Mode Google Simulator
    sessionStorage.setItem('eduflow-demo-user', 'true')
    sessionStorage.setItem('eduflow-demo-email', 'admin.google@school.edu.pk')
    sessionStorage.setItem('eduflow-demo-school', schoolName || 'Beacon Scholars Academy')
    sessionStorage.setItem('eduflow-demo-plan', 'Pro')
    sessionStorage.setItem('eduflow-trial-days', '30')
    router.push('/admin')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    // ubs:ignore - Client-side form confirmation check
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.')
      return
    }

    setLoading(true)
    const cleanEmail = email.trim().toLowerCase()
    const cleanSchool = schoolName.trim()
    const cleanName = fullName.trim()

    // 1. Supabase Mode
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error: signUpError } = await supabaseClient.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              school_name: cleanSchool,
              city,
              role: 'school_admin',
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        // If email confirmation is required by Supabase settings:
        if (data.user && !data.session) {
          setEmailSent(true)
          setLoading(false)
          return
        }

        // If session created immediately (auto-confirm enabled):
        if (data.session) {
          // Provision campus in database
          try {
            await supabaseClient.from('campuses').insert([
              {
                name: cleanSchool,
                city,
                owner: cleanName,
                plan: 'Pro',
                students: 0,
                status: 'Active',
                admin_email: cleanEmail,
              },
            ])
          } catch {}

          window.location.replace('/admin')
          return
        }
      } catch (err: any) {
        setError(err?.message || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }
    }

    // 2. Demo / Standalone Mode
    try {
      sessionStorage.setItem('eduflow-demo-user', 'true')
      sessionStorage.setItem('eduflow-demo-email', cleanEmail)
      sessionStorage.setItem('eduflow-demo-school', cleanSchool)
      sessionStorage.setItem('eduflow-demo-owner', cleanName)
      sessionStorage.setItem('eduflow-demo-plan', 'Pro')
      sessionStorage.setItem('eduflow-trial-days', '30')
      window.location.replace('/admin')
    } catch {
      setError('Unable to initialize demo workspace.')
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell max-w-lg">
        <header className="login-brand">
          <Link href="/" className="login-brand-link" aria-label="EduFlow OS home">
            <AcademicCrest size={28} className="shrink-0" />
            <div className="flex flex-col text-left">
              <strong className="text-base font-bold text-slate-900 leading-none">EduFlow <em className="not-italic text-blue-600">OS</em></strong>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Institutional Edition</span>
            </div>
          </Link>
          <div className="login-session">
            <i /> Academic Session <b>2026–27</b>
          </div>
        </header>

        <section className="login-card" aria-labelledby="signup-title">
          {emailSent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50/50 text-blue-600 border border-blue-200">
                <Mail className="size-7 text-blue-600" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-blue-600">
                Verification Required
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Check your email inbox
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-xs">
                We sent a confirmation link to <strong className="text-slate-900">{email}</strong>.
                Click the link in your email to activate your school account and start your 30-day Pro trial.
              </p>

              <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                <Link
                  href="/login"
                  className="login-submit w-full text-center"
                >
                  Return to Sign In <ArrowRight className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="login-card-heading">
                <div className="login-lock">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <p className="login-kicker">30-Day Free Pro Trial</p>
                  <h1 id="signup-title">Create School Workspace</h1>
                  <p>Register as School Admin &amp; assign your campus</p>
                </div>
              </div>

              {/* 30-Day Pro Trial Banner */}
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 text-xs text-slate-800">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Sparkles className="size-4 text-blue-600" />
                  <span>Pro Plan 30-Day Free Trial Included</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  Includes 1-Click Haziri, 3-Copy Fee Challans, WhatsApp reminders, and complete portal access. No credit card required.
                </p>
              </div>

              {/* Google OAuth Option */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading || loading}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition"
                >
                  <GoogleIcon />
                  <span>{googleLoading ? 'Connecting to Google…' : 'Continue with Google'}</span>
                </button>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-medium text-slate-400">
                    or register with school email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="login-form !mt-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label htmlFor="fullname" className="sm:col-span-2">
                    Your Full Name
                    <input
                      id="fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Muhammad Usman"
                      required
                    />
                  </label>

                  <label htmlFor="schoolname" className="sm:col-span-2">
                    School / Campus Name
                    <input
                      id="schoolname"
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Beacon Scholars Academy"
                      required
                    />
                  </label>

                  <label htmlFor="city" className="sm:col-span-2">
                    Campus City / Region
                    <select
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                    >
                      <option>Karachi</option>
                      <option>Lahore</option>
                      <option>Islamabad</option>
                      <option>Rawalpindi</option>
                      <option>Faisalabad</option>
                      <option>Multan</option>
                      <option>Peshawar</option>
                      <option>Quetta</option>
                      <option>Other / Remote</option>
                    </select>
                  </label>

                  <label htmlFor="email" className="sm:col-span-2">
                    Official Admin Email Address
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@school.edu.pk"
                      required
                    />
                  </label>

                  <label htmlFor="password">
                    Create Password
                    <div className="password-field">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </label>

                  <label htmlFor="confirmPassword">
                    Confirm Password
                    <div className="password-field">
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        minLength={6}
                      />
                    </div>
                  </label>
                </div>

                {error && (
                  <p className="login-error text-red-500 font-medium text-xs mt-2" role="alert">
                    {error}
                  </p>
                )}

                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600 shrink-0" />
                  <span>By registering, you agree to EduFlow&apos;s Terms of Service and 30-day Pro trial terms.</span>
                </div>

                <button
                  className="login-submit !mt-3"
                  type="submit"
                  disabled={loading}
                  data-testid="btn-signup"
                >
                  {loading ? 'Setting up workspace…' : 'Start 30-Day Free Pro Trial'}
                  {!loading && <ArrowRight className="size-4" />}
                </button>
              </form>
            </>
          )}

          <div className="login-help !mt-4">
            <ShieldCheck className="size-4 text-blue-600" />
            <span>Multi-tenant encrypted isolation with instant campus provisioning.</span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Already have a school account?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Sign in to your portal →
              </Link>
            </p>
          </div>
        </section>

        <footer className="login-footer flex flex-col gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition">← Back to EduFlow Homepage</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-blue-600 transition">Campus Admin</Link>
            <span>•</span>
            <Link href="/teacher" className="hover:text-blue-600 transition">Teacher Console</Link>
            <span>•</span>
            <Link href="/parent" className="hover:text-blue-600 transition">Parent Portal</Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <span>Need assistance?</span>
            <a
              href="https://wa.me/923127803616?text=Hi%20EduFlow%2C%20I%20need%20help%20signing%20up%20my%20school."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
            >
              <MessageCircle className="size-3.5" /> WhatsApp Support
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
