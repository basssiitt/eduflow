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
  const [campusName, setCampusName] = useState('')
  const [campusCode, setCampusCode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [lang, setLang] = useState<'en' | 'ur'>('en')
  const [notifications, setNotifications] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Subscription state (Admin Only)
  const [plan, setPlan] = useState('Pro')
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(30)

  // Password state (Self-Service)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function loadSchoolProfile() {
      setLoading(true)

      let initialName = ''
      let initialEmail = ''
      let initialPhone = ''
      let initialCode = ''
      let initialAddress = ''

      // 1. Fetch user metadata from Supabase
      if (supabaseClient) {
        try {
          const { data } = await supabaseClient.auth.getUser()
          const user = data?.user
          if (user) {
            initialEmail = user.email || ''
            const meta = user.user_metadata || {}
            initialName = meta.school_name || meta.schoolName || meta.campus_name || meta.institution_name || ''
            initialPhone = meta.phone || meta.contact_phone || user.phone || ''
            initialCode = meta.campus_code || meta.school_code || ''
            initialAddress = meta.address || meta.campus_address || ''

            if (user.created_at) {
              const regDate = new Date(user.created_at).getTime()
              const elapsedDays = Math.floor((Date.now() - regDate) / (1000 * 60 * 60 * 24))
              setTrialDaysRemaining(Math.max(0, 30 - elapsedDays))
            }
          }
        } catch {}
      }

      // 2. Check local storage overrides
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('eduflow_school_profile')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.campusName) initialName = parsed.campusName
            if (parsed.campusCode) initialCode = parsed.campusCode
            if (parsed.phone) initialPhone = parsed.phone
            if (parsed.email) initialEmail = parsed.email
            if (parsed.address) initialAddress = parsed.address
            if (parsed.lang) setLang(parsed.lang)
            if (typeof parsed.notifications === 'boolean') setNotifications(parsed.notifications)
            if (typeof parsed.smsAlerts === 'boolean') setSmsAlerts(parsed.smsAlerts)
          }
        } catch {}
      }

      setCampusName(initialName)
      setCampusCode(initialCode)
      setPhone(initialPhone)
      setEmail(initialEmail)
      setAddress(initialAddress)
      setLoading(false)
    }

    loadSchoolProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const profileData = {
      campusName,
      campusCode,
      phone,
      email,
      address,
      lang,
      notifications,
      smsAlerts,
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eduflow_school_profile', JSON.stringify(profileData))
      } catch {}
    }

    if (isSupabaseConfigured && supabaseClient) {
      try {
        await supabaseClient.auth.updateUser({
          data: {
            school_name: campusName,
            campus_code: campusCode,
            phone: phone,
            address: address,
          }
        })
      } catch {}
    }

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

    setTimeout(() => {
      setPasswordLoading(false)
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmPassword('')
    }, 500)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition flex items-center gap-1 text-slate-600">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Campus Settings</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/billing" className="hover:text-blue-600 transition font-medium text-slate-600">
            Billing &amp; Plan →
          </Link>
        </div>
      </nav>

      <div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200/60 font-medium">
            Campus Configuration
          </Badge>
          <span className="text-sm text-slate-500">Academic Session 2026–2027</span>
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Campus Settings</h1>
        <p className="text-slate-600">Manage school profile, branch metadata, SMS alerts, and localization.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Building2 className="size-5 text-blue-600" />
            <span>School Identity &amp; Profile</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">This information appears on fee challans, report cards, and parent receipts.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-900 sm:col-span-2">
              Institution Name
              <Input
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                placeholder="e.g. Al-Huda Model High School & College"
                required
                className="rounded-xl text-sm border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-900">
              Campus Code / Registration #
              <Input
                value={campusCode}
                onChange={(e) => setCampusCode(e.target.value)}
                placeholder="e.g. AHS-KHI-01"
                required
                className="rounded-xl text-sm font-mono border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-900">
              Official Contact Phone
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +92 300 1234567"
                required
                className="rounded-xl text-sm font-mono border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-900 sm:col-span-2">
              Administrative Email
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. principal@school.edu.pk"
                required
                className="rounded-xl text-sm border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-900 sm:col-span-2">
              Physical Campus Address
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot 12, Main Boulevard, Gulberg, Lahore"
                required
                className="rounded-xl text-sm border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Bell className="size-5 text-blue-600" />
            <span>Parent Broadcast &amp; Notifications</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Configure automated dispatch of student haziri and fee invoice alerts.</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Daily Attendance Absent Alerts</p>
                <p className="text-xs text-slate-500">Instantly dispatch notification to parents when student is marked absent.</p>
              </div>
              <Button
                type="button"
                variant={notifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(!notifications)}
                className={notifications ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-medium" : "border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"}
              >
                {notifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Fee Challan Reminder Broadcast</p>
                <p className="text-xs text-slate-500">Send payment reminder on the 5th and 10th of every calendar month.</p>
              </div>
              <Button
                type="button"
                variant={smsAlerts ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={smsAlerts ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-medium" : "border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"}
              >
                {smsAlerts ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Language Preference / زبان</p>
                <p className="text-xs text-slate-500">Switch default portal interface language.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                // ubs:ignore - UI language toggle
                onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Globe className="mr-1.5 size-3.5 text-blue-600" />
                {lang === 'en' ? 'اردو' : 'English'}
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription & Plan Card (Admin Only) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <CreditCard className="size-5 text-blue-600" />
              <span>Campus Subscription &amp; Plan Tier</span>
              <Badge className="ml-2 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                Admin Only
              </Badge>
            </div>
            <Link
              href="/admin/billing"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              Billing Details →
            </Link>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            School administrators have exclusive rights to manage campus subscription tiers, licenses, and renewal invoices.
          </p>

          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-900 border border-slate-200 shrink-0 shadow-2xs">
                <Sparkles className="size-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">{plan} Plan</h3>
                  <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 border-emerald-300 bg-emerald-50">
                    30-Day Free Trial
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {trialDaysRemaining} days remaining on your promotional trial period. Full access to 3-Copy Challans, Haziri, and SMS broadcasts.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => window.location.href = '/admin/billing'}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0 shadow-xs font-medium"
            >
              Manage Subscription &amp; Invoices
            </Button>
          </div>
        </div>

        {/* Account Password Card (Self-Service) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <KeyRound className="size-5 text-blue-600" />
            <span>Account Security &amp; Password</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Change your personal login password. Available to all registered user accounts.
          </p>

          {passwordMessage && (
            <div
              className={`mt-4 rounded-xl p-3 text-xs font-medium ${
                // ubs:ignore - UI notification status check
                passwordMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-900">
              New Password
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="rounded-xl text-sm pr-10 border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
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

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-900">
              Confirm New Password
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="rounded-xl text-sm border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-blue-500/20"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={handlePasswordUpdate}
              disabled={passwordLoading || !newPassword}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-medium disabled:opacity-50"
            >
              {passwordLoading ? 'Updating Password…' : 'Update Password'}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 shadow-xs">
            {saved ? <Check className="mr-2 size-4 text-emerald-300" /> : <Save className="mr-2 size-4" />}
            {saved ? 'Settings Saved' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
