import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSuperAdminEmail, normalizeRole, getHomeRoute } from '@/lib/config'

const protectedRoutes = ['/admin', '/teacher', '/parent', '/super-admin', '/onboarding']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl

  // Student portal is consolidated into Parents Portal: redirect any /student route to /parent
  if (pathname === '/student' || pathname.startsWith('/student/')) {
    const parentUrl = new URL('/parent', request.url)
    return NextResponse.redirect(parentUrl, { status: 301 })
  }

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
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    })
    return redirectResponse
  }

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Redirect broadcast to admin overview
  if (pathname.startsWith('/admin/broadcast')) {
    return NextResponse.redirect(new URL('/admin', request.url), { status: 301 })
  }

  // 1. Check session cookies
  const cookieEmail = request.cookies.get('eduflow-user-email')?.value?.toLowerCase().trim()
  const cookieRole = request.cookies.get('eduflow-user-role')?.value?.toLowerCase().trim()

  const effectiveEmail = (user?.email || cookieEmail || '').toLowerCase().trim()
  let role = ''
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    role = profile?.role || ''
  }
  if (!role && cookieRole) {
    role = cookieRole
  }

  let normalizedRole = normalizeRole(role)
  const isSuperAdmin = isSuperAdminEmail(effectiveEmail) || normalizedRole === 'super_admin'
  if (isSuperAdmin) {
    normalizedRole = 'super_admin'
  }

  // Unauthenticated handling
  if (!user && !cookieEmail) {
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

  const homeUrl = getHomeRoute(normalizedRole, effectiveEmail)

  // If authenticated and visiting /login or /signup:
  if (
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/signup' ||
    pathname.startsWith('/signup/')
  ) {
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

  // Guard /super-admin - STRICTLY CONFIDENTIAL: only basithunyawrr@gmail.com
  if (pathname === '/super-admin' || pathname.startsWith('/super-admin/')) {
    if (isSuperAdminEmail(effectiveEmail)) {
      return response
    }
    // Conceal existence of super-admin from unauthorized users
    return safeRedirect(effectiveEmail ? homeUrl : '/login')
  }

  // Guard /admin
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!isSuperAdmin && !['school_admin', 'admin'].includes(normalizedRole)) {
      return safeRedirect(homeUrl)
    }
    return response
  }

  // Portals are role-scoped. Administrators may manage the admin portal only;
  // they are not granted access to teacher or parent personal portals.
  if (pathname === '/teacher' || pathname.startsWith('/teacher/')) {
    if (!isSuperAdmin && normalizedRole !== 'teacher') {
      return safeRedirect(homeUrl)
    }
    return response
  }

  if (pathname === '/parent' || pathname.startsWith('/parent/')) {
    if (!isSuperAdmin && normalizedRole !== 'parent') {
      return safeRedirect(homeUrl)
    }
    return response
  }

  // Guard /onboarding — only school_admins who haven't completed setup
  if (pathname === '/onboarding' || pathname.startsWith('/onboarding/')) {
    if (!user) {
      return safeRedirect(new URL('/login', request.url))
    }
    // Already-onboarded users or non-school_admins don't need onboarding
    if (normalizedRole !== 'school_admin' && !isSuperAdmin) {
      return safeRedirect(homeUrl)
    }
    // Check onboarding status from profile
    try {
      const { data: onboardingProfile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle()
      if (onboardingProfile?.onboarding_completed) {
        return safeRedirect(new URL('/admin/overview', request.url))
      }
    } catch {}
    return response
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
