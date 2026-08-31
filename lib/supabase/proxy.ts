import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = ['/admin', '/teacher', '/parent', '/super-admin']
const superAdminEmails = ['basithadi@gmail.com', 'superadmin@eduflow.pk']

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

  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user) {
    const userEmail = (user.email || '').toLowerCase().trim()
    let role = (user.app_metadata?.role || user.user_metadata?.role || '') as string
    if (!role) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      role = (profile?.role || '') as string
    }
    let normalizedRole = role.toLowerCase().replace(/-/g, '_')

    const isSuperAdmin = superAdminEmails.includes(userEmail) || normalizedRole === 'super_admin'
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

    if (pathname === '/login') {
      const nextParam = request.nextUrl.searchParams.get('next')
      if (nextParam && nextParam.startsWith('/')) {
        return NextResponse.redirect(new URL(nextParam, request.url))
      }
      return NextResponse.redirect(new URL(homeUrl, request.url))
    }

    if (pathname === '/super-admin' || pathname.startsWith('/super-admin/')) {
      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL(homeUrl, request.url))
      }
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      if (!isSuperAdmin && !['school_admin', 'admin'].includes(normalizedRole)) {
        return NextResponse.redirect(new URL(homeUrl, request.url))
      }
    }

    if (pathname === '/teacher' || pathname.startsWith('/teacher/')) {
      if (!isSuperAdmin && !['teacher', 'school_admin', 'admin'].includes(normalizedRole)) {
        return NextResponse.redirect(new URL(homeUrl, request.url))
      }
    }

    if (pathname === '/parent' || pathname.startsWith('/parent/')) {
      if (!isSuperAdmin && !['parent', 'school_admin', 'admin'].includes(normalizedRole)) {
        return NextResponse.redirect(new URL(homeUrl, request.url))
      }
    }
  }

  return response
}
