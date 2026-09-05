'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'

export default function AdminSettingsPage() {
  const [campusName, setCampusName] = useState('Greenfield International School')
  const [campusCode, setCampusCode] = useState('GIS-LHR-01')
  const [phone, setPhone] = useState('+92 300 1234567')
  const [email, setEmail] = useState('admin@greenfield.edu.pk')
  const [address, setAddress] = useState('Plot 42-B, Sector G, Phase 5, DHA, Lahore')
  const [lang, setLang] = useState<'en' | 'ur'>('en')
  const [notifications, setNotifications] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [saved, setSaved] = useState(false)

  // Subscription state (Admin Only)
  const [plan, setPlan] = useState('Pro')
  const [trialDays, setTrialDays] = useState('30')

  // Password state (Self-Service)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const storedSchool = sessionStorage.getItem('eduflow-demo-school')
    const storedEmail = sessionStorage.getItem('eduflow-demo-email')
    const storedPlan = sessionStorage.getItem('eduflow-demo-plan')
    const storedDays = sessionStorage.getItem('eduflow-trial-days')

    if (storedSchool) setCampusName(storedSchool)
    if (storedEmail) setEmail(storedEmail)
    if (storedPlan) setPlan(storedPlan)
    if (storedDays) setTrialDays(storedDays)
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setPasswordLoading(true)

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error } = await supabaseClient.auth.updateUser({
          password: newPassword,
        })
        if (error) throw error

        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
        setNewPassword('')
        setConfirmPassword('')
        setPasswordLoading(false)
        return
      } catch (err: any) {
        setPasswordMessage({ type: 'error', text: err?.message || 'Failed to update password.' })
        setPasswordLoading(false)
        return
      }
    }

    // Demo Mode fallback
    setTimeout(() => {
      setPasswordLoading(false)
      setPasswordMessage({ type: 'success', text: 'Password changed successfully! (Demo session updated)' })
      setNewPassword('')
      setConfirmPassword('')
    }, 500)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-emerald-600 transition flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Campus Settings</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/billing" className="hover:text-emerald-600 transition font-medium text-slate-500">
            Billing &amp; Plan →
          </Link>
        </div>
      </nav>

      <div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20">
            Campus Configuration
          </Badge>
          <span className="text-sm text-slate-500 dark:text-slate-400">Academic Session 2026–2027</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Campus Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage school profile, branch metadata, WhatsApp alerts, and localization.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Building2 className="size-5 text-emerald-600" />
            <span>School Identity &amp; Profile</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">This information appears on fee challans, report cards, and parent receipts.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
              Institution Name
              <Input
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                required
                className="rounded-xl text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Campus Code
              <Input
                value={campusCode}
                onChange={(e) => setCampusCode(e.target.value)}
                required
                className="rounded-xl text-sm font-mono"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Official Contact Phone
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-xl text-sm font-mono"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
              Administrative Email
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
              Physical Campus Address
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="rounded-xl text-sm"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Bell className="size-5 text-emerald-600" />
            <span>Parent Broadcast &amp; Notifications</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Configure automated dispatch of student haziri and fee invoice alerts.</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold">Daily Attendance Absent Alerts</p>
                <p className="text-xs text-muted-foreground">Instantly dispatch notification to parents when student is marked absent.</p>
              </div>
              <Button
                type="button"
                variant={notifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(!notifications)}
                className={notifications ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              >
                {notifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold">Fee Challan Reminder Broadcast</p>
                <p className="text-xs text-muted-foreground">Send payment reminder on the 5th and 10th of every calendar month.</p>
              </div>
              <Button
                type="button"
                variant={smsAlerts ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={smsAlerts ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              >
                {smsAlerts ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold">Language Preference / زبان</p>
                <p className="text-xs text-muted-foreground">Switch default portal interface language.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
              >
                <Globe className="mr-1.5 size-3.5" />
                {lang === 'en' ? 'اردو' : 'English'}
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription & Plan Card (Admin Only) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <CreditCard className="size-5 text-emerald-600" />
              <span>Campus Subscription &amp; Plan Tier</span>
              <Badge className="ml-2 bg-emerald-600 text-white hover:bg-emerald-600 text-[10px]">
                Admin Only
              </Badge>
            </div>
            <Link
              href="/admin/billing"
              className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              Billing Details →
            </Link>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            School administrators have exclusive rights to manage campus subscription tiers, licenses, and renewal invoices.
          </p>

          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-4 dark:bg-emerald-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{plan} Plan</h3>
                  <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border-emerald-400">
                    30-Day Free Trial
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {trialDays} days remaining on your promotional trial period. Full access to 3-Copy Challans, Haziri, and WhatsApp broadcasts.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => window.location.href = '/admin/billing'}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shrink-0"
            >
              Manage Subscription &amp; Invoices
            </Button>
          </div>
        </div>

        {/* Account Password Card (Self-Service) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <KeyRound className="size-5 text-emerald-600" />
            <span>Account Security &amp; Password</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Change your personal login password. Available to all registered user accounts.
          </p>

          {passwordMessage && (
            <div
              className={`mt-4 rounded-xl p-3 text-xs font-medium ${
                passwordMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              New Password
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="rounded-xl text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Confirm New Password
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="rounded-xl text-sm"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={handlePasswordUpdate}
              disabled={passwordLoading || !newPassword}
              variant="outline"
              className="text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400"
            >
              {passwordLoading ? 'Updating Password…' : 'Update Password'}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6">
            {saved ? <Check className="mr-2 size-4" /> : <Save className="mr-2 size-4" />}
            {saved ? 'Settings Saved' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
