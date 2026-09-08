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

    // ubs:ignore - Client-side form confirmation check, not cryptographic authentication
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
          <Link href="/admin" className="hover:text-[#c5a059] transition flex items-center gap-1 text-[#5c4a3e]">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-[#2c1d17] font-semibold">Campus Settings</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/billing" className="hover:text-[#c5a059] transition font-medium text-[#8c7a6b]">
            Billing &amp; Plan →
          </Link>
        </div>
      </nav>

      <div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#faf9f5] text-[#2c1d17] border-[#c5a059]/30">
            Campus Configuration
          </Badge>
          <span className="text-sm text-[#786c62]">Academic Session 2026–2027</span>
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#2c1d17]">Campus Settings</h1>
        <p className="text-[#786c62]">Manage school profile, branch metadata, WhatsApp alerts, and localization.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 text-base font-bold text-[#2c1d17]">
            <Building2 className="size-5 text-[#c5a059]" />
            <span>School Identity &amp; Profile</span>
          </div>
          <p className="mt-1 text-xs text-[#786c62]">This information appears on fee challans, report cards, and parent receipts.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#2c1d17] sm:col-span-2">
              Institution Name
              <Input
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                required
                className="rounded-xl text-sm border-[#e7e2da] text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#2c1d17]">
              Campus Code
              <Input
                value={campusCode}
                onChange={(e) => setCampusCode(e.target.value)}
                required
                className="rounded-xl text-sm font-mono border-[#e7e2da] text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#2c1d17]">
              Official Contact Phone
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-xl text-sm font-mono border-[#e7e2da] text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#2c1d17] sm:col-span-2">
              Administrative Email
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl text-sm border-[#e7e2da] text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#2c1d17] sm:col-span-2">
              Physical Campus Address
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="rounded-xl text-sm border-[#e7e2da] text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 text-base font-bold text-[#2c1d17]">
            <Bell className="size-5 text-[#c5a059]" />
            <span>Parent Broadcast &amp; Notifications</span>
          </div>
          <p className="mt-1 text-xs text-[#786c62]">Configure automated dispatch of student haziri and fee invoice alerts.</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[#e7e2da] p-4">
              <div>
                <p className="text-sm font-bold text-[#2c1d17]">Daily Attendance Absent Alerts</p>
                <p className="text-xs text-[#786c62]">Instantly dispatch notification to parents when student is marked absent.</p>
              </div>
              <Button
                type="button"
                variant={notifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(!notifications)}
                className={notifications ? "bg-[#2c1d17] hover:bg-[#3d2a20] text-white shadow-xs" : "border-[#e7e2da] text-[#2c1d17] hover:bg-[#faf9f5]"}
              >
                {notifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#e7e2da] p-4">
              <div>
                <p className="text-sm font-bold text-[#2c1d17]">Fee Challan Reminder Broadcast</p>
                <p className="text-xs text-[#786c62]">Send payment reminder on the 5th and 10th of every calendar month.</p>
              </div>
              <Button
                type="button"
                variant={smsAlerts ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={smsAlerts ? "bg-[#2c1d17] hover:bg-[#3d2a20] text-white shadow-xs" : "border-[#e7e2da] text-[#2c1d17] hover:bg-[#faf9f5]"}
              >
                {smsAlerts ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#e7e2da] p-4">
              <div>
                <p className="text-sm font-bold text-[#2c1d17]">Language Preference / زبان</p>
                <p className="text-xs text-[#786c62]">Switch default portal interface language.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                // ubs:ignore - UI language toggle
                onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
                className="border-[#e7e2da] text-[#2c1d17] hover:bg-[#faf9f5]"
              >
                <Globe className="mr-1.5 size-3.5 text-[#c5a059]" />
                {lang === 'en' ? 'اردو' : 'English'}
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription & Plan Card (Admin Only) */}
        <div className="rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold text-[#2c1d17]">
              <CreditCard className="size-5 text-[#c5a059]" />
              <span>Campus Subscription &amp; Plan Tier</span>
              <Badge className="ml-2 bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da] text-[10px]">
                Admin Only
              </Badge>
            </div>
            <Link
              href="/admin/billing"
              className="text-xs font-semibold text-[#c5a059] hover:underline inline-flex items-center gap-1"
            >
              Billing Details →
            </Link>
          </div>
          <p className="mt-1 text-xs text-[#786c62]">
            School administrators have exclusive rights to manage campus subscription tiers, licenses, and renewal invoices.
          </p>

          <div className="mt-4 rounded-xl border border-[#c5a059]/40 bg-[#faf9f5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#2c1d17] border border-[#e7e2da] shrink-0">
                <Sparkles className="size-5 text-[#c5a059]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#2c1d17]">{plan} Plan</h3>
                  <Badge variant="outline" className="text-[10px] font-semibold text-[#166534] border-emerald-400 bg-emerald-50">
                    30-Day Free Trial
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#5c4a3e]">
                  {trialDays} days remaining on your promotional trial period. Full access to 3-Copy Challans, Haziri, and WhatsApp broadcasts.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => window.location.href = '/admin/billing'}
              className="bg-[#2c1d17] hover:bg-[#3d2a20] text-white text-xs shrink-0 shadow-xs"
            >
              Manage Subscription &amp; Invoices
            </Button>
          </div>
        </div>

        {/* Account Password Card (Self-Service) */}
        <div className="rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 text-base font-bold text-[#2c1d17]">
            <KeyRound className="size-5 text-[#c5a059]" />
            <span>Account Security &amp; Password</span>
          </div>
          <p className="mt-1 text-xs text-[#786c62]">
            Change your personal login password. Available to all registered user accounts.
          </p>

          {passwordMessage && (
            <div
              className={`mt-4 rounded-xl p-3 text-xs font-medium ${
                // ubs:ignore - UI notification status check
                passwordMessage.type === 'success'
                  ? 'bg-emerald-50 text-[#166534] border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#2c1d17]">
              New Password
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="rounded-xl text-sm pr-10 border-[#e7e2da] text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#786c62] hover:text-[#2c1d17]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#2c1d17]">
              Confirm New Password
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="rounded-xl text-sm border-[#e7e2da] text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={handlePasswordUpdate}
              disabled={passwordLoading || !newPassword}
              className="text-xs bg-[#2c1d17] hover:bg-[#3d2a20] text-white shadow-xs disabled:opacity-50"
            >
              {passwordLoading ? 'Updating Password…' : 'Update Password'}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" className="bg-[#2c1d17] hover:bg-[#3d2a20] text-white font-semibold px-6 shadow-xs">
            {saved ? <Check className="mr-2 size-4 text-[#c5a059]" /> : <Save className="mr-2 size-4" />}
            {saved ? 'Settings Saved' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
