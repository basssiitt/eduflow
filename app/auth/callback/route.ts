import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHomeRoute, normalizeRole, isSuperAdminEmail, ROLE_PORTAL_ROUTES } from '@/lib/config'

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

        // ── Step 1: Email-first profile lookup (prevents duplicate accounts) ─
        const { data: existingByEmail } = await supabase
          .from('profiles')
          .select('id, role, onboarding_completed, school_id')
          .eq('email', userEmail)
          .maybeSingle()

        if (existingByEmail) {
          // Profile found — link auth user id if it drifted
          if (existingByEmail.id !== user.id) {
            await supabase
              .from('profiles')
              .update({ id: user.id, updated_at: new Date().toISOString() })
              .eq('email', userEmail)
          }

          const role = existingByEmail.role as string
          let normalizedRole = normalizeRole(role)
          if (isSuperAdminEmail(userEmail) || normalizedRole === 'super_admin') {
            normalizedRole = 'super_admin'
          }

          // School admins who haven't finished onboarding → wizard
          if (normalizedRole === 'school_admin' && !existingByEmail.onboarding_completed) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
          }

          // Route to the dedicated portal
          const destination = resolveDestination(normalizedRole, userEmail, next)
          return NextResponse.redirect(new URL(destination, request.url))
        }

        // ── Step 2: Brand-new signup — create pending school_admin profile ───
        const initialRole = isSuperAdminEmail(userEmail) ? 'super_admin' : 'school_admin'

        const fullName = (
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          userEmail.split('@')[0] ||
          'School Administrator'
        ).trim()

        try {
          await supabase.from('profiles').insert({
            id: user.id,
            email: userEmail,
            full_name: fullName,
            role: initialRole,
            onboarding_completed: initialRole === 'super_admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } catch {}

        if (initialRole === 'super_admin') {
          return NextResponse.redirect(new URL('/super-admin/dashboard', request.url))
        }

        // New school admin → onboarding wizard
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    } catch {}
  }

  // Fallback to login if code exchange fails
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}

/**
 * Resolves the final redirect destination based on normalized role.
 * Respects a safe `next` param when provided.
 */
function resolveDestination(
  normalizedRole: string,
  userEmail: string,
  next: string | null
): string {
  const portalRoute =
    ROLE_PORTAL_ROUTES[normalizedRole] ?? getHomeRoute(normalizedRole, userEmail)

  if (
    next &&
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.startsWith('/login') &&
    !next.startsWith('/signup')
  ) {
    if (!next.startsWith('/super-admin') || normalizedRole === 'super_admin') {
      return next
    }
  }

  return portalRoute
}
