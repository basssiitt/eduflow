'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
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
  { label: 'Fee Challans', href: '/admin/fees', icon: ReceiptText, testId: 'nav-fees' },
  { label: 'Finance & Ledger', href: '/admin/finance', icon: WalletCards, testId: 'nav-finance' },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/admin" className={cn('flex items-center gap-3 no-underline', collapsed && 'justify-center')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight text-foreground">EduFlow OS</p>
          <p className="truncate text-xs text-muted-foreground">Campus Admin</p>
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
    <nav aria-label="Campus admin navigation" className="flex flex-col gap-1">
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

function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <aside className={cn('hidden shrink-0 border-r bg-sidebar md:flex md:flex-col', collapsed ? 'w-20' : 'w-64')}>
      <div className="flex h-20 items-center px-4">
        <Brand collapsed={collapsed} />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col gap-6 p-3">
        <AdminNavigation collapsed={collapsed} />
        <div className={cn('mt-auto rounded-xl border bg-card p-3 shadow-xs', collapsed && 'border-0 bg-transparent p-0')}>
          {!collapsed && (
            <>
              <p className="text-xs font-semibold text-foreground">Campus Support</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Need assistance with fee challans or enrollment?</p>
              <a href="mailto:support@eduflow.pk" className="inline-block mt-3 w-full">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  support@eduflow.pk
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between p-3">
        {!collapsed && <span className="text-xs text-muted-foreground">v2.4.0 · School Node</span>}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-primary" />
              <h2 id="settings-title" className="text-xl font-semibold">Campus Settings</h2>
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
              <Badge variant="secondary">School Admin</Badge>
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

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saved}>
            {saved ? <Check className="mr-1.5 size-4 text-emerald-500" /> : null}
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
    <div className="flex min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu aria-hidden="true" /></Button>} />
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Campus navigation</SheetTitle>
                <div className="flex h-20 items-center px-4"><Brand /></div>
                <Separator />
                <div className="p-3"><AdminNavigation onNavigate={() => setMobileOpen(false)} /></div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Campus Administration</p>
              <h1 className="text-lg font-semibold tracking-tight">School Operations</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OfflineStatusBar compact />
            <Badge variant="outline" className="hidden border-amber-500/40 bg-amber-500/10 text-amber-700 sm:inline-flex">2026-2027</Badge>
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
                  <p className="text-xs font-normal text-muted-foreground">Signed in as</p>
                  <p className="truncate font-semibold">{userEmail || 'admin@school.edu.pk'}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <Settings className="mr-2 size-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                  <LogOut className="mr-2 size-4 text-rose-600" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
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
