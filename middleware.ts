import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSuperAdminEmail, normalizeRole } from '@/lib/config'

const protectedPrefixes = ['/admin', '/teacher', '/parent', '/super-admin', '/onboarding']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl

  // 1. Consolidated Student Portal: 301 Permanent Redirect /student/* -> /parent
  if (pathname === '/student' || pathname.startsWith('/student/')) {
    const parentUrl = new URL('/parent', request.url)
    return NextResponse.redirect(parentUrl, { status: 301 })
  }

  // 2. Redirect legacy /admin/broadcast -> /admin
  if (pathname.startsWith('/admin/broadcast')) {
    return NextResponse.redirect(new URL('/admin', request.url), { status: 301 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return response
  }

  // 3. Initialize Server Supabase Client
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

  // 4. Authenticate User
  const { data: { user } } = await supabase.auth.getUser()

  // Helper for safe 303 redirection with preserved session cookies
  const safeRedirect = (target: string | URL) => {
    const targetUrl = new URL(target, request.url)
    if (targetUrl.pathname === pathname) {
      return response
    }
    const redirectResponse = NextResponse.redirect(targetUrl, { status: 303 })
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    })
    return redirectResponse
  }

  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  // 5. Unauthenticated User Handling
  if (!user) {
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return safeRedirect(loginUrl)
    }
    return response
  }

  // 6. Query User Profile & Role from Database
  const userEmail = (user.email ?? '').toLowerCase().trim()
  const isSuperAdmin = isSuperAdminEmail(userEmail)

  let role = ''
  let schoolId: string | null = null
  let profileOnboarded = false
  let profileSetupComplete = false

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id, onboarding_completed, school_setup_complete')
      .eq('id', user.id)
      .maybeSingle()

    if (profile) {
      role = profile.role || ''
      schoolId = profile.school_id || null
      profileOnboarded = Boolean(profile.onboarding_completed)
      profileSetupComplete = Boolean(profile.school_setup_complete)
    }
  } catch (err) {
    console.warn('Middleware profile lookup error:', err)
  }

  // Check school setup complete status on schools table if schoolId exists
  let schoolTableSetupComplete = false
  if (schoolId) {
    try {
      const { data: school } = await supabase
        .from('schools')
        .select('school_setup_complete')
        .eq('id', schoolId)
        .maybeSingle()
      if (school) {
        schoolTableSetupComplete = Boolean(school.school_setup_complete)
      }
    } catch {}
  }

  const isSchoolSetupComplete = schoolTableSetupComplete || profileSetupComplete || profileOnboarded

  // Fallback to auth metadata if profile role is not set yet
  if (!role) {
    role = (user.app_metadata?.role || user.user_metadata?.role || '') as string
  }

  let normalizedRole = normalizeRole(role)
  if (isSuperAdmin || normalizedRole === 'super_admin') {
    normalizedRole = 'super_admin'
  } else if (!normalizedRole) {
    normalizedRole = 'school_admin'
  }

  // Determine strict home route per role
  let roleHomeRoute = '/admin'
  switch (normalizedRole) {
    case 'super_admin':
      roleHomeRoute = '/super-admin'
      break
    case 'school_admin':
      roleHomeRoute = isSchoolSetupComplete ? '/admin/dashboard' : '/onboarding'
      break
    case 'teacher':
      roleHomeRoute = '/teacher'
      break
    case 'parent':
      roleHomeRoute = '/parent'
      break
  }

  const force = request.nextUrl.searchParams.get('force') === '1'

  // 7. If authenticated user visits /login or /signup, redirect directly to their role destination
  if (
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/signup' ||
    pathname.startsWith('/signup/')
  ) {
    if (force) return response
    return safeRedirect(roleHomeRoute)
  }

  // 8. Strict Role-Based Portal Access Enforcement (Prevent cross-role access)

  // A. Super Admin Portal (/super-admin) -> strictly super_admin
  if (pathname === '/super-admin' || pathname.startsWith('/super-admin/')) {
    if (normalizedRole !== 'super_admin' && !isSuperAdmin) {
      return safeRedirect(roleHomeRoute)
    }
    return response
  }

  // B. School Admin Portal (/admin) -> strictly school_admin (or super_admin)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (normalizedRole !== 'school_admin' && normalizedRole !== 'super_admin') {
      return safeRedirect(roleHomeRoute)
    }
    return response
  }

  // C. Teacher Portal (/teacher) -> strictly teacher (or super_admin)
  if (pathname === '/teacher' || pathname.startsWith('/teacher/')) {
    if (normalizedRole !== 'teacher' && normalizedRole !== 'super_admin') {
      return safeRedirect(roleHomeRoute)
    }
    return response
  }

  // D. Parent Portal (/parent) -> strictly parent (or super_admin)
  if (pathname === '/parent' || pathname.startsWith('/parent/')) {
    if (normalizedRole !== 'parent' && normalizedRole !== 'super_admin') {
      return safeRedirect(roleHomeRoute)
    }
    return response
  }

  // E. Onboarding Route (/onboarding)
  // If school_setup_complete is true, bypass /onboarding and redirect directly to /admin/dashboard
  if (pathname === '/onboarding' || pathname.startsWith('/onboarding/')) {
    if (normalizedRole !== 'school_admin' && normalizedRole !== 'super_admin') {
      return safeRedirect(roleHomeRoute)
    }
    if (isSchoolSetupComplete) {
      return safeRedirect('/admin/dashboard')
    }
    return response
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
