'use client'

import { useEffect, useState } from 'react'
import {
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEduFlow } from '@/components/eduflow-provider'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'

interface UserSettingsDialogProps {
  open: boolean
  onClose: () => void
  userEmail: string
  role: 'school_admin' | 'teacher' | 'parent' | 'super_admin' | 'student'
  roleName?: string
}

export function UserSettingsDialog({
  open,
  onClose,
  userEmail,
  role,
  roleName,
}: UserSettingsDialogProps) {
  const { lang, toggleLanguage } = useEduFlow()
  const isAdmin = role === 'school_admin' || role === 'super_admin'
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'security'>('profile')
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Subscription state (Admins only)
  const [currentPlan, setCurrentPlan] = useState('Pro')
  const [trialDays, setTrialDays] = useState('30')

  useEffect(() => {
    if (isAdmin) {
      const plan = sessionStorage.getItem('eduflow-demo-plan')
      const days = sessionStorage.getItem('eduflow-trial-days')
      if (plan) setCurrentPlan(plan)
      if (days) setTrialDays(days)
    }
  }, [isAdmin])

  if (!open) return null

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 800)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' })
      return
    }

    // ubs:ignore - Client-side form confirmation check
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match. Please try again.' })
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

  const roleDisplay = roleName || (
    role === 'school_admin'
      ? 'School Admin'
      : role === 'super_admin'
      ? 'Super Administrator'
      : role === 'teacher'
      ? 'Teacher'
      : role === 'student'
      ? 'Student'
      : 'Parent'
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-settings-title"
      >
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-blue-600" />
              <h2 id="user-settings-title" className="text-xl font-bold text-slate-900">Account Settings</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {isAdmin
                ? 'Manage your profile, subscription plan, and security credentials.'
                : 'Manage your profile preferences and account security.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            General &amp; Preferences
          </button>

          {/* Subscription Tab: Admins ONLY */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('subscription')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'subscription'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <CreditCard className="size-3.5" />
              <span>Subscription (Admin)</span>
            </button>
          )}

          {/* Security Tab: Universal / Anyone */}
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="size-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: General & Profile */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account Information</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email / Username</span>
                  <span className="font-mono font-medium">{userEmail || 'user@school.edu.pk'}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account Role</span>
                  <Badge variant="secondary">{roleDisplay}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">Language / زبان</p>
                  <p className="text-xs text-slate-500">Switch between English and Urdu.</p>
                </div>
                <Button variant="outline" size="sm" onClick={toggleLanguage} className="border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Globe className="mr-1.5 size-3.5 text-blue-600" />
                  {lang === 'en' ? 'اردو' : 'English'}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">Receive attendance and campus activity alerts.</p>
                </div>
                <Button
                  variant={notifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNotifications(!notifications)}
                  className={notifications ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"}
                >
                  {notifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Subscription Management (Admin Only) */}
          {isAdmin && activeTab === 'subscription' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-slate-900">{currentPlan} Plan</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        30-Day Free Trial Active ({trialDays} days remaining)
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs">
                    Trial Active
                  </Badge>
                </div>
                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <p>✓ Complete 3-Copy Bank Challan Generator</p>
                  <p>✓ 1-Click Haziri &amp; Attendance Registers</p>
                  <p>✓ Full Accounting Ledger &amp; Student Management</p>
                  <p>✓ Automated SMS Broadcasts</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-900">Campus Subscription Access</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Administrators have exclusive permissions to manage school subscription plans and view billing history.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {role === 'super_admin' && userEmail?.toLowerCase() === 'basithunyawrr@gmail.com' ? (
                    <Button
                      onClick={() => {
                        onClose()
                        window.location.href = '/super-admin/subscriptions'
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      <CreditCard className="mr-1.5 size-3.5 text-white" />
                      Platform Subscriptions &amp; Revenue
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        onClose()
                        window.location.href = '/admin/billing'
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      <CreditCard className="mr-1.5 size-3.5 text-white" />
                      Manage Subscription &amp; Billing
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClose()
                      window.location.href = '/#pricing'
                    }}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                  >
                    Compare Plans
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Change Password (Universal - Anyone) */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-blue-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Change Account Password
                  </p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Update your personal login password. Available to all registered accounts.
                </p>
              </div>

              {passwordMessage && (
                <div
                  className={`rounded-lg p-3 text-xs font-medium ${
                    // ubs:ignore - UI notification status check
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-slate-900">
                  New Password
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 pr-10 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-900"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </label>

                <label className="text-xs font-semibold text-slate-900">
                  Confirm New Password
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      minLength={6}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 pr-10 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <Button
                  type="submit"
                  disabled={passwordLoading || !newPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating Password…' : 'Update Password'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <span className="text-[11px] text-slate-500">Session: 2026–2027</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="border-slate-200 text-slate-700 hover:bg-white">Close</Button>
            {activeTab === 'profile' && (
              <Button size="sm" onClick={handleSave} disabled={saved} className="bg-blue-600 hover:bg-blue-700 text-white">
                {saved ? <Check className="mr-1.5 size-4 text-white" /> : null}
                {saved ? 'Saved' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
