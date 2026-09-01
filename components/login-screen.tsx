'use client'

import { useState } from 'react'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { ArrowRight, Eye, EyeOff, LockKeyhole, MessageCircle, ShieldCheck } from 'lucide-react'

export function LoginScreen() {
  const [identifier, setIdentifier] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const nextPath = searchParams?.get('next')

    if (!isSupabaseConfigured || !supabaseClient) {
      setError('Supabase is not configured. Please check environment variables.')
      setLoading(false)
      return
    }

    try {
      const email = identifier.trim()
      const { data: { user }, error: authError } = await supabaseClient.auth.signInWithPassword({
        email,
        password: secret,
      })

      if (authError || !user) {
        setError(authError?.message || 'Invalid email or password. Please try again.')
        setLoading(false)
        return
      }

      // Ensure session cookies are synced
      await supabaseClient.auth.getSession()

      const userEmail = (user.email || email).toLowerCase().trim()
      const isSuperAdminEmail =
        userEmail === 'basithunyawrr@gmail.com' ||
        userEmail === 'basithadi@gmail.com' ||
        userEmail === 'superadmin@eduflow.pk'

      // Fetch user role strictly from public.profiles table
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

      let normalizedRole = role.toLowerCase().replace(/-/g, '_')
      if (isSuperAdminEmail || normalizedRole === 'super_admin') {
        normalizedRole = 'super_admin'
      }

      const destinations: Record<string, string> = {
        super_admin: '/super-admin',
        school_admin: '/admin',
        admin: '/admin',
        teacher: '/teacher',
        parent: '/parent',
      }

      const defaultHome = destinations[normalizedRole] || (isSuperAdminEmail ? '/super-admin' : '/admin')

      if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('/login')) {
        // Enforce role authorization on next path
        if (nextPath.startsWith('/super-admin') && normalizedRole !== 'super_admin') {
          window.location.href = defaultHome
        } else {
          window.location.href = nextPath
        }
      } else {
        window.location.href = defaultHome
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <header className="login-brand">
          <a href="/" className="login-brand-link" aria-label="EduFlow OS home">
            <span>EF</span>
            <strong>EduFlow <em>OS</em></strong>
          </a>
          <div className="login-session"><i /> Academic Session <b>2026–27</b></div>
        </header>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-heading">
            <div className="login-lock"><LockKeyhole /></div>
            <div>
              <p className="login-kicker">Secure campus access</p>
              <h1 id="login-title">Welcome back</h1>
              <p>Sign in to your EduFlow workspace</p>
            </div>
          </div>

          <form onSubmit={submit} className="login-form">
            <label htmlFor="identifier">Email / Username</label>
            <input
              id="identifier"
              type="email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
              placeholder="basithunyawrr@gmail.com"
              required
            />

            <label htmlFor="secret">Password</label>
            <div className="password-field">
              <input
                id="secret"
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                aria-label={showSecret ? 'Hide password' : 'Show password'}
              >
                {showSecret ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}

            <div className="login-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="https://wa.me/923001234567?text=I%20need%20help%20resetting%20my%20EduFlow%20password" target="_blank" rel="noreferrer">
                Forgot password?
              </a>
            </div>

            <button className="login-submit" type="submit" data-testid="btn-login" disabled={loading}>
              {loading ? 'Authenticating…' : 'Sign in to EduFlow'} {!loading && <ArrowRight />}
            </button>
          </form>

          <div className="login-help">
            <ShieldCheck />
            <span>Strict Supabase RBAC authentication enabled.</span>
          </div>
        </section>

        <footer className="login-footer">
          <span>Need help signing in?</span>
          <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer">
            <MessageCircle /> WhatsApp support
          </a>
        </footer>
      </div>
    </main>
  )
}
