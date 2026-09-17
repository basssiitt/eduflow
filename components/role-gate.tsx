'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { isSuperAdminEmail, normalizeRole, getHomeRoute } from '@/lib/config'

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
      // 1. Check for demo / standalone session fallback first
      if (typeof window !== 'undefined') {
        const isDemoUser = sessionStorage.getItem('eduflow-demo-user') === 'true'
        const cookieRoleMatch = document.cookie
          .split('; ')
          .find((row) => row.startsWith('eduflow-demo-role='))
        const demoCookieRole = cookieRoleMatch ? cookieRoleMatch.split('=')[1] : null
        const sessionRole = sessionStorage.getItem('eduflow-demo-role')
        const activeDemoRole = sessionRole || demoCookieRole

        if (isDemoUser || activeDemoRole) {
          const normalizedDemo = normalizeRole(activeDemoRole || 'school_admin')
          const normalizedTarget = normalizeRole(role)

          let demoAuthorized = false
          if (normalizedTarget === 'super_admin') {
            demoAuthorized = false
          } else if (normalizedTarget === 'school_admin') {
            demoAuthorized = ['school_admin', 'admin', 'super_admin'].includes(normalizedDemo)
          } else if (normalizedTarget === 'teacher') {
            demoAuthorized = ['teacher', 'school_admin', 'admin', 'super_admin'].includes(normalizedDemo)
          } else if (normalizedTarget === 'parent') {
            demoAuthorized = ['parent', 'school_admin', 'admin', 'super_admin'].includes(normalizedDemo)
          }

          if (demoAuthorized) {
            if (mounted) {
              setAllowed(true)
              setChecking(false)
            }
            return
          }
        }
      }

      if (!isSupabaseConfigured || !supabaseClient) {
        if (mounted) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`)
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

        const userEmail = (user.email || '').toLowerCase().trim()
        const isSuper = isSuperAdminEmail(userEmail)

        // Query user's role strictly from the `profiles` table
        let userRole = ''
        try {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          if (profile?.role) {
            userRole = profile.role
          }
        } catch {}

        if (!userRole) {
          userRole = (user.app_metadata?.role || user.user_metadata?.role || '') as string
        }

        let normalizedUserRole = normalizeRole(userRole)
        if (isSuper || normalizedUserRole === 'super_admin') {
          normalizedUserRole = 'super_admin'
        }

        const normalizedTargetRole = normalizeRole(role)

        let isAuthorized = false

        // Super Admin route is strictly guarded: exclusive to basithunyawrr@gmail.com
        if (normalizedTargetRole === 'super_admin') {
          isAuthorized = isSuper
        } else if (normalizedTargetRole === 'school_admin') {
          isAuthorized = isSuper || ['school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
        } else if (normalizedTargetRole === 'teacher') {
          isAuthorized = isSuper || ['teacher', 'school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
        } else if (normalizedTargetRole === 'parent') {
          isAuthorized = isSuper || ['parent', 'school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
        }

        if (!isAuthorized) {
          const destination = getHomeRoute(normalizedUserRole, userEmail)
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
      <main className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="size-7 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Verifying workspace permissions…</p>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
