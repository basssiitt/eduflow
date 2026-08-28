'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Building2,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Sparkles,
  Users,
  UserRound,
  WalletCards,
} from 'lucide-react'
import { useState } from 'react'
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
  { label: 'AI Companion', href: '/parent', icon: Sparkles, testId: 'nav-ai-companion' },
  { label: 'Multi-Campus', href: '/super-admin', icon: Building2 },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight">EduFlow OS</p>
          <p className="truncate text-xs text-muted-foreground">Campus Node</p>
        </div>
      )}
    </div>
  )
}

function Navigation({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
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
              active && 'bg-primary/10 text-primary shadow-sm',
              collapsed && 'justify-center px-2',
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

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={cn('hidden shrink-0 border-r bg-sidebar md:flex md:flex-col', collapsed ? 'w-20' : 'w-64')}>
      <div className="flex h-20 items-center px-4">
        <Brand collapsed={collapsed} />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col gap-6 p-3">
        <Navigation collapsed={collapsed} />
        <div className={cn('mt-auto rounded-xl border bg-card p-3', collapsed && 'border-0 bg-transparent p-0')}>
          {!collapsed && (
            <>
              <p className="text-xs font-semibold text-foreground">Need a hand?</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Ask your AI Companion to surface insights.</p>
              <Button variant="outline" size="sm" className="mt-3 w-full">Open Companion</Button>
            </>
          )}
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between p-3">
        {!collapsed && <span className="text-xs text-muted-foreground">v2.4.0</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </Button>
      </div>
    </aside>
  )
}

export function EduFlowShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">EduFlow navigation</SheetTitle>
                <div className="flex h-20 items-center px-4"><Brand /></div>
                <Separator />
                <div className="p-3"><Navigation onNavigate={() => setMobileOpen(false)} /></div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Workspace</p>
              <h1 className="text-lg font-semibold tracking-tight">Campus overview</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden border-amber-500/40 bg-amber-500/10 text-amber-700 sm:inline-flex">2026-2027</Badge>
            <Badge variant="secondary" className="hidden sm:inline-flex">Starter Plan</Badge>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell aria-hidden="true" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2" aria-label="Open profile menu">
                  <Avatar className="size-8"><AvatarFallback className="bg-primary/10 text-primary">AK</AvatarFallback></Avatar>
                  <ChevronDown aria-hidden="true" className="hidden size-4 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem><UserRound aria-hidden="true" />Profile settings</DropdownMenuItem>
                  <DropdownMenuItem><WalletCards aria-hidden="true" />Billing & plan</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
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
