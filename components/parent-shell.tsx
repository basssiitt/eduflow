'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bot,
  CalendarCheck,
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  User,
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
import { OfflineStatusBar } from '@/components/eduflow-provider'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'

type NavItem = {
  label: string
  href: string
  icon: typeof User
  testId?: string
}

// Dedicated Parent Navigation - strictly parent and student progress
const parentNavItems: NavItem[] = [
  { label: 'Child Progress', href: '/parent', icon: User, testId: 'nav-parent-progress' },
  { label: 'Attendance', href: '/parent#attendance', icon: CalendarCheck, testId: 'nav-parent-attendance' },
  { label: 'Fee Receipts', href: '/parent#fees', icon: ReceiptText, testId: 'nav-parent-fees' },
  { label: 'AI Companion', href: '/parent#ai', icon: Bot, testId: 'nav-parent-ai' },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/parent" className={cn('flex items-center gap-3 no-underline', collapsed && 'justify-center')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
        <GraduationCap className="size-5 text-emerald-400" aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight text-slate-900 dark:text-slate-100">EduFlow OS</p>
          <p className="truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">Parent Portal</p>
        </div>
      )}
    </Link>
  )
}

function ParentNavigation({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Parent portal navigation" className="flex flex-col gap-1.5">
      {parentNavItems.map((item) => {
        const active = pathname === item.href || (item.href === '/parent' && pathname === '/parent')
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

function ParentSidebar({
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
        <ParentNavigation collapsed={collapsed} />
        <div className={cn('mt-auto rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-4', collapsed && 'border-0 bg-transparent p-0')}>
          {!collapsed && (
            <>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="size-4 text-emerald-600" /> 24/7 AI Companion
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">Ask questions in Roman Urdu about your child&apos;s routine.</p>
            </>
          )}
        </div>
      </div>
      <Separator className="bg-slate-100 dark:bg-slate-800" />
      <div className="flex items-center justify-between p-4">
        {!collapsed && <span className="text-[11px] font-medium text-slate-400">Session 2026–27</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="text-slate-500 hover:text-slate-900">
          {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-4" /> : <PanelLeftClose aria-hidden="true" className="size-4" />}
        </Button>
      </div>
    </aside>
  )
}

export function ParentShell({ children }: { children: React.ReactNode }) {
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

  const userInitials = (userEmail ? userEmail.slice(0, 2) : 'PT').toUpperCase()

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <ParentSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-slate-600" aria-label="Open navigation"><Menu aria-hidden="true" /></Button>} />
              <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-slate-950">
                <SheetTitle className="sr-only">Parent navigation</SheetTitle>
                <div className="flex h-20 items-center px-5"><Brand /></div>
                <Separator />
                <div className="p-4"><ParentNavigation onNavigate={() => setMobileOpen(false)} /></div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Parent Access</p>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Family Workspace</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OfflineStatusBar compact />
            <Badge variant="outline" className="hidden border-emerald-500/30 bg-emerald-50 text-emerald-700 sm:inline-flex dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
              Academic Session 2026–2027
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
                    <p className="text-xs font-normal text-muted-foreground">Signed in as Parent</p>
                    <p className="truncate font-semibold">{userEmail || 'parent@school.edu.pk'}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = '/parent#attendance'} className="cursor-pointer">
                    <CalendarCheck className="mr-2 size-4 text-emerald-600" />
                    <span>Attendance Status</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/parent#fees'} className="cursor-pointer">
                    <ReceiptText className="mr-2 size-4 text-emerald-600" />
                    <span>Fee Invoices &amp; Receipts</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/parent#ai'} className="cursor-pointer">
                    <Bot className="mr-2 size-4 text-emerald-600" />
                    <span>AI Learning Companion</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin'} className="cursor-pointer">
                    <GraduationCap className="mr-2 size-4 text-slate-500" />
                    <span>Campus Admin Portal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/teacher'} className="cursor-pointer">
                    <User className="mr-2 size-4 text-slate-500" />
                    <span>Teacher Console</span>
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
    </div>
  )
}
