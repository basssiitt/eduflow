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
        const isSuperAdminEmail =
          userEmail === 'basithunyawrr@gmail.com' ||
          userEmail === 'basithadi@gmail.com' ||
          userEmail === 'superadmin@eduflow.pk'

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

        let normalizedUserRole = (userRole || '').toLowerCase().replace(/-/g, '_')
        if (isSuperAdminEmail || normalizedUserRole === 'super_admin') {
          normalizedUserRole = 'super_admin'
        }

        const normalizedTargetRole = role.toLowerCase().replace(/-/g, '_')

        let isAuthorized = false

        // Super Admin route is strictly guarded: only super_admin role or authorized superadmin email
        if (normalizedTargetRole === 'super_admin') {
          isAuthorized = normalizedUserRole === 'super_admin' || isSuperAdminEmail
        } else if (normalizedTargetRole === 'school_admin') {
          isAuthorized = isSuperAdminEmail || ['school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
        } else if (normalizedTargetRole === 'teacher') {
          isAuthorized = isSuperAdminEmail || ['teacher', 'school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
        } else if (normalizedTargetRole === 'parent') {
          isAuthorized = isSuperAdminEmail || ['parent', 'school_admin', 'admin', 'super_admin'].includes(normalizedUserRole)
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
