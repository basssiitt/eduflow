'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BookOpen,
  Building2,
  ChevronDown,
  CreditCard,
  Gauge,
  GraduationCap,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Users,
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
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'

type NavItem = {
  label: string
  href: string
  icon: typeof Building2
  testId?: string
}

// Dedicated Super Admin Navigation - strictly multi-campus and platform management
const superAdminNavItems: NavItem[] = [
  { label: 'Campuses & Tenants', href: '/super-admin', icon: Building2, testId: 'nav-superadmin-campuses' },
  { label: 'Subscriptions & Revenue', href: '/super-admin/subscriptions', icon: Activity, testId: 'nav-superadmin-subscriptions' },
  { label: 'Platform Telemetry', href: '/super-admin/telemetry', icon: Gauge, testId: 'nav-superadmin-telemetry' },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/super-admin" className={cn('flex items-center gap-3 no-underline', collapsed && 'justify-center')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
        <GraduationCap className="size-5 text-emerald-400" aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight text-slate-900 dark:text-slate-100">EduFlow OS</p>
          <p className="truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">Super Admin</p>
        </div>
      )}
    </Link>
  )
}

function SuperAdminNavigation({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Super admin navigation" className="flex flex-col gap-1.5">
      {superAdminNavItems.map((item) => {
        const active = pathname === item.href || (item.href === '/super-admin' && pathname === '/super-admin')
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

      <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
      {!collapsed && (
        <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Campus Workspace Views
        </span>
      )}
      <Link
        href="/admin"
        onClick={onNavigate}
        className={cn(
          'flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? 'Campus Admin' : undefined}
      >
        <GraduationCap className="size-4.5 shrink-0 text-emerald-600" />
        {!collapsed && <span>Campus Admin</span>}
      </Link>
      <Link
        href="/teacher"
        onClick={onNavigate}
        className={cn(
          'flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? 'Teacher Console' : undefined}
      >
        <BookOpen className="size-4.5 shrink-0 text-emerald-600" />
        {!collapsed && <span>Teacher Console</span>}
      </Link>
      <Link
        href="/parent"
        onClick={onNavigate}
        className={cn(
          'flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? 'Parent Portal' : undefined}
      >
        <Users className="size-4.5 shrink-0 text-emerald-600" />
        {!collapsed && <span>Parent Portal</span>}
      </Link>
    </nav>
  )
}

function SuperAdminSidebar({
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
        <SuperAdminNavigation collapsed={collapsed} />
        <div className={cn('mt-auto rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-4', collapsed && 'border-0 bg-transparent p-0')}>
          {!collapsed && (
            <>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="size-4 text-emerald-600" /> Root Governance
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">Multi-tenant provisioning and live platform telemetry.</p>
            </>
          )}
        </div>
      </div>
      <Separator className="bg-slate-100 dark:bg-slate-800" />
      <div className="flex items-center justify-between p-4">
        {!collapsed && <span className="text-[11px] font-medium text-slate-400">Control Plane v2.4</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="text-slate-500 hover:text-slate-900">
          {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-4" /> : <PanelLeftClose aria-hidden="true" className="size-4" />}
        </Button>
      </div>
    </aside>
  )
}

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
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

  const userInitials = (userEmail ? userEmail.slice(0, 2) : 'SA').toUpperCase()

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SuperAdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-slate-600" aria-label="Open navigation"><Menu aria-hidden="true" /></Button>} />
              <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-slate-950">
                <SheetTitle className="sr-only">Super admin navigation</SheetTitle>
                <div className="flex h-20 items-center px-5"><Brand /></div>
                <Separator />
                <div className="p-4"><SuperAdminNavigation onNavigate={() => setMobileOpen(false)} /></div>
              </SheetContent>
            </Sheet>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">ROOT ACCESS</Badge>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Super Admin Console</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden border-emerald-500/30 bg-emerald-50 text-emerald-700 sm:inline-flex dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </Badge>
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
                    <p className="text-xs font-normal text-muted-foreground">Super Administrator</p>
                    <p className="truncate font-semibold">{userEmail || 'superadmin@eduflow.pk'}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => window.location.href = '/super-admin'} className="cursor-pointer">
                    <ShieldCheck className="mr-2 size-4 text-emerald-600" />
                    <span>Control Plane Home</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/super-admin/subscriptions'} className="cursor-pointer">
                    <CreditCard className="mr-2 size-4 text-emerald-600" />
                    <span>Subscriptions & Revenue</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/super-admin/telemetry'} className="cursor-pointer">
                    <Gauge className="mr-2 size-4 text-emerald-600" />
                    <span>Platform Telemetry</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin'} className="cursor-pointer">
                    <GraduationCap className="mr-2 size-4 text-emerald-600" />
                    <span>Campus Admin Portal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/teacher'} className="cursor-pointer">
                    <BookOpen className="mr-2 size-4 text-emerald-600" />
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
    </div>
  )
}
