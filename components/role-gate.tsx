'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'

export function RoleGate({
  role,
  children,
}: {
  role: 'super-admin' | 'school-admin' | 'teacher' | 'parent'
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkAccess = async () => {
      const demoRole = typeof window !== 'undefined' ? sessionStorage.getItem('eduflow-demo-role') : null

      // Check demo mode authorization
      if (demoRole) {
        const normalizedDemo = demoRole.toLowerCase().replace(/-/g, '_')
        const normalizedTarget = role.toLowerCase().replace(/-/g, '_')

        let isDemoAuthorized = false
        if (normalizedTarget === 'super_admin') {
          isDemoAuthorized = normalizedDemo === 'super_admin'
        } else if (normalizedTarget === 'school_admin') {
          isDemoAuthorized = ['school_admin', 'admin', 'super_admin'].includes(normalizedDemo)
        } else if (normalizedTarget === 'teacher') {
          isDemoAuthorized = ['teacher', 'school_admin', 'admin', 'super_admin'].includes(normalizedDemo)
        } else if (normalizedTarget === 'parent') {
          isDemoAuthorized = ['parent', 'school_admin', 'admin', 'super_admin'].includes(normalizedDemo)
        }

        if (isDemoAuthorized) {
          if (mounted) {
            setAllowed(true)
            setChecking(false)
          }
          return
        }
      }

      // If Supabase is not configured and no valid demo session, allow or redirect to login
      if (!isSupabaseConfigured || !supabaseClient) {
        if (mounted) {
          // If demo session exists but is wrong role, redirect to login
          if (demoRole) {
            router.replace('/login')
          } else {
            setAllowed(true)
            setChecking(false)
          }
        }
        return
      }

      try {
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
          if (mounted) {
            router.replace(`/login?next=${encodeURIComponent(pathname)}`)
          }
          return
        }

        // Query user's role from the `profiles` table
        let userRole = (user.app_metadata?.role || user.user_metadata?.role || '') as string
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role) {
          userRole = profile.role
        }

        const normalizedUserRole = (userRole || '').toLowerCase().replace(/-/g, '_')
        const normalizedTargetRole = role.toLowerCase().replace(/-/g, '_')

        let isAuthorized = false

        // Super Admin route is strictly guarded: only super_admin
        if (normalizedTargetRole === 'super_admin') {
          isAuthorized = normalizedUserRole === 'super_admin'
        } else if (normalizedTargetRole === 'school_admin') {
          isAuthorized = ['school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
        } else if (normalizedTargetRole === 'teacher') {
          isAuthorized = ['teacher', 'school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
        } else if (normalizedTargetRole === 'parent') {
          isAuthorized = ['parent', 'school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
        }

        if (!isAuthorized) {
          const roleHomes: Record<string, string> = {
            super_admin: '/super-admin',
            school_admin: '/admin',
            admin: '/admin',
            teacher: '/teacher',
            parent: '/parent',
          }
          const destination = roleHomes[normalizedUserRole] || '/login'
          if (mounted) {
            router.replace(destination)
          }
          return
        }

        if (mounted) {
          setAllowed(true)
          setChecking(false)
        }
      } catch {
        if (mounted) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        }
      }
    }

    checkAccess()

    return () => {
      mounted = false
    }
  }, [role, router, pathname])

  if (checking || !allowed) {
    return (
      <main className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Checking workspace access…</p>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
