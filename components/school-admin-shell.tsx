'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Award,
  Bell,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { OfflineStatusBar, useEduFlow } from '@/components/eduflow-provider'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { AcademicCrest } from '@/components/academic-crest'

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  testId?: string
}

// Dedicated School Admin Navigation - strictly campus admin pages
const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, testId: 'nav-overview' },
  { label: 'Admissions Desk', href: '/admin/admissions', icon: UserPlus, testId: 'nav-admissions' },
  { label: 'Students', href: '/admin/students', icon: Users, testId: 'nav-students' },
  { label: 'Faculty & Teachers', href: '/admin/teachers', icon: GraduationCap, testId: 'nav-teachers' },
  { label: 'Faculty Attendance', href: '/admin/teachers/attendance', icon: CalendarCheck, testId: 'nav-faculty-attendance' },
  { label: 'Student Haziri', href: '/admin/attendance', icon: CalendarCheck, testId: 'nav-attendance' },
  { label: 'Master Timetable', href: '/admin/timetable', icon: Clock, testId: 'nav-timetable' },
  { label: 'Examinations', href: '/admin/exams', icon: Award, testId: 'nav-exams' },
  { label: 'Fee Challans', href: '/admin/fees', icon: ReceiptText, testId: 'nav-fees' },
  { label: 'Finance & P&L', href: '/admin/finance', icon: WalletCards, testId: 'nav-finance' },
  { label: 'WhatsApp Broadcast', href: '/admin/broadcast', icon: MessageCircle, testId: 'nav-broadcast' },
  { label: 'Billing & Plan', href: '/admin/billing', icon: CreditCard, testId: 'nav-billing' },
  { label: 'Campus Settings', href: '/admin/settings', icon: Settings, testId: 'nav-settings' },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/admin" className={cn('flex items-center gap-3 no-underline', collapsed && 'justify-center')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
        <AcademicCrest className="size-6" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-bold tracking-tight text-slate-900 dark:text-slate-100">EduFlow OS</p>
          <p className="truncate text-xs font-semibold text-blue-600 dark:text-blue-400">Campus Administration</p>
        </div>
      )}
    </Link>
  )
}

