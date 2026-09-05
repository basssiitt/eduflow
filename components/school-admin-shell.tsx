'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  CalendarCheck,
  Check,
  ChevronDown,
  CreditCard,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Settings,
  ShieldCheck,
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

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  testId?: string
}

// Dedicated School Admin Navigation - strictly campus admin pages
const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, testId: 'nav-overview' },
  { label: 'Students', href: '/admin/students', icon: Users, testId: 'nav-students' },
  { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck, testId: 'nav-attendance' },
  { label: 'Fee Challans', href: '/admin/fees', icon: ReceiptText, testId: 'nav-fees' },
  { label: 'Finance Ledger', href: '/admin/finance', icon: WalletCards, testId: 'nav-finance' },
  { label: 'Billing & Plan', href: '/admin/billing', icon: CreditCard, testId: 'nav-billing' },
  { label: 'Campus Settings', href: '/admin/settings', icon: Settings, testId: 'nav-settings' },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/admin" className={cn('flex items-center gap-3 no-underline', collapsed && 'justify-center')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
        <GraduationCap className="size-5 text-emerald-400" aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight text-slate-900 dark:text-slate-100">EduFlow OS</p>
          <p className="truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">Campus Admin</p>
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
              'flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
              'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              active && 'bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300',
              collapsed && 'justify-center px-2'
            )}
          >
            <Icon aria-hidden="true" className={cn("size-4.5 shrink-0", active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500")} />
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
    <aside className={cn('hidden shrink-0 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 md:flex md:flex-col shadow-xs', collapsed ? 'w-20' : 'w-64')}>
      <div className="flex h-20 items-center px-5">
        <Brand collapsed={collapsed} />
      </div>
      <Separator className="bg-slate-100 dark:bg-slate-800" />
      <div className="flex flex-1 flex-col gap-6 p-4">
        <AdminNavigation collapsed={collapsed} />
        <div className={cn('mt-auto rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40 p-4', collapsed && 'border-0 bg-transparent p-0')}>
          {!collapsed && (
            <>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Campus Support</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Need help with challans or enrollment?</p>
              <a href="mailto:support@eduflow.pk" className="inline-block mt-3 w-full">
                <Button variant="outline" size="sm" className="w-full text-xs font-medium border-slate-300 dark:border-slate-700">
                  support@eduflow.pk
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
      <Separator className="bg-slate-100 dark:bg-slate-800" />
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
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-emerald-600" />
              <h2 id="settings-title" className="text-xl font-semibold">Campus Settings</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Manage school profile, language, and notifications.</p>
          </div>
          <button onClick={onClose} aria-label="Close settings" className="rounded-md p-1 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account Information</p>
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
            <Button variant="outline" size="sm" onClick={toggleLanguage}>
              <Globe className="mr-1.5 size-3.5" />
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
              className={notifications ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
            >
              {notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saved} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saved ? <Check className="mr-1.5 size-4" /> : null}
            {saved ? 'Saved' : 'Save Changes'}
          </Button>
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
      })
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
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 md:px-8">
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
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Campus Administration</p>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">School Operations</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OfflineStatusBar compact />
            <Badge variant="outline" className="hidden border-emerald-500/30 bg-emerald-50 text-emerald-700 sm:inline-flex dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
              Academic Session 2026–2027
            </Badge>
            <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900" aria-label="Notifications" onClick={() => setSettingsOpen(true)}>
              <Bell aria-hidden="true" className="size-4" />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-emerald-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="gap-2 px-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open profile menu">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown aria-hidden="true" className="hidden size-4 text-slate-400 sm:block" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <p className="text-xs font-normal text-muted-foreground">Signed in as</p>
                    <p className="truncate font-semibold">{userEmail || 'admin@school.edu.pk'}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin/settings'} className="cursor-pointer">
                    <Settings className="mr-2 size-4 text-slate-500" />
                    <span>Campus Settings Page</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin/billing'} className="cursor-pointer">
                    <CreditCard className="mr-2 size-4 text-slate-500" />
                    <span>Billing &amp; Subscription</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer">
                    <Globe className="mr-2 size-4 text-slate-500" />
                    <span>Quick Preferences (Language/Alerts)</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => window.location.href = '/teacher'} className="cursor-pointer">
                    <GraduationCap className="mr-2 size-4 text-emerald-600" />
                    <span>Teacher Console</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/parent'} className="cursor-pointer">
                    <Users className="mr-2 size-4 text-emerald-600" />
                    <span>Parent Portal</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = '/login?force=1'} className="cursor-pointer">
                    <ShieldCheck className="mr-2 size-4 text-emerald-600" />
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
