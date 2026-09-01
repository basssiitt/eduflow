import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = ['/admin', '/teacher', '/parent', '/super-admin']
const superAdminEmails = [
  'basithunyawrr@gmail.com',
  'basithadi@gmail.com',
  'superadmin@eduflow.pk',
]

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return response
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Helper for clean redirect with status 303 (See Other) and preserving session cookies
  const safeRedirect = (target: string | URL) => {
    const targetUrl = new URL(target, request.url)
    // Avoid self-redirect loops
    if (targetUrl.pathname === pathname) {
      return response
    }
    return NextResponse.redirect(targetUrl, {
      status: 303,
      headers: response.headers,
    })
  }

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // 1. Unauthenticated handling
  if (!user) {
    if (isProtected) {
      // Prevent redirect loop if already on login
      if (pathname === '/login' || pathname.startsWith('/login/')) {
        return response
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return safeRedirect(loginUrl)
    }
    return response
  }

  // 2. Authenticated user handling
  const userEmail = (user.email || '').toLowerCase().trim()
  let role = (user.app_metadata?.role || user.user_metadata?.role || '') as string
  if (!role) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = (profile?.role || '') as string
    } catch {}
  }
  let normalizedRole = role.toLowerCase().replace(/-/g, '_')

  const isSuperAdmin =
    superAdminEmails.includes(userEmail) || normalizedRole === 'super_admin'
  if (isSuperAdmin) {
    normalizedRole = 'super_admin'
  }

  const roleHomes: Record<string, string> = {
    super_admin: '/super-admin',
    school_admin: '/admin',
    admin: '/admin',
    teacher: '/teacher',
    parent: '/parent',
  }
  const homeUrl = isSuperAdmin ? '/super-admin' : (roleHomes[normalizedRole] || '/admin')

  // If already authenticated and visiting /login:
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    const nextParam = request.nextUrl.searchParams.get('next')
    if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('/login')) {
      if (nextParam.startsWith('/super-admin') && !isSuperAdmin) {
        return safeRedirect(homeUrl)
      }
      return safeRedirect(nextParam)
    }
    return safeRedirect(homeUrl)
  }

  // Strictly guard /super-admin
  if (pathname === '/super-admin' || pathname.startsWith('/super-admin/')) {
    if (!isSuperAdmin) {
      return safeRedirect(homeUrl)
    }
    return response
  }

  // Guard /admin
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!isSuperAdmin && !['school_admin', 'admin'].includes(normalizedRole)) {
      return safeRedirect(homeUrl)
    }
    return response
  }

  // Guard /teacher
  if (pathname === '/teacher' || pathname.startsWith('/teacher/')) {
    if (!isSuperAdmin && !['teacher', 'school_admin', 'admin'].includes(normalizedRole)) {
      return safeRedirect(homeUrl)
    }
    return response
  }

  // Guard /parent
  if (pathname === '/parent' || pathname.startsWith('/parent/')) {
    if (!isSuperAdmin && !['parent', 'school_admin', 'admin'].includes(normalizedRole)) {
      return safeRedirect(homeUrl)
    }
    return response
  }

  return response
}
