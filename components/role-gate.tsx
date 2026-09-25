'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    let mounted = true

    const checkAccess = async () => {
      // 1. When Supabase is configured, always verify authentic user session with Supabase
      if (isSupabaseConfigured && supabaseClient) {
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
              .maybeSingle()

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

          // Super Admin route is strictly guarded: exclusive to verified Super Admin emails
          if (normalizedTargetRole === 'super_admin') {
            isAuthorized = isSuper
          } else if (normalizedTargetRole === 'school_admin') {
            isAuthorized = isSuper || ['school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
          } else if (normalizedTargetRole === 'teacher') {
            isAuthorized = isSuper || ['teacher', 'super_admin'].includes(normalizedUserRole)
          } else if (normalizedTargetRole === 'parent') {
            isAuthorized = isSuper || ['parent', 'super_admin'].includes(normalizedUserRole)
          }

          if (!isAuthorized) {
            const destination = getHomeRoute(normalizedUserRole, userEmail)
            if (mounted) {
              router.replace(destination)
            }
            return
          }

          return
        } catch {
          if (mounted) {
            router.replace(`/login?next=${encodeURIComponent(pathname)}`)
          }
          return
        }
      }

      // 2. Offline / unconfigured development mode fallback ONLY when Supabase is NOT configured
      if (typeof window !== 'undefined') {
        const cookieEmailMatch = document.cookie
          .split('; ')
          .find((row) => row.startsWith('eduflow-user-email='))
        const cookieUserEmail = cookieEmailMatch ? decodeURIComponent(cookieEmailMatch.split('=')[1]).toLowerCase().trim() : null

        const cookieRoleMatch = document.cookie
          .split('; ')
          .find((row) => row.startsWith('eduflow-user-role='))
        const cookieUserRole = cookieRoleMatch ? decodeURIComponent(cookieRoleMatch.split('=')[1]).toLowerCase().trim() : null

        const activeRole = cookieUserRole
        const isSuper = isSuperAdminEmail(cookieUserEmail)

        if (activeRole || isSuper) {
          const normalizedActive = normalizeRole(activeRole)
          const normalizedTarget = normalizeRole(role)

          let authorized = false
          if (normalizedTarget === 'super_admin') {
            // Super Admin routes strictly require authentic Supabase session verification - never client cookies
            authorized = false
          } else if (normalizedTarget === 'school_admin') {
            authorized = ['school_admin', 'admin'].includes(normalizedActive)
          } else if (normalizedTarget === 'teacher') {
            authorized = ['teacher'].includes(normalizedActive)
          } else if (normalizedTarget === 'parent') {
            authorized = ['parent'].includes(normalizedActive)
          }

          if (authorized) {
            return
          }
        }
      }

      if (mounted) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      }
    }

    checkAccess()

    return () => {
      mounted = false
    }
  }, [role, router, pathname])

  return <>{children}</>
}
