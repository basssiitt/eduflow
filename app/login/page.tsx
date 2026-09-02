'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { ArrowRight, Eye, EyeOff, LockKeyhole, MessageCircle, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

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

      let normalizedRole = role.toLowerCase().replace(/-/g, '_')
      const isSuperAdminEmail =
        userEmail === 'basithunyawrr@gmail.com' ||
        userEmail === 'basithadi@gmail.com' ||
        userEmail === 'superadmin@eduflow.pk'

      if (isSuperAdminEmail || normalizedRole === 'super_admin') {
        normalizedRole = 'super_admin'
      }

      // Strict role-based destination
      let destination = '/admin'
      if (normalizedRole === 'super_admin') {
        destination = '/super-admin'
      } else if (normalizedRole === 'school_admin' || normalizedRole === 'admin') {
        destination = '/admin'
      } else if (normalizedRole === 'teacher') {
        destination = '/teacher'
      } else if (normalizedRole === 'parent') {
        destination = '/parent'
      }

      // Honor next query param if authorized
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const nextPath = searchParams?.get('next')
      if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('/login')) {
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
