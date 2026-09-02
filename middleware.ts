import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSuperAdminEmail, normalizeRole, getHomeRoute } from '@/lib/config'

const protectedRoutes = ['/admin', '/teacher', '/parent', '/super-admin']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return response
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const force = request.nextUrl.searchParams.get('force') === '1'

  // Helper for clean redirect with status 303 (See Other) and preserving session cookies
  const safeRedirect = (target: string | URL) => {
    const targetUrl = new URL(target, request.url)
    if (targetUrl.pathname === pathname) {
      return response
    }
    const redirectResponse = NextResponse.redirect(targetUrl, {
      status: 303,
    })
    response.cookies.getAll().forEach((cookie: { name: string; value: string }) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // 1. Unauthenticated handling
  if (!user) {
    if (isProtected) {
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
      if (profile?.role) {
        role = profile.role
      }
    } catch {}
  }
  let normalizedRole = normalizeRole(role)
  const isSuperAdmin = isSuperAdminEmail(userEmail) || normalizedRole === 'super_admin'
  if (isSuperAdmin) {
    normalizedRole = 'super_admin'
  }

  const homeUrl = getHomeRoute(normalizedRole, userEmail)

  // If already authenticated and visiting /login:
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    if (force) {
      return response
    }

    const nextParam = request.nextUrl.searchParams.get('next')
    if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('/login')) {
      if (nextParam.startsWith('/super-admin') && !isSuperAdmin) {
        return safeRedirect(homeUrl)
      }
      return safeRedirect(nextParam)
    }
    return safeRedirect(homeUrl)
  }

  // Guard /super-admin
  if (pathname === '/super-admin' || pathname.startsWith('/super-admin/')) {
    if (user && (normalizedRole === 'super_admin' || isSuperAdmin)) {
      return response
    }
    return safeRedirect(homeUrl)
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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
