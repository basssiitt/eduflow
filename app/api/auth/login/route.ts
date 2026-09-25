import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { isSuperAdminEmail, normalizeRole, getHomeRoute } from '@/lib/config'
import { aj } from '@/lib/arcjet'

export async function POST(request: NextRequest) {
  try {
    const decision = await aj.protect(request as any)
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json({ error: 'Too many login attempts. Please wait.' }, { status: 429 })
      }
      return NextResponse.json({ error: 'Access denied by security shield.' }, { status: 403 })
    }

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

    // If authentication did not succeed, reject.

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
