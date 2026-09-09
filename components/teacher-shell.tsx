'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  CalendarCheck,
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
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
import { OfflineStatusBar } from '@/components/eduflow-provider'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { UserSettingsDialog } from '@/components/user-settings-dialog'
import { AcademicCrest } from '@/components/academic-crest'

type NavItem = {
  label: string
  href: string
  icon: typeof CalendarCheck
  testId?: string
}

const teacherNavItems: NavItem[] = [
  { label: '1-Click Haziri Attendance', href: '/teacher', icon: CalendarCheck, testId: 'nav-teacher-haziri' },
  { label: 'Assigned Classes & Schedule', href: '/teacher/classes', icon: GraduationCap, testId: 'nav-teacher-classes' },
  { label: 'Audio Voice Diary', href: '/teacher/diary', icon: Mic, testId: 'nav-teacher-diary' },
  { label: 'Gradebook & Marks', href: '/teacher/gradebook', icon: BookOpen, testId: 'nav-teacher-gradebook' },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/teacher" className={cn('flex items-center gap-3 no-underline', collapsed && 'justify-center')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
        <AcademicCrest className="size-6" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-bold tracking-tight text-slate-900 dark:text-slate-100">EduFlow OS</p>
          <p className="truncate text-xs font-semibold text-blue-600 dark:text-blue-400">Teacher Console</p>
        </div>
      )}
    </Link>
  )
}

function TeacherNavigation({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Teacher console navigation" className="flex flex-col gap-1.5">
      {teacherNavItems.map((item) => {
        const active = pathname === item.href || (item.href === '/teacher' && pathname === '/teacher')
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

function TeacherSidebar({
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
        <TeacherNavigation collapsed={collapsed} />
        <div className={cn('mt-auto rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40 p-4', collapsed && 'border-0 bg-transparent p-0')}>
          {!collapsed && (
            <>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Offline Haziri Ready</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Mark attendance offline with automated cloud sync.</p>
            </>
          )}
        </div>
      </div>
      <Separator className="bg-slate-200 dark:bg-slate-800" />
      <div className="flex items-center justify-between p-4">
        {!collapsed && <span className="text-[11px] font-medium text-slate-400">Session 2026–27</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="text-slate-500 hover:text-slate-900">
          {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-4" /> : <PanelLeftClose aria-hidden="true" className="size-4" />}
        </Button>
      </div>
    </aside>
  )
}

export function TeacherShell({ children }: { children: React.ReactNode }) {
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

  const userInitials = (userEmail ? userEmail.slice(0, 2) : 'TC').toUpperCase()

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TeacherSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-slate-600" aria-label="Open navigation"><Menu aria-hidden="true" /></Button>} />
              <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-slate-950">
                <SheetTitle className="sr-only">Teacher navigation</SheetTitle>
                <div className="flex h-20 items-center px-5"><Brand /></div>
                <Separator />
                <div className="p-4"><TeacherNavigation onNavigate={() => setMobileOpen(false)} /></div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Classroom Management</p>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Teacher Console</h1>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <OfflineStatusBar compact />
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Synced
            </div>
            <div className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300 shadow-2xs">
              Academic Session 2026–2027
            </div>
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
                    <p className="text-xs font-normal text-muted-foreground">Signed in as Teacher</p>
                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{userEmail || 'teacher@school.edu.pk'}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = '/teacher'} className="cursor-pointer">
                    <CalendarCheck className="mr-2 size-4 text-blue-600 dark:text-blue-400" />
                    <span>Daily Haziri Register</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/teacher/diary'} className="cursor-pointer">
                    <Mic className="mr-2 size-4 text-blue-600 dark:text-blue-400" />
                    <span>Audio Voice Diary</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/teacher/gradebook'} className="cursor-pointer">
                    <BookOpen className="mr-2 size-4 text-blue-600 dark:text-blue-400" />
                    <span>Gradebook &amp; Marks</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer font-medium">
                    <Settings className="mr-2 size-4 text-blue-600 dark:text-blue-400" />
                    <span>Settings &amp; Change Password</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => window.location.href = '/admin'} className="cursor-pointer">
                    <GraduationCap className="mr-2 size-4 text-blue-600 dark:text-blue-400" />
                    <span>Campus Admin Portal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/parent'} className="cursor-pointer">
                    <Users className="mr-2 size-4 text-blue-600 dark:text-blue-400" />
                    <span>Parent Portal</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
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

      <UserSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userEmail={userEmail}
        role="teacher"
      />
    </div>
  )
}
