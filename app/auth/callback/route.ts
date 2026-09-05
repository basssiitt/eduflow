import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHomeRoute, normalizeRole, isSuperAdminEmail } from '@/lib/config'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data?.user) {
        const user = data.user
        const userEmail = (user.email || '').toLowerCase().trim()

      // 1. Check if user already has a profile record
      let role = ''
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

      // 2. If no profile exists, create a new school admin profile with 30-day Pro trial
      if (!role) {
        const fullName = (
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          userEmail.split('@')[0] ||
          'School Administrator'
        ).trim()

        const schoolName = (
          user.user_metadata?.school_name ||
          `${fullName}'s Campus`
        ).trim()

        const city = (user.user_metadata?.city || 'Karachi').trim()
        const initialRole = isSuperAdminEmail(userEmail) ? 'super_admin' : 'school_admin'

        // Create new campus tenant with 30-day Pro trial
        let campusId = null
        try {
          const trialEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          const { data: campus } = await supabase
            .from('campuses')
            .insert([
              {
                name: schoolName,
                city,
                owner: fullName,
                plan: 'Pro',
                students: 0,
                status: 'Active',
                admin_email: userEmail,
                created_at: new Date().toISOString(),
              },
            ])
            .select('id')
            .single()

          if (campus?.id) {
            campusId = campus.id
          }
        } catch {}

        // Create user profile
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: userEmail,
            full_name: fullName,
            role: initialRole,
            campus_id: campusId,
            updated_at: new Date().toISOString(),
          })
        } catch {}

        role = initialRole
      }

      let normalizedRole = normalizeRole(role)
      if (isSuperAdminEmail(userEmail) || normalizedRole === 'super_admin') {
        normalizedRole = 'super_admin'
      }

      // Safe destination redirect
      let destination = getHomeRoute(normalizedRole, userEmail)
      if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/login') && !next.startsWith('/signup')) {
        if (!next.startsWith('/super-admin') || normalizedRole === 'super_admin') {
          destination = next
        }
      }

        return NextResponse.redirect(new URL(destination, request.url))
      }
    } catch {}
  }

  // Fallback to login if code exchange fails
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}
