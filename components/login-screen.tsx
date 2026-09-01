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

    const demoRoles: Record<string, { role: string; destination: string }> = {
      'basithunyawrr@gmail.com': { role: 'super-admin', destination: '/super-admin' },
      'basithadi@gmail.com': { role: 'super-admin', destination: '/super-admin' },
      'superadmin@eduflow.pk': { role: 'super-admin', destination: '/super-admin' },
      'admin@alnoor.edu.pk': { role: 'school-admin', destination: '/admin' },
      'teacher@alnoor.edu.pk': { role: 'teacher', destination: '/teacher' },
      'parent@alnoor.edu.pk': { role: 'parent', destination: '/parent' },
    }

    const demo = demoRoles[identifier.trim().toLowerCase()]
    const useDemoFallback = () => {
      if (!demo) {
        setError('Invalid email or password. For demo mode, try basithunyawrr@gmail.com, admin@alnoor.edu.pk, teacher@alnoor.edu.pk, parent@alnoor.edu.pk, or superadmin@eduflow.pk')
        setLoading(false)
        return
      }
      sessionStorage.setItem('eduflow-demo-role', demo.role)
      sessionStorage.setItem('eduflow-demo-email', identifier.trim())
      if (nextPath && nextPath.startsWith('/')) {
        window.location.href = nextPath
      } else {
        window.location.href = demo.destination
      }
    }

    if (!isSupabaseConfigured || !supabaseClient) {
      useDemoFallback()
      return
    }

    try {
      const { data: { user }, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: identifier.trim(),
        password: secret,
      })

      if (authError || !user) {
        useDemoFallback()
        return
      }

      // Execute getSession to ensure session cookies are set
      await supabaseClient.auth.getSession()

      sessionStorage.removeItem('eduflow-demo-role')
      sessionStorage.removeItem('eduflow-demo-email')

      const userEmail = (user.email || identifier).toLowerCase().trim()
      const isSuperAdminEmail =
        userEmail === 'basithunyawrr@gmail.com' ||
        userEmail === 'basithadi@gmail.com' ||
        userEmail === 'superadmin@eduflow.pk'

      let role = (user.app_metadata?.role || user.user_metadata?.role || '') as string
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

      let normalizedRole = (role || '').toLowerCase().replace(/-/g, '_')
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

      const defaultHome = (isSuperAdminEmail || normalizedRole === 'super_admin')
        ? '/super-admin'
        : (destinations[normalizedRole] ?? '/admin')

      if (nextPath && nextPath.startsWith('/')) {
        // Validate if user has permission for nextPath
        if (nextPath.startsWith('/super-admin') && normalizedRole !== 'super_admin' && !isSuperAdminEmail) {
          window.location.href = defaultHome
        } else {
          window.location.href = nextPath
        }
      } else {
        // Force full document navigation with fresh auth cookies
        window.location.href = defaultHome
      }
    } catch {
      useDemoFallback()
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <header className="login-brand">
          <a href="/" className="login-brand-link" aria-label="EduFlow OS home"><span>EF</span><strong>EduFlow <em>OS</em></strong></a>
          <div className="login-session"><i /> Academic Session <b>2026–27</b></div>
        </header>
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-heading"><div className="login-lock"><LockKeyhole /></div><div><p className="login-kicker">Secure campus access</p><h1 id="login-title">Welcome back</h1><p>Sign in to your EduFlow workspace</p></div></div>
          <form onSubmit={submit} className="login-form">
            <label htmlFor="identifier">Email / Username</label>
            <input id="identifier" type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" placeholder="name@school.edu.pk" required />
            <label htmlFor="secret">Password</label>
            <div className="password-field">
              <input id="secret" type={showSecret ? 'text' : 'password'} value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="current-password" required />
              <button type="button" onClick={() => setShowSecret(!showSecret)} aria-label={showSecret ? 'Hide password' : 'Show password'}>{showSecret ? <EyeOff /> : <Eye />}</button>
            </div>
            {error && <p className="login-error" role="alert">{error}</p>}
            <div className="login-options">
              <label className="remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Remember me</span></label>
              <a href="https://wa.me/923001234567?text=I%20need%20help%20resetting%20my%20EduFlow%20password" target="_blank" rel="noreferrer">Forgot password?</a>
            </div>
            <button className="login-submit" type="submit" data-testid="btn-login" disabled={loading}>{loading ? 'Opening workspace…' : 'Sign in to EduFlow'} {!loading && <ArrowRight />}</button>
          </form>
          <div className="login-help"><ShieldCheck /><span>Your data is encrypted and protected by EduFlow OS.</span></div>
        </section>
        <footer className="login-footer"><span>Need help signing in?</span><a href="https://wa.me/923001234567" target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp support</a></footer>
      </div>
    </main>
  )
}
