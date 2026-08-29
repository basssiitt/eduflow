import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPaths: Record<string, string> = { '/admin': 'school-admin', '/teacher': 'teacher', '/parent': 'parent', '/super-admin': 'super-admin' }
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return response
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => { items.forEach(({ name, value, options }) => { request.cookies.set(name, value); response.cookies.set(name, value, options) }) } } })
  const { data: { user } } = await supabase.auth.getUser()
  const path = Object.keys(protectedPaths).find((entry) => request.nextUrl.pathname === entry || request.nextUrl.pathname.startsWith(`${entry}/`))
  if (path && !user) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(request.nextUrl.pathname)}`, request.url))
  return response
}
