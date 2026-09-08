'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Award,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { OfflineStatusBar } from '@/components/eduflow-provider'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { UserSettingsDialog } from '@/components/user-settings-dialog'
import { AcademicCrest } from '@/components/academic-crest'

type NavItem = {
  label: string
  href: string
  icon: typeof User
  testId?: string
}

const studentNavItems: NavItem[] = [
  { label: 'Overview', href: '/student', icon: LayoutDashboard, testId: 'nav-student-overview' },
  { label: 'Grades & Report Card', href: '/student/grades', icon: Award, testId: 'nav-student-grades' },
  { label: 'Attendance Record', href: '/student/attendance', icon: CalendarCheck, testId: 'nav-student-attendance' },
  { label: 'Homework & Diary', href: '/student/diary', icon: BookOpen, testId: 'nav-student-diary' },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/student" className={cn('flex items-center gap-3 no-underline', collapsed && 'justify-center')}>
      <AcademicCrest size={28} className="shrink-0" />
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-bold tracking-tight text-[#2c1d17]">EduFlow OS</p>
          <p className="truncate text-xs font-semibold text-[#c5a059]">Student Portal</p>
        </div>
      )}
    </Link>
  )
}

function StudentNavigation({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Student portal navigation" className="flex flex-col gap-1.5">
      {studentNavItems.map((item) => {
        const active = pathname === item.href
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
              'text-stone-600 hover:bg-[#faf9f5] hover:text-[#2c1d17]',
              active && 'bg-[#faf9f5] text-[#2c1d17] font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[#c5a059]',
              collapsed && 'justify-center px-2'
            )}
          >
            <Icon aria-hidden="true" className={cn("size-4.5 shrink-0 transition-colors", active ? "text-[#c5a059]" : "text-stone-500")} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

export function StudentShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [studentEmail, setStudentEmail] = useState('student@eduflow.pk')
  const [studentName, setStudentName] = useState('Student Learner')
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const demoEmail = sessionStorage.getItem('eduflow-demo-email')
    if (demoEmail) {
      setStudentEmail(demoEmail)
      setStudentName(demoEmail.split('@')[0])
    }

    if (isSupabaseConfigured && supabaseClient) {
      supabaseClient.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          setStudentEmail(data.user.email)
          const name = data.user.user_metadata?.full_name || data.user.email.split('@')[0]
          setStudentName(name)
        }
      })
    }
  }, [])

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.auth.signOut()
    }
    sessionStorage.removeItem('eduflow-demo-role')
    sessionStorage.removeItem('eduflow-demo-email')
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen bg-[#faf9f5] text-[#2c1d17]">
      {/* Desktop Sidebar */}
      <aside
        aria-label="Student sidebar"
        className={cn(
          'hidden shrink-0 border-r border-[#e7e2da] bg-white md:flex md:flex-col transition-all duration-300',
          collapsed ? 'w-18' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#e7e2da]">
          <Brand collapsed={collapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="text-stone-400 hover:text-[#2c1d17] size-8"
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <StudentNavigation collapsed={collapsed} />
        </div>

        <div className="p-3 border-t border-[#e7e2da]">
          {!collapsed ? (
            <div className="rounded-xl border border-[#e7e2da] bg-[#faf9f5] p-3 text-xs text-[#2c1d17]">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-[#2c1d17]">
                <Sparkles className="size-3.5 text-[#c5a059]" />
                <span>Student Hub</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-600">
                Access your homework, grades, and attendance anywhere on phone or laptop.
              </p>
            </div>
          ) : (
            <div className="flex justify-center text-[#c5a059]" title="Student Hub">
              <Sparkles className="size-5" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <OfflineStatusBar />

        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[#e7e2da] bg-white/95 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-stone-600"
                  aria-label="Open student menu"
                >
                  <Menu className="size-5" />
                </Button>
              } />
              <SheetContent side="left" className="w-72 p-0 bg-white flex flex-col">
                <div className="p-4 border-b border-[#e7e2da]">
                  <SheetTitle className="sr-only">Student Menu</SheetTitle>
                  <Brand />
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  <StudentNavigation onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden sm:flex items-center gap-2">
              <Badge className="bg-[#faf9f5] text-stone-700 hover:bg-[#f7f5f0] border border-[#e7e2da]">
                Session 2026–2027
              </Badge>
              <span className="text-xs text-stone-500 font-medium">Student Learning Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Learner Active</span>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button
                  type="button"
                  data-testid="student-avatar-button"
                  className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-[#faf9f5] transition outline-none"
                  aria-label="Student profile settings"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-[#2c1d17] text-[#c5a059] text-xs font-bold">
                      {studentName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-xs font-semibold text-[#2c1d17] max-w-[120px] truncate">
                    {studentName}
                  </span>
                  <ChevronDown className="size-3 text-stone-400" />
                </button>
              } />
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#e7e2da] bg-white">
                <DropdownMenuLabel className="font-normal p-3">
                  <p className="text-sm font-semibold text-[#2c1d17]">{studentName}</p>
                  <p className="text-xs text-stone-500 truncate mt-0.5">{studentEmail}</p>
                  <span className="mt-2 inline-flex items-center rounded-full bg-[#faf9f5] px-2 py-0.5 text-[10px] font-bold text-[#2c1d17] border border-[#e7e2da]">
                    Student
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#e7e2da]" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => setSettingsOpen(true)}
                    className="cursor-pointer gap-2"
                  >
                    <Settings className="size-4 text-[#2c1d17]" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-[#e7e2da]" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      <UserSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userEmail={studentEmail}
        role="student"
        roleName="Student"
      />
    </div>
  )
}
