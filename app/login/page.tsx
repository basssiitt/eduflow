'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { isSuperAdminEmail, normalizeRole, getHomeRoute } from '@/lib/config'
import { ArrowRight, Eye, EyeOff, LockKeyhole, LogOut, MessageCircle, ShieldCheck, UserCheck } from 'lucide-react'

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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
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
      await supabaseClient.auth.signOut()
    }
    setCurrentUser(null)
    setEmail('')
    setPassword('')
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
      if (isSafeRedirectUrl(nextPath) && !nextPath!.startsWith('/login')) {
        if (nextPath!.startsWith('/super-admin') && normalizedRole !== 'super_admin') {
          window.location.href = destination
        } else {
          window.location.href = nextPath!
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
            <span>EF</span>
            <strong>EduFlow <em>OS</em></strong>
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
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-50/70 p-3 dark:bg-emerald-950/40 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                <UserCheck className="size-4" />
                <span>Currently active: {currentUser.email} ({currentUser.role})</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <Link
                  href={currentUser.destination}
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Go to Dashboard <ArrowRight className="ml-1 size-3" />
                </Link>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  <LogOut className="mr-1 size-3" /> Switch Account
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
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
        </section>

        <footer className="login-footer flex flex-col gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition">← Back to EduFlow Homepage</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-emerald-600 transition">Campus Admin</Link>
            <span>•</span>
            <Link href="/teacher" className="hover:text-emerald-600 transition">Teacher Console</Link>
            <span>•</span>
            <Link href="/parent" className="hover:text-emerald-600 transition">Parent Portal</Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <span>Need help signing in?</span>
            <a href="https://wa.me/923127803616" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:underline">
              <MessageCircle className="size-3.5" /> WhatsApp Support
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
