import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { isSuperAdminEmail, normalizeRole, getHomeRoute } from '@/lib/config'

import { createHash, timingSafeEqual } from 'crypto'

function safeCompare(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest()
  const hashB = createHash('sha256').update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

const DATA_FILE = path.join(process.cwd(), 'data', 'teachers.json')

function getStoredTeachers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cookieStore = await cookies()

    // 1. Attempt Supabase Auth Sign In via SSR Server Client (persists session cookies)
    const ssrClient = await createServerSupabase()
    let authUser: any = null
    let authErrorMsg = ''

    try {
      const { data, error } = await ssrClient.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })
      if (!error && data?.user) {
        authUser = data.user
      } else if (error) {
        authErrorMsg = error.message
      }
    } catch (err: any) {
      authErrorMsg = err?.message || 'Authentication error'
    }

    // Fallback: If SSR client didn't match and a separate service role key or admin client is configured
    if (!authUser) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      if (serviceRoleKey) {
        try {
          const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
          const { data, error } = await adminClient.auth.signInWithPassword({
            email: cleanEmail,
            password,
          })
          if (!error && data?.user) {
            authUser = data.user
          }
        } catch {}
      }
    }

    // 2. If Supabase Auth authenticated the user
    if (authUser) {
      let role = (authUser.app_metadata?.role || authUser.user_metadata?.role || '') as string
      let isSetupComplete = Boolean(
        authUser.user_metadata?.school_id ||
        authUser.user_metadata?.onboarding_completed
      )

      try {
        // Query only verified columns in profiles table
        const { data: profile } = await ssrClient
          .from('profiles')
          .select('role, onboarding_completed, school_id')
          .eq('id', authUser.id)
          .maybeSingle()

        if (profile?.role) {
          role = profile.role
        }
        if (profile?.onboarding_completed || profile?.school_id) {
          isSetupComplete = true
        }
      } catch {}

      let normalizedRole = normalizeRole(role)
      if (isSuperAdminEmail(cleanEmail) || normalizedRole === 'super_admin') {
        normalizedRole = 'super_admin'
      } else if (!normalizedRole) {
        normalizedRole = 'school_admin'
      }

      let destination = getHomeRoute(normalizedRole, cleanEmail)
      if (normalizedRole === 'school_admin') {
        destination = isSetupComplete ? '/admin/dashboard' : '/onboarding'
      }

      cookieStore.set('eduflow-user-email', cleanEmail, { path: '/', maxAge: 86400, sameSite: 'lax' })
      cookieStore.set('eduflow-user-role', normalizedRole, { path: '/', maxAge: 86400, sameSite: 'lax' })

      return NextResponse.json({
        success: true,
        destination,
        role: normalizedRole,
        email: cleanEmail,
      })
    }

    // 3. Check Teacher Directory for Onboarded Teacher with Temp Password
    const teachers = getStoredTeachers()
    const matchingTeacher = teachers.find(
      (t: any) => t.email && t.email.toLowerCase() === cleanEmail
    )

    if (matchingTeacher && matchingTeacher.tempPassword && safeCompare(matchingTeacher.tempPassword, password)) {
      cookieStore.set('eduflow-user-email', cleanEmail, { path: '/', maxAge: 86400, sameSite: 'lax' })
      cookieStore.set('eduflow-user-role', 'teacher', { path: '/', maxAge: 86400, sameSite: 'lax' })
      cookieStore.set('eduflow-teacher-code', matchingTeacher.employee_code, { path: '/', maxAge: 86400, sameSite: 'lax' })
      cookieStore.set('eduflow-teacher-name', matchingTeacher.name, { path: '/', maxAge: 86400, sameSite: 'lax' })

      return NextResponse.json({
        success: true,
        destination: '/teacher',
        role: 'teacher',
        email: cleanEmail,
        employee_code: matchingTeacher.employee_code,
        name: matchingTeacher.name,
      })
    }

    // 3. Teacher Directory check completed above. If neither Supabase nor Teacher auth succeeded, reject.

    // Return friendly, exact error message
    const errorResponse = authErrorMsg.toLowerCase().includes('email not confirmed')
      ? 'Your account was registered in Supabase. Please verify your email confirmation or ask your administrator.'
      : 'Invalid email or password. Please verify your credentials and try again.'

    return NextResponse.json(
      { success: false, error: errorResponse },
      { status: 401 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Authentication failed. Please try again.' },
      { status: 500 }
    )
  }
}
