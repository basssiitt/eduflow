'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { isSuperAdminEmail, normalizeRole, getHomeRoute } from '@/lib/config'
import { ArrowRight, BookOpen, Building2, Eye, EyeOff, GraduationCap, LockKeyhole, LogOut, MessageCircle, ShieldCheck, UserCheck, Users } from 'lucide-react'
import { AcademicCrest } from '@/components/academic-crest'

function isSafeRedirectUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) return false
  if (/[\r\n]/.test(trimmed)) return false
  try {
    const parsed = new URL(trimmed, 'http://localhost')
    return parsed.origin === 'http://localhost' && parsed.pathname.startsWith('/')
  } catch {
    return false
  }
}

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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string; destination: string } | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabaseClient) return
    const client = supabaseClient

    const checkExistingSession = async () => {
      try {
        const { data: { user } } = await client.auth.getUser()
        if (!user) return

        const searchParams = new URLSearchParams(window.location.search)
        const force = searchParams.get('force') === '1'

        const userEmail = (user.email || '').toLowerCase().trim()
        let role = (user.app_metadata?.role || user.user_metadata?.role || '') as string
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

        if (!force) {
          window.location.href = destination
        } else {
          setCurrentUser({
            email: user.email || 'Current User',
            role: normalizedRole.replace(/_/g, ' '),
            destination,
          })
        }
      } catch {}
    }

    checkExistingSession()
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
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl!)}`,
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
    handleInstantDemo('school_admin', '/admin')
  }

  const handleInstantDemo = (role: string, destination: string) => {
    document.cookie = `eduflow-demo-role=${role}; path=/; max-age=86400; SameSite=Lax`
    sessionStorage.setItem('eduflow-demo-user', 'true')
    sessionStorage.setItem('eduflow-demo-role', role)
    if (role === 'school_admin') {
      sessionStorage.setItem('eduflow-demo-email', 'admin@school.edu.pk')
      sessionStorage.setItem('eduflow-demo-school', 'Beacon Scholars Academy')
      sessionStorage.setItem('eduflow-demo-plan', 'Pro')
      sessionStorage.setItem('eduflow-trial-days', '30')
    } else if (role === 'teacher') {
      sessionStorage.setItem('eduflow-demo-email', 'tariq.teacher@school.edu.pk')
    } else if (role === 'parent') {
      sessionStorage.setItem('eduflow-demo-email', 'parent@family.edu.pk')
    } else if (role === 'student') {
      sessionStorage.setItem('eduflow-demo-email', 'zain.student@school.edu.pk')
    }
    window.location.href = destination
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (!isSupabaseConfigured || !supabaseClient) {
      setError('Supabase is not configured. Please check environment variables.')
      setLoading(false)
      return
    }

    try {
      const cleanEmail = email.trim()
      const { data, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (authError || !data?.user) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Sync auth session cookies
      await supabaseClient.auth.getSession()

      const user = data.user
      const userEmail = (user.email || cleanEmail).toLowerCase().trim()

      // Fetch the user's actual role from Supabase profiles table
      let role = ''
      try {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role) {
          role = profile.role
        }
      } catch {}

      if (!role) {
        role = (user.app_metadata?.role || user.user_metadata?.role || '') as string
      }

      let normalizedRole = normalizeRole(role)
      if (isSuperAdminEmail(userEmail) || normalizedRole === 'super_admin') {
        normalizedRole = 'super_admin'
      }

      const destination = getHomeRoute(normalizedRole, userEmail)

      // Honor next query param only if safe relative URL and authorized
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const nextPath = searchParams?.get('next')
      if (nextPath && isSafeRedirectUrl(nextPath) && !nextPath.startsWith('/login')) {
        if (nextPath.startsWith('/super-admin') && normalizedRole !== 'super_admin') {
          window.location.href = destination
        } else {
          window.location.href = nextPath
        }
      } else {
        window.location.href = destination
      }
    } catch {
      setError('Invalid email or password')
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
              <strong className="text-base font-bold text-[#2c1d17] leading-none">EduFlow <em className="not-italic text-[#c5a059]">OS</em></strong>
              <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Institutional Edition</span>
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
            <div className="mb-4 rounded-xl border border-[#c5a059]/40 bg-[#faf9f5] p-3 text-xs text-[#2c1d17]">
              <div className="flex items-center gap-2 font-semibold text-[#2c1d17]">
                <UserCheck className="size-4 text-[#c5a059]" />
                <span>Currently active: {currentUser.email} ({currentUser.role})</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <Link
                  href={currentUser.destination}
                  className="inline-flex items-center rounded-lg bg-[#2c1d17] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1e130f]"
                >
                  Go to Dashboard <ArrowRight className="ml-1 size-3" />
                </Link>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="inline-flex items-center rounded-lg border border-[#e7e2da] bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-[#faf9f5]"
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
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#e7e2da] bg-[#faf9f5] py-2.5 px-4 text-xs font-semibold text-[#2c1d17] shadow-xs hover:bg-[#f7f5f0] hover:border-[#c5a059] transition"
            >
              <GoogleIcon />
              <span>{googleLoading ? 'Connecting to Google…' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e7e2da]" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium text-stone-400">
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
              <a href="https://wa.me/923001234567?text=I%20need%20help%20resetting%20my%20EduFlow%20password" target="_blank" rel="noreferrer">
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

          {/* 1-Click Instant Demo Workspaces */}
          <div className="mt-5 rounded-2xl border border-[#e7e2da] bg-[#faf9f5] p-4 text-left">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2c1d17]">
                1-Click Interactive Demo Portals
              </span>
              <span className="rounded-full bg-[#f7f5f0] border border-[#e7e2da] px-2 py-0.5 text-[10px] font-semibold text-[#2c1d17]">
                Test Mode
              </span>
            </div>
            <p className="text-xs text-stone-600 mb-3">
              Explore and test EduFlow OS across the 3 user portals without needing manual login:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleInstantDemo('school_admin', '/admin')}
                className="flex items-center gap-2 rounded-xl border border-[#e7e2da] bg-white p-2.5 font-semibold text-[#2c1d17] shadow-xs hover:border-[#c5a059] hover:bg-[#f7f5f0] transition text-left"
              >
                <Building2 className="size-4 text-[#2c1d17] shrink-0" />
                <span className="truncate">School Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleInstantDemo('teacher', '/teacher')}
                className="flex items-center gap-2 rounded-xl border border-[#e7e2da] bg-white p-2.5 font-semibold text-[#2c1d17] shadow-xs hover:border-[#c5a059] hover:bg-[#f7f5f0] transition text-left"
              >
                <GraduationCap className="size-4 text-[#c5a059] shrink-0" />
                <span className="truncate">Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => handleInstantDemo('parent', '/parent')}
                className="flex items-center gap-2 rounded-xl border border-[#e7e2da] bg-white p-2.5 font-semibold text-[#2c1d17] shadow-xs hover:border-[#c5a059] hover:bg-[#f7f5f0] transition text-left"
              >
                <Users className="size-4 text-[#8c6b2d] shrink-0" />
                <span className="truncate">Parent</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#e7e2da] text-center">
            <p className="text-xs text-stone-600">
              Don&apos;t have a school account yet?{' '}
              <Link href="/signup" className="font-bold text-[#2c1d17] hover:text-[#c5a059] hover:underline">
                Sign Up for 30-Day Free Pro Trial →
              </Link>
            </p>
          </div>
        </section>

        <footer className="login-footer flex flex-col gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-stone-500">
            <Link href="/" className="hover:text-[#2c1d17] transition">← Back to EduFlow Homepage</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-[#2c1d17] transition">Campus Admin</Link>
            <span>•</span>
            <Link href="/teacher" className="hover:text-[#2c1d17] transition">Teacher Console</Link>
            <span>•</span>
            <Link href="/parent" className="hover:text-[#2c1d17] transition">Parent Portal</Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-stone-600">
            <span>Need help signing in?</span>
            <a href="https://wa.me/923127803616" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#2c1d17] hover:text-[#c5a059] hover:underline">
              <MessageCircle className="size-3.5" /> WhatsApp Support
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
