'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { isSuperAdminEmail, normalizeRole, getHomeRoute } from '@/lib/config'
import { ArrowRight, BookOpen, Building2, Eye, EyeOff, GraduationCap, LockKeyhole, LogOut, Mail, ShieldCheck, UserCheck, Users } from 'lucide-react'
import { AcademicCrest } from '@/components/academic-crest'

function isSafeRedirectUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) return false
  if (/[\r\n]/.test(trimmed)) return false
  try {
    const parsed = new URL(trimmed, 'https://localhost')
    return parsed.origin === 'https://localhost' && parsed.pathname.startsWith('/')
  } catch {
    return false
  }
}

function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24">
      <path
        key="google-blue"
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        key="google-green"
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        key="google-yellow"
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        key="google-red"
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string; destination: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    if (!isSupabaseConfigured || !supabaseClient) return
    const client = supabaseClient

    const checkExistingSession = async () => {
      try {
        const { data: { user } } = await client.auth.getUser()
        if (!user || !isMounted) return

        const searchParams = new URLSearchParams(window.location.search)
        const force = searchParams.get('force') === '1'

        const userEmail = (user.email ?? '').toLowerCase().trim()
        let role = (user.app_metadata?.role ?? user.user_metadata?.role ?? '') as string
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          if (profile?.role) {
            role = profile.role
          }
        } catch {}

        let normalizedRole = normalizeRole(role)
        if (isSuperAdminEmail(userEmail) || normalizedRole === 'super_admin') {
          normalizedRole = 'super_admin'
        }

        const destination = getHomeRoute(normalizedRole, userEmail)

        if (!force && isSafeRedirectUrl(destination)) {
          window.location.href = destination
        } else if (isMounted) {
          setCurrentUser({
            email: user.email ?? 'Current User',
            role: normalizedRole.replace(/_/g, ' '),
            destination,
          })
        }
      } catch {}
    }

    checkExistingSession()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSwitchAccount = async () => {
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut()
      } catch {}
    }
    setCurrentUser(null)
    setEmail('')
    setPassword('')
  }

  const handleGoogleAuth = async () => {
    setError('')
    setGoogleLoading(true)

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        const nextParam = searchParams?.get('next')
        const nextUrl = isSafeRedirectUrl(nextParam) ? nextParam : '/admin'

        const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl ?? '/admin')}`,
          },
        })
        if (oauthError) throw oauthError
        return
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google sign-in could not be initiated.'
        setError(message)
        setGoogleLoading(false)
        return
      }
    }

    setGoogleLoading(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setError('Please provide your registered email address.')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Please provide your password.')
      setLoading(false)
      return
    }

    try {
      // 1. If Supabase is configured, authenticate browser client
      let clientUser: any = null
      let clientErrorMsg = ''
      if (isSupabaseConfigured && supabaseClient) {
        try {
          const { data: cData, error: cErr } = await supabaseClient.auth.signInWithPassword({
            email: cleanEmail,
            password,
          })
          if (!cErr && cData?.user) {
            clientUser = cData.user
          } else if (cErr) {
            clientErrorMsg = cErr.message
          }
        } catch (cEx: any) {
          clientErrorMsg = cEx?.message || ''
        }
      }

      // 2. Call server auth endpoint (which sets HTTP cookies and handles teacher directory)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        // If client authenticated directly with Supabase, proceed safely to destination
        if (clientUser) {
          const role = (clientUser.app_metadata?.role || clientUser.user_metadata?.role || 'school_admin') as string
          const normalizedRole = normalizeRole(role)
          const destination = getHomeRoute(normalizedRole, cleanEmail)
          window.location.assign(destination)
          return
        }

        const msg = clientErrorMsg.toLowerCase().includes('email not confirmed')
          ? 'Your email address is not yet confirmed. Please verify your email confirmation or ask your administrator.'
          : (result.error || 'Invalid email or password. Please verify your credentials and try again.')
        setError(msg)
        setLoading(false)
        return
      }

      // 3. Resolve destination route
      const destination = result.destination || '/admin'

      // Check query parameter for redirect
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const nextPath = searchParams?.get('next')
      if (nextPath && isSafeRedirectUrl(nextPath) && !nextPath.startsWith('/login')) {
        if (nextPath.startsWith('/super-admin') && result.role !== 'super_admin') {
          window.location.assign(destination)
        } else {
          window.location.assign(nextPath)
        }
      } else {
        window.location.assign(destination)
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please check your network and try again.')
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <header className="login-brand">
          <Link href="/" className="login-brand-link" aria-label="EduFlow OS home">
            <AcademicCrest size={28} className="shrink-0" />
            <div className="flex flex-col text-left">
              <strong className="text-base font-bold text-slate-900 leading-none">EduFlow <em className="not-italic text-blue-600">OS</em></strong>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Institutional Edition</span>
            </div>
          </Link>
          <div className="login-session"><i /> Academic Session <b>2026–27</b></div>
        </header>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-heading">
            <div className="login-lock"><LockKeyhole /></div>
            <div>
              <p className="login-kicker">Secure campus access</p>
              <h1 id="login-title">Sign In</h1>
              <p>Enter your credentials to access your portal</p>
            </div>
          </div>

          {currentUser && (
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs text-slate-800">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <UserCheck className="size-4 text-blue-600" />
                <span>Currently active: {currentUser.email} ({currentUser.role})</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <Link
                  href={currentUser.destination}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Go to Dashboard <ArrowRight className="ml-1 size-3" />
                </Link>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="mr-1 size-3" /> Switch Account
                </button>
              </div>
            </div>
          )}

          {/* Google OAuth Option */}
          <div className="mt-4">
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
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form !mt-0">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="user@school.edu.pk"
              required
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {error && (
              <p className="login-error text-red-500 font-medium text-xs mt-1" role="alert">
                {error}
              </p>
            )}

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <a href="mailto:support@eduflow.pk?subject=EduFlow%20Password%20Reset%20Request">
                Forgot password?
              </a>
            </div>

            <button
              className="login-submit"
              type="submit"
              data-testid="btn-login"
              disabled={loading}
            >
              {loading ? 'Authenticating…' : 'Sign in to EduFlow'} {!loading && <ArrowRight />}
            </button>
          </form>

          <div className="login-help">
            <ShieldCheck />
            <span>Strict role-based authentication enforced via Supabase.</span>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Don&apos;t have a school account yet?{' '}
              <Link href="/signup" className="font-bold text-blue-600 hover:underline">
                Sign Up for 30-Day Free Pro Trial →
              </Link>
            </p>
          </div>
        </section>

        <footer className="login-footer flex flex-col gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition">← Homepage</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-blue-600 transition">Campus Admin</Link>
            <span>•</span>
            <Link href="/teacher" className="hover:text-blue-600 transition">Teacher Portal</Link>
            <span>•</span>
            <Link href="/parent" className="hover:text-blue-600 transition">Parents Portal</Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <span>Need help signing in?</span>
            <a href="mailto:support@eduflow.pk" className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline">
              <Mail className="size-3.5" /> Campus Support Desk
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
