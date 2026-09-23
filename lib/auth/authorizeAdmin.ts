import { createClient as createAdminClient } from '@supabase/supabase-js'
import { isSuperAdminEmail, normalizeRole } from '@/lib/config'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  if (!url || !key) return null
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export interface AdminCallerUser {
  id: string
  email?: string | null
  user_metadata?: Record<string, any>
  app_metadata?: Record<string, any>
}

export interface AuthorizeAdminResult {
  isAuthorized: boolean
  callerProfile: {
    role?: string | null
    school_id?: string | null
  } | null
  schoolId?: string | null
}

/**
 * Authoritatively verifies whether the calling authenticated user has administrative
 * authority over the campus (school_admin, admin, or super_admin).
 * Bypasses RLS read limits via the adminClient, cross-references school ownership,
 * and eliminates client-controlled privilege escalation vectors.
 */
export async function authorizeAdminCaller(
  currentUser: AdminCallerUser
): Promise<AuthorizeAdminResult> {
  const adminClient = getAdminClient()
  const userEmail = (currentUser.email || '').toLowerCase().trim()
  const isSuper = isSuperAdminEmail(userEmail)

  // 1. Inspect profiles table using adminClient to avoid any user-scoped RLS restrictions
  let callerProfile: { school_id?: string | null; role?: string | null } | null = null
  if (adminClient) {
    try {
      const { data: prof } = await adminClient
        .from('profiles')
        .select('role, school_id')
        .eq('id', currentUser.id)
        .maybeSingle()
      if (prof) {
        callerProfile = prof
      }
    } catch (err) {
      console.warn('Profiles admin lookup notice:', err)
    }
  }

  // 2. Normalize roles from trusted sources only: DB profile and signed app_metadata
  const profileRole = normalizeRole(callerProfile?.role || '')
  const metadataRole = normalizeRole(
    (currentUser.app_metadata?.role || '') as string
  )

  // 3. Verify server-side school ownership via schools.admin_email
  let schoolOwnedId: string | null = null
  if (userEmail && adminClient) {
    try {
      const { data: school } = await adminClient
        .from('schools')
        .select('id')
        .eq('admin_email', userEmail)
        .limit(1)
        .maybeSingle()
      if (school?.id) {
        schoolOwnedId = school.id
      }
    } catch {}
  }

  // School ID resolved strictly from server-trusted values (never user_metadata)
  const effectiveSchoolId =
    callerProfile?.school_id ||
    schoolOwnedId ||
    (currentUser.app_metadata?.school_id as string) ||
    null

  // Authorization requires verified super admin, administrative profile role,
  // administrative app_metadata role, or verified school ownership
  const isAuthorized =
    isSuper ||
    ['school_admin', 'super_admin', 'admin'].includes(profileRole) ||
    ['school_admin', 'super_admin', 'admin'].includes(metadataRole) ||
    Boolean(schoolOwnedId)

  const effectiveRole = isSuper
    ? 'super_admin'
    : profileRole || metadataRole || (schoolOwnedId ? 'school_admin' : 'school_admin')

  const resolvedProfile = {
    role: effectiveRole,
    school_id: effectiveSchoolId,
  }

  if (isAuthorized) {
    // Synchronize school_id to profile if missing for authorized school administrators
    if (adminClient && effectiveSchoolId && (!callerProfile?.school_id || !callerProfile?.role)) {
      try {
        await adminClient
          .from('profiles')
          .update({
            school_id: effectiveSchoolId,
            ...(callerProfile?.role ? {} : { role: effectiveRole }),
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser.id)
      } catch (syncErr) {
        console.warn('Profile school_id sync notice:', syncErr)
      }
    }
    return {
      isAuthorized: true,
      callerProfile: resolvedProfile,
      schoolId: effectiveSchoolId,
    }
  }

  return {
    isAuthorized: false,
    callerProfile: resolvedProfile,
    schoolId: effectiveSchoolId,
  }
}
