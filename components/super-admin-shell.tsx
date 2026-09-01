'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Building2,
  ChevronDown,
  Gauge,
  GraduationCap,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
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
  { label: 'Subscriptions', href: '/super-admin#subscriptions', icon: Activity, testId: 'nav-superadmin-subscriptions' },
  { label: 'System Health', href: '/super-admin#health', icon: Gauge, testId: 'nav-superadmin-health' },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/super-admin" className={cn('flex items-center gap-3 no-underline', collapsed && 'justify-center')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight text-foreground">EduFlow OS</p>
          <p className="truncate text-xs text-muted-foreground font-mono">Super Admin</p>
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
    <nav aria-label="Super admin navigation" className="flex flex-col gap-1">
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

function SuperAdminSidebar({
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
        <SuperAdminNavigation collapsed={collapsed} />
        <div className={cn('mt-auto rounded-xl border bg-card p-3 shadow-xs', collapsed && 'border-0 bg-transparent p-0')}>
          {!collapsed && (
            <>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <ShieldCheck className="size-3.5" /> Platform Governance
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Global tenancy control and multi-school provisioning.</p>
            </>
          )}
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between p-3">
        {!collapsed && <span className="text-xs text-muted-foreground">Global Control Plane</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
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
    <div className="flex min-h-screen bg-background">
      <SuperAdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu aria-hidden="true" /></Button>} />
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Super admin navigation</SheetTitle>
                <div className="flex h-20 items-center px-4"><Brand /></div>
                <Separator />
                <div className="p-3"><SuperAdminNavigation onNavigate={() => setMobileOpen(false)} /></div>
              </SheetContent>
            </Sheet>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">ROOT ACCESS</Badge>
              </div>
              <h1 className="text-lg font-semibold tracking-tight">Super Admin Console</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden border-emerald-500/40 bg-emerald-500/10 text-emerald-700 sm:inline-flex">All Systems Operational</Badge>
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
                  <p className="text-xs font-normal text-muted-foreground">Super Administrator</p>
                  <p className="truncate font-semibold">{userEmail || 'superadmin@eduflow.pk'}</p>
                </DropdownMenuLabel>
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
    </div>
  )
}
