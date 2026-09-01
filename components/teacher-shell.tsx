'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  GraduationCap,
  LogOut,
  UserRound,
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
import { OfflineStatusBar } from '@/components/eduflow-provider'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'

export function TeacherShell({ children }: { children: React.ReactNode }) {
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

  const userInitials = (userEmail ? userEmail.slice(0, 2) : 'TC').toUpperCase()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="flex items-center gap-2.5 no-underline">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-foreground">EduFlow OS</span>
              <span className="ml-2 text-xs text-muted-foreground">Teacher Console</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <OfflineStatusBar compact />
          <Badge variant="outline" className="hidden border-amber-500/40 bg-amber-500/10 text-amber-700 sm:inline-flex">
            Session 2026–2027
          </Badge>

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
                <p className="truncate font-semibold">{userEmail || 'teacher@school.edu.pk'}</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">Classroom Teacher</Badge>
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
  )
}
