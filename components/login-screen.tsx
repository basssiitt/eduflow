'use client'

import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, MessageCircle, ShieldCheck } from 'lucide-react'

type Persona = { role: string; label: string; identifier: string; secret: string; destination: string; initials: string }

const personas: Persona[] = [
  { role: 'super-admin', label: 'Super Admin', identifier: 'admin@eduflow.pk', secret: 'eduflow2026', destination: '/super-admin', initials: 'SA' },
  { role: 'school-admin', label: 'School Admin', identifier: 'admin@alnoor.edu.pk', secret: 'school2026', destination: '/admin', initials: 'AD' },
  { role: 'teacher', label: 'Teacher', identifier: 'sana@alnoor.edu.pk', secret: 'teacher2026', destination: '/teacher', initials: 'ST' },
  { role: 'parent', label: 'Parent', identifier: 'parent@example.com', secret: 'parent2026', destination: '/parent', initials: 'PA' },
]

export function LoginScreen() {
  const [mode, setMode] = useState<'staff' | 'parent'>('staff')
  const [selected, setSelected] = useState('school-admin')
  const [identifier, setIdentifier] = useState('admin@alnoor.edu.pk')
  const [secret, setSecret] = useState('school2026')
  const [showSecret, setShowSecret] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  const pickPersona = (persona: Persona) => {
    setSelected(persona.role)
    setIdentifier(persona.identifier)
    setSecret(persona.secret)
    setMode(persona.role === 'parent' ? 'parent' : 'staff')
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    const persona = personas.find((item) => item.role === selected) ?? personas[1]
    window.setTimeout(() => { window.location.href = persona.destination }, 450)
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
          <div className="persona-picker"><p>Quick access</p><div className="persona-grid">{personas.map((persona) => <button key={persona.role} type="button" onClick={() => pickPersona(persona)} className={selected === persona.role ? 'persona active' : 'persona'} aria-pressed={selected === persona.role}><span>{persona.initials}</span><b>{persona.label}</b></button>)}</div></div>
          <div className="auth-tabs" role="tablist" aria-label="Account type"><button type="button" role="tab" aria-selected={mode === 'staff'} className={mode === 'staff' ? 'active' : ''} onClick={() => setMode('staff')}>Staff &amp; Admin</button><button type="button" role="tab" aria-selected={mode === 'parent'} className={mode === 'parent' ? 'active' : ''} onClick={() => { setMode('parent'); pickPersona(personas[3]) }}>Parent</button></div>
          <form onSubmit={submit} className="login-form"><label htmlFor="identifier">{mode === 'parent' ? 'Email address' : 'Work email or username'}</label><input id="identifier" type="email" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" required /><label htmlFor="secret">Password</label><div className="password-field"><input id="secret" type={showSecret ? 'text' : 'password'} value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="current-password" required /><button type="button" onClick={() => setShowSecret(!showSecret)} aria-label={showSecret ? 'Hide password' : 'Show password'}>{showSecret ? <EyeOff /> : <Eye />}</button></div><div className="login-options"><label className="remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Remember me</span></label><a href="https://wa.me/923001234567?text=I%20need%20help%20resetting%20my%20EduFlow%20password" target="_blank" rel="noreferrer">Forgot password?</a></div><button className="login-submit" type="submit" data-testid="btn-login" disabled={loading}>{loading ? 'Opening workspace…' : 'Sign in to EduFlow'} {!loading && <ArrowRight />}</button></form>
          <div className="login-help"><ShieldCheck /><span>Your data is encrypted and protected by EduFlow OS.</span></div>
        </section>
        <footer className="login-footer"><span>Need help signing in?</span><a href="https://wa.me/923001234567" target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp support</a></footer>
      </div>
    </main>
  )
}