function AdminNavigation({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Campus admin navigation" className="flex flex-col gap-1.5">
      {adminNavItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== '/admin' && pathname.startsWith(item.href))
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            data-testid={item.testId}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              'relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200',
              'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              active && 'bg-blue-50 text-blue-600 font-bold border border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-blue-600',
              collapsed && 'justify-center px-2'
            )}
          >
            <Icon aria-hidden="true" className={cn("size-4.5 shrink-0 transition-colors", active ? "text-blue-600 dark:text-blue-400" : "text-slate-500")} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <aside className={cn('hidden shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:flex md:flex-col shadow-xs', collapsed ? 'w-20' : 'w-64')}>
      <div className="flex h-20 items-center px-5">
        <Brand collapsed={collapsed} />
      </div>
      <Separator className="bg-slate-200 dark:bg-slate-800" />
      <div className="flex flex-1 flex-col gap-6 p-4">
        <AdminNavigation collapsed={collapsed} />
        <div className={cn('mt-auto rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40 p-4', collapsed && 'border-0 bg-transparent p-0')}>
          {!collapsed && (
            <>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Campus Support</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Need help with challans or enrollment?</p>
              <a href="mailto:support@eduflow.pk" className="inline-block mt-3 w-full">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-slate-200 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700">
                  support@eduflow.pk
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
      <Separator className="bg-slate-200 dark:bg-slate-800" />
      <div className="flex items-center justify-between p-4">
        {!collapsed && <span className="text-[11px] font-medium text-slate-400">Academic Node 2026–27</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="text-slate-500 hover:text-slate-900">
          {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-4" /> : <PanelLeftClose aria-hidden="true" className="size-4" />}
        </Button>
      </div>
    </aside>
  )
}

function SettingsModal({
  onClose,
  userEmail,
}: {
  onClose: () => void
  userEmail: string
}) {
  const { lang, toggleLanguage } = useEduFlow()
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'security'>('profile')
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Subscription state
  const [currentPlan, setCurrentPlan] = useState('Pro')
  const [trialDays, setTrialDays] = useState('30')

  useEffect(() => {
    const plan = sessionStorage.getItem('eduflow-demo-plan')
    const days = sessionStorage.getItem('eduflow-trial-days')
    if (plan) setCurrentPlan(plan)
    if (days) setTrialDays(days)
  }, [])

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
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }

    // ubs:ignore - Client-side form confirmation check
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

        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
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
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-blue-600 dark:text-blue-400" />
              <h2 id="settings-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">Account &amp; Campus Settings</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Manage school profile, subscription plan, and security credentials.</p>
          </div>
          <button onClick={onClose} aria-label="Close settings" className="rounded-md p-1 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            General &amp; Preferences
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'subscription'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="size-3.5" />
            <span>Subscription &amp; Plan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
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
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Information</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email / Username</span>
                  <span className="font-mono font-medium">{userEmail || 'admin@school.edu.pk'}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant="secondary">School Admin</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold">Language / زبان</p>
                  <p className="text-xs text-muted-foreground">Switch between English and Urdu.</p>
                </div>
                <Button variant="outline" size="sm" onClick={toggleLanguage} className="border-slate-200 hover:border-blue-500">
                  <Globe className="mr-1.5 size-3.5 text-blue-600 dark:text-blue-400" />
                  {lang === 'en' ? 'اردو' : 'English'}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold">WhatsApp &amp; Bell Notifications</p>
                  <p className="text-xs text-muted-foreground">Alerts for daily attendance and fee collections.</p>
                </div>
                <Button
                  variant={notifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNotifications(!notifications)}
                  className={notifications ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold" : ""}
                >
                  {notifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Subscription Management (Admin Only) */}
          {activeTab === 'subscription' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4.5 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{currentPlan} Plan</h3>
                      <p className="text-xs text-blue-600 font-medium">
                        30-Day Free Trial Active ({trialDays} days remaining)
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs">
                    Trial Active
                  </Badge>
                </div>
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p>✓ Complete 3-Copy Bank Challan Generator</p>
                  <p>✓ 1-Click Haziri &amp; Attendance Registers</p>
                  <p>✓ Full Accounting Ledger &amp; Student Management</p>
                  <p>✓ WhatsApp Fee Reminders</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Manage Campus Subscription</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  As a School Admin, you have exclusive permission to upgrade, renew, or view invoices for your school campus.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      onClose()
                      window.location.href = '/admin/billing'
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <CreditCard className="mr-1.5 size-3.5" />
                    Open Billing &amp; Invoices
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClose()
                      window.location.href = '/#pricing'
                    }}
                    className="text-xs border-slate-200 hover:border-blue-500"
                  >
                    Compare All Plans
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Change Password (All Users) */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Self-Service Password Update
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Update your personal login password. Available to all registered accounts.
                </p>
              </div>

              {passwordMessage && (
                <div
                  className={`rounded-lg p-3 text-xs font-medium ${
                    // ubs:ignore - UI notification status check
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 pr-10 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none"
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

                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      minLength={6}
                      className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 pr-10 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <Button
                  type="submit"
                  disabled={passwordLoading || !newPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  {passwordLoading ? 'Updating Password…' : 'Update Password'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <span className="text-[11px] text-muted-foreground">Session: 2026–2027</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            {activeTab === 'profile' && (
              <Button size="sm" onClick={handleSave} disabled={saved} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs">
                {saved ? <Check className="mr-1.5 size-4" /> : null}
                {saved ? 'Saved' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SchoolAdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const demoEmail = sessionStorage.getItem('eduflow-demo-email')
    if (demoEmail) setUserEmail(demoEmail)

    if (isSupabaseConfigured && supabaseClient) {
      supabaseClient.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          setUserEmail(data.user.email)
        }
      }).catch(() => {})
    }
  }, [])

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        await supabaseClient.auth.signOut()
      } catch {}
    }
    sessionStorage.clear()
    window.location.href = '/login'
  }

  const userInitials = (userEmail ? userEmail.slice(0, 2) : 'AD').toUpperCase()

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-slate-600" aria-label="Open navigation"><Menu aria-hidden="true" /></Button>} />
              <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-slate-950">
                <SheetTitle className="sr-only">Campus navigation</SheetTitle>
                <div className="flex h-20 items-center px-5"><Brand /></div>
                <Separator />
                <div className="p-4"><AdminNavigation onNavigate={() => setMobileOpen(false)} /></div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Campus Administration</p>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">School Operations</h1>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative hidden md:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search for Professional Courses..."
                className="h-8 w-48 xl:w-60 rounded-xl border border-slate-200 bg-slate-50/80 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden"
              />
            </div>
            <OfflineStatusBar compact />
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
              Cloud Synced
            </div>
            <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900" aria-label="Notifications" onClick={() => setSettingsOpen(true)}>
              <Bell aria-hidden="true" className="size-4" />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-blue-600" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="gap-2 px-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open profile menu">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown aria-hidden="true" className="hidden size-4 text-slate-400 sm:block" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-60 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <p className="text-xs font-normal text-muted-foreground">Signed in as</p>
                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{userEmail || 'admin@school.edu.pk'}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer font-medium hover:bg-slate-100">
                    <Settings className="mr-2 size-4 text-slate-600" />
                    <span>Settings &amp; Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin/billing'} className="cursor-pointer hover:bg-slate-100">
                    <CreditCard className="mr-2 size-4 text-slate-600" />
                    <span>Manage Subscription (Admin)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin/settings'} className="cursor-pointer hover:bg-slate-100">
                    <Globe className="mr-2 size-4 text-slate-600" />
                    <span>Campus Profile Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => window.location.href = '/teacher'} className="cursor-pointer hover:bg-slate-100">
                    <GraduationCap className="mr-2 size-4 text-blue-600" />
                    <span>Teacher Console</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/parent'} className="cursor-pointer hover:bg-slate-100">
                    <Users className="mr-2 size-4 text-blue-600" />
                    <span>Parent Portal</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = '/login?force=1'} className="cursor-pointer hover:bg-slate-100">
                    <ShieldCheck className="mr-2 size-4 text-slate-500" />
                    <span>Switch Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                    <LogOut className="mr-2 size-4 text-rose-600" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          userEmail={userEmail}
        />
      )}
    </div>
  )
}
