'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Settings,
  Sparkles,
  UserRound,
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

const navItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, testId: 'nav-overview' },
  { label: 'Students', href: '/admin/students', icon: Users, testId: 'nav-students' },
  { label: 'Attendance', href: '/teacher', icon: UserRound, testId: 'nav-attendance' },
  { label: 'Fee Challans', href: '/admin/fees', icon: ReceiptText, testId: 'nav-fees' },
  { label: 'Finance & Ledger', href: '/admin/finance', icon: WalletCards, testId: 'nav-finance' },
  { label: 'AI Companion', href: '/parent', icon: Sparkles, testId: 'nav-ai-companion' },
  { label: 'Multi-Campus', href: '/super-admin', icon: Building2 },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className={cn('flex items-center gap-3 no-underline', collapsed && 'justify-center')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight text-foreground">EduFlow OS</p>
          <p className="truncate text-xs text-muted-foreground">Campus Node</p>
        </div>
      )}
    </Link>
  )
}

function Navigation({
  collapsed = false,
  onNavigate,
  userRole,
}: {
  collapsed?: boolean
  onNavigate?: () => void
  userRole?: string | null
}) {
  const pathname = usePathname()

  const normalizedRole = (userRole || '').toLowerCase().replace(/-/g, '_')

  let visibleItems = navItems
  if (normalizedRole === 'teacher') {
    visibleItems = navItems.filter((item) => ['/teacher', '/parent'].includes(item.href))
  } else if (normalizedRole === 'parent') {
    visibleItems = navItems.filter((item) => item.href === '/parent')
  } else if (normalizedRole === 'super_admin') {
    visibleItems = navItems
  } else if (normalizedRole === 'school_admin' || normalizedRole === 'admin') {
    visibleItems = navItems.filter((item) => item.href !== '/super-admin')
  }

  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-1">
      {visibleItems.map((item) => {
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
              'flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              active && 'bg-primary/10 text-primary shadow-sm font-semibold',
              collapsed && 'justify-center px-2'
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

function Sidebar({
  collapsed,
  onToggle,
  userRole,
}: {
  collapsed: boolean
  onToggle: () => void
  userRole?: string | null
}) {
  return (
    <aside className={cn('hidden shrink-0 border-r bg-sidebar md:flex md:flex-col', collapsed ? 'w-20' : 'w-64')}>
      <div className="flex h-20 items-center px-4">
        <Brand collapsed={collapsed} />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col gap-6 p-3">
        <Navigation collapsed={collapsed} userRole={userRole} />
        <div className={cn('mt-auto rounded-xl border bg-card p-3 shadow-xs', collapsed && 'border-0 bg-transparent p-0')}>
          {!collapsed && (
            <>
              <p className="text-xs font-semibold text-foreground">Need a hand?</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Ask your AI Companion to surface insights.</p>
              <Link href="/parent">
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <Sparkles className="mr-1.5 size-3.5 text-amber-500" /> Open Companion
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between p-3">
        {!collapsed && <span className="text-xs text-muted-foreground">v2.4.0 · Academic Node</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </Button>
      </div>
    </aside>
  )
}

function SettingsModal({
  onClose,
  userEmail,
  userRole,
}: {
  onClose: () => void
  userEmail: string
  userRole: string
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-primary" />
              <h2 id="settings-title" className="text-xl font-semibold">Workspace Settings</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Manage your school profile, language, and preferences.</p>
          </div>
          <button onClick={onClose} aria-label="Close settings" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Information</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email / Username</span>
              <span className="font-mono font-medium">{userEmail || 'admin@school.edu.pk'}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Assigned Role</span>
              <Badge variant="secondary" className="capitalize">{userRole || 'School Admin'}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Campus Branch</span>
              <span className="font-medium">Knowledge Avenue · Lahore</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="text-sm font-semibold">Language / زبان</p>
              <p className="text-xs text-muted-foreground">Switch between English and Urdu.</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleLanguage}>
              <Globe className="mr-1.5 size-3.5" />
              {lang === 'en' ? 'اردو' : 'English'}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="text-sm font-semibold">WhatsApp & Bell Notifications</p>
              <p className="text-xs text-muted-foreground">Receive real-time alerts for daily attendance and fees.</p>
            </div>
            <Button
              variant={notifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {saved ? <><Check className="mr-1 size-4" /> Saved</> : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function EduFlowShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const demoRole = sessionStorage.getItem('eduflow-demo-role')
    const demoEmail = sessionStorage.getItem('eduflow-demo-email')
    if (demoRole) {
      setUserRole(demoRole)
      setUserEmail(demoEmail || 'demo@eduflow.pk')
      return
    }

    const client = supabaseClient
    if (!isSupabaseConfigured || !client) return

    client.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const email = data.user.email ?? ''
        setUserEmail(email)
        const isSuperAdminEmail = email.toLowerCase() === 'basithadi@gmail.com' || email.toLowerCase() === 'superadmin@eduflow.pk'

        let role = data.user.app_metadata?.role ?? data.user.user_metadata?.role
        if (!role) {
          const { data: profile } = await client
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()
          role = profile?.role
        }
        if (isSuperAdminEmail) {
          role = 'super-admin'
        }
        setUserRole(role ?? 'school-admin')
      }
    })
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

  const userInitials = (userEmail ? userEmail.slice(0, 2) : 'EF').toUpperCase()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} userRole={userRole} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu aria-hidden="true" /></Button>} />
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">EduFlow navigation</SheetTitle>
                <div className="flex h-20 items-center px-4"><Brand /></div>
                <Separator />
                <div className="p-3"><Navigation onNavigate={() => setMobileOpen(false)} userRole={userRole} /></div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Workspace</p>
              <h1 className="text-lg font-semibold tracking-tight">Campus overview</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OfflineStatusBar compact />
            <Badge variant="outline" className="hidden border-amber-500/40 bg-amber-500/10 text-amber-700 sm:inline-flex">2026-2027</Badge>
            <Badge variant="secondary" className="hidden sm:inline-flex">Starter Plan</Badge>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" onClick={() => setSettingsOpen(true)}>
              <Bell aria-hidden="true" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="gap-2 px-2" aria-label="Open profile menu">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown aria-hidden="true" className="hidden size-4 text-muted-foreground sm:block" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{userEmail || 'School Workspace'}</span>
                    <span className="text-xs text-muted-foreground capitalize">{userRole?.replace(/[-_]/g, ' ') || 'Admin account'}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <UserRound aria-hidden="true" className="mr-2 size-4" />
                    Profile settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/admin/billing')}>
                    <WalletCards aria-hidden="true" className="mr-2 size-4" />
                    Billing &amp; plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                    <LogOut aria-hidden="true" className="mr-2 size-4 text-rose-600" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          userEmail={userEmail}
          userRole={userRole || 'School Admin'}
        />
      )}
    </div>
  )
}

export function DashboardPlaceholder() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/10">Tuesday, 18 August 2026</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">Good morning, Ayesha.</h2>
          <p className="max-w-xl text-muted-foreground leading-6">Here&apos;s what&apos;s happening across your campus today.</p>
        </div>
        <Button className="w-fit">View daily report</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Total students', '1,248', '+8.2% this term'],
          ['Attendance today', '94.6%', 'Above campus target'],
          ['Fees collected', 'PKR 2.4M', '84% of this cycle'],
          ['Open actions', '12', '4 need your attention'],
        ].map(([label, value, detail]) => (
          <article key={label} className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="min-h-72 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><h3 className="font-semibold">Attendance pulse</h3><p className="mt-1 text-sm text-muted-foreground">Weekly campus attendance trend</p></div><Badge variant="outline">This week</Badge></div>
          <div className="mt-10 flex h-32 items-end gap-3" aria-label="Attendance chart placeholder">
            {[62, 74, 68, 82, 78, 91, 86].map((height, index) => <div key={index} className="flex flex-1 flex-col justify-end gap-2"><div className="rounded-t-md bg-primary/80" style={{ height: `${height}%` }} /><span className="text-center text-[11px] text-muted-foreground">{['M','T','W','T','F','S','S'][index]}</span></div>)}
          </div>
        </article>
        <article className="min-h-72 rounded-xl border bg-card p-6 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Quick actions</h3><p className="mt-1 text-sm text-muted-foreground">Keep your campus moving.</p></div><Sparkles className="size-5 text-amber-500" aria-hidden="true" /></div><div className="mt-6 flex flex-col gap-3"><Button variant="outline" className="justify-start">Add a new student</Button><Button variant="outline" className="justify-start">Review fee challans</Button><Button variant="outline" className="justify-start">Ask AI Companion</Button></div></article>
      </div>
    </section>
  )
}

export { navItems }

