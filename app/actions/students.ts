'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { db, schema } from '@/lib/db'
import { normalizeRole } from '@/lib/config'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  if (!url || !key) {
    throw new Error('Supabase configuration is missing in environment variables.')
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Robustly resolves the school_id for the currently logged-in administrator
 * by inspecting their profile, session metadata, or associated school record.
 */
async function resolveAdminSchoolId(
  currentUser: { id: string; email?: string | null; user_metadata?: Record<string, any>; app_metadata?: Record<string, any> },
  callerProfile?: { school_id?: string | null; role?: string | null } | null
): Promise<{ schoolId: string; schoolSlug: string }> {
  // 1. Check profile in Supabase database
  let schoolId: string | null = callerProfile?.school_id || null

  // 2. Check session metadata in Supabase Auth
  if (!schoolId) {
    schoolId =
      currentUser.user_metadata?.school_id ||
      currentUser.app_metadata?.school_id ||
      null
  }

  const adminClient = getAdminClient()
  let schoolSlug = 'school'

  // 3. Query schools table where caller is registered as admin
  if (!schoolId && currentUser.email) {
    try {
      const { data: userSchool } = await adminClient
        .from('schools')
        .select('id, name, slug')
        .eq('admin_email', currentUser.email.toLowerCase())
        .limit(1)
        .maybeSingle()
      if (userSchool?.id) {
        schoolId = userSchool.id
        schoolSlug = (userSchool.slug || userSchool.name || 'school').toLowerCase().replace(/[^a-z0-9]/g, '')
      }
    } catch {}
  }

  // 4. Fallback: Auto-provision a default school tenant record if completely empty
  if (!schoolId) {
    try {
      const schoolName = currentUser.user_metadata?.school_name || 'My Campus'
      const baseSlug = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'campus'
      const generatedSlug = `${baseSlug}-${Date.now().toString(36)}`

      const { data: newSchool } = await adminClient
        .from('schools')
        .insert({
          name: schoolName,
          slug: generatedSlug,
          admin_email: currentUser.email?.toLowerCase() || null,
          school_setup_complete: true,
        })
        .select('id, slug')
        .single()

      if (newSchool?.id) {
        schoolId = newSchool.id
        schoolSlug = newSchool.slug || baseSlug
      }
    } catch (createErr) {
      console.warn('Auto-provision school notice:', createErr)
    }
  }

  if (!schoolId) {
    throw new Error('Unable to resolve school_id for the logged-in administrator. Please complete school onboarding.')
  }

  // Ensure caller profile is synchronized with schoolId
  if (!callerProfile?.school_id) {
    try {
      await adminClient
        .from('profiles')
        .update({ school_id: schoolId })
        .eq('id', currentUser.id)
    } catch {}
  }

  // Query slug if not determined yet
  if (schoolSlug === 'school' && schoolId) {
    try {
      const { data: s } = await adminClient
        .from('schools')
        .select('slug, name')
        .eq('id', schoolId)
        .maybeSingle()
      if (s?.slug) {
        schoolSlug = s.slug.toLowerCase().replace(/[^a-z0-9]/g, '')
      } else if (s?.name) {
        schoolSlug = s.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      }
    } catch {}
  }

  return { schoolId, schoolSlug: schoolSlug || 'school' }
}

/* ──────────────────────────────────────────────────────────────────────────── */
/* 1. Admit Student Server Action                                              */
/* ──────────────────────────────────────────────────────────────────────────── */

export interface AdmitStudentInput {
  fullName: string
  fatherName?: string
  guardianName?: string
  rollNumber?: string
  grade: string
  section?: string
  guardianPhone?: string
  guardianEmail?: string
  monthlyFee?: number | string
}

export async function admitStudent(input: AdmitStudentInput) {
  try {
    // 1. Authenticate caller
    const supabase = await createServerSupabase()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: 'Authentication required to admit student.' }
    }

    // 2. Authorize administrator role
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', currentUser.id)
      .maybeSingle()

    const callerRole = normalizeRole(
      callerProfile?.role || currentUser.app_metadata?.role || currentUser.user_metadata?.role || ''
    )
    if (!['school_admin', 'super_admin', 'admin'].includes(callerRole)) {
      return { success: false, error: 'Forbidden: Only school administrators can admit students.' }
    }

    // 3. Retrieve currently logged-in admin's school_id (from session or profile in Supabase)
    const { schoolId } = await resolveAdminSchoolId(currentUser, callerProfile)

    const exactFullName = String(input.fullName || '').trim()
    const exactGuardianName = String(input.fatherName || input.guardianName || '').trim()
    const exactGrade = String(input.grade || 'Class 5').trim()
    const exactSection = String(input.section || 'A').trim()
    const exactPhone = String(input.guardianPhone || '').trim()
    const exactEmail = String(input.guardianEmail || '').trim().toLowerCase()
    const exactRollNumber = String(
      input.rollNumber || `2026-${Math.floor(100 + Math.random() * 900)}`
    ).trim()
    const exactMonthlyFee = String(input.monthlyFee || '15000')

    if (!exactFullName) {
      return { success: false, error: 'Student full name is required.' }
    }

    // 4. Explicitly include school_id in Drizzle ORM insert statement
    const adminClient = getAdminClient()
    let savedStudent: any = null

    try {
      const inserted = await db
        .insert(schema.students)
        .values({
          schoolId: schoolId, // explicitly included!
          fullName: exactFullName,
          rollNumber: exactRollNumber,
          grade: exactGrade,
          section: exactSection,
          guardianName: exactGuardianName || null,
          guardianPhone: exactPhone || null,
          guardianEmail: exactEmail || null,
          monthlyFee: exactMonthlyFee,
          status: 'active',
        })
        .returning({
          id: schema.students.id,
          rollNumber: schema.students.rollNumber,
        })

      savedStudent = inserted?.[0] || { id: 'created', rollNumber: exactRollNumber }
    } catch (drizzleErr) {
      console.warn('Drizzle student insert failed, falling back to Supabase client:', drizzleErr)
      const { data: sbData, error: sbErr } = await adminClient
        .from('students')
        .insert([
          {
            school_id: schoolId, // explicitly included!
            full_name: exactFullName,
            father_name: exactGuardianName || null,
            roll_number: exactRollNumber,
            class_name: exactGrade,
            section: exactSection,
            guardian_name: exactGuardianName || null,
            guardian_phone: exactPhone || null,
            guardian_email: exactEmail || null,
            monthly_fee: Number(exactMonthlyFee) || 15000,
            status: 'active',
          },
        ])
        .select('id, roll_number')
        .single()

      if (sbErr) {
        return { success: false, error: `Failed to admit student: ${sbErr.message}` }
      }
      savedStudent = sbData
    }

    return {
      success: true,
      student: savedStudent,
      schoolId,
    }
  } catch (err: any) {
    console.error('admitStudent error:', err)
    return { success: false, error: err?.message || 'An error occurred while admitting student.' }
  }
}

export const admitStudentAction = admitStudent

/* ──────────────────────────────────────────────────────────────────────────── */
/* 2. Bulk CSV Upload Server Action                                            */
/* ──────────────────────────────────────────────────────────────────────────── */

export interface CsvStudentInput {
  roll_number?: string
  student_name: string
  grade?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  section?: string
  monthly_fee?: number | string
  // Support camelCase legacy props
  rollNumber?: string
  studentName?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  monthlyFee?: number | string
}

export type BulkStudentInput =
  | CsvStudentInput
  | [string, string, string?, string?, string?, string?] // [roll, name, grade, parent_name, phone, email]

export interface GeneratedParentCredential {
  roll_number: string
  student_name: string
  grade: string
  parent_name: string
  parent_phone: string
  parent_email: string
  temporary_password: string
  // Legacy aliases
  rollNumber?: string
  studentName?: string
  parentPhone?: string
  parentEmail?: string
  temporaryPassword?: string
}

export async function bulkUploadStudentsAction(
  rows: BulkStudentInput[]
): Promise<{
  success: boolean
  imported: number
  credentials: GeneratedParentCredential[]
  error?: string
}> {
  try {
    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: true, imported: 0, credentials: [] }
    }

    // 1. Authenticate calling administrator
    const supabase = await createServerSupabase()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, imported: 0, credentials: [], error: 'Authentication required to bulk import student records.' }
    }

    // 2. Authorize admin role
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', currentUser.id)
      .maybeSingle()

    const callerRole = normalizeRole(callerProfile?.role || '')
    if (!['school_admin', 'super_admin', 'admin'].includes(callerRole)) {
      return { success: false, imported: 0, credentials: [], error: 'Forbidden: Only school administrators can import students.' }
    }

  // 3. Retrieve currently logged-in admin's school_id (from session or profile in Supabase)
  const { schoolId, schoolSlug } = await resolveAdminSchoolId(currentUser, callerProfile)
  const adminClient = getAdminClient()

  // 4. Process each student row mapping exact CSV header keys
  const credentials: GeneratedParentCredential[] = []

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]

    let rollNumber = ''
    let studentName = ''
    let grade = 'Class 5'
    let parentName = ''
    let parentPhone = ''
    let parentEmail = ''
    let section = 'A'
    let monthlyFee = 15000

    if (Array.isArray(raw)) {
      rollNumber = String(raw[0] || '').trim()
      studentName = String(raw[1] || '').trim()
      grade = String(raw[2] || 'Class 5').trim()
      parentName = String(raw[3] || '').trim()
      parentPhone = String(raw[4] || '').trim()
      parentEmail = String(raw[5] || '').trim().toLowerCase()
    } else {
      // Map based on exact CSV header keys: roll_number, student_name, grade, parent_name, parent_phone, parent_email
      rollNumber = String(raw.roll_number || raw.rollNumber || '').trim()
      studentName = String(raw.student_name || raw.studentName || '').trim()
      grade = String(raw.grade || 'Class 5').trim()
      parentName = String(raw.parent_name || raw.parentName || '').trim()
      parentPhone = String(raw.parent_phone || raw.parentPhone || '').trim()
      parentEmail = String(raw.parent_email || raw.parentEmail || '').trim().toLowerCase()
      if (raw.section) section = String(raw.section).trim()
      if (raw.monthly_fee) monthlyFee = Number(raw.monthly_fee) || 15000
      else if (raw.monthlyFee) monthlyFee = Number(raw.monthlyFee) || 15000
    }

    if (!rollNumber) {
      rollNumber = `2026-${String(i + 1).padStart(3, '0')}`
    }
    if (!studentName) {
      studentName = `Student ${rollNumber}`
    }
    if (!parentName) {
      parentName = `${studentName} Guardian`
    }

    // Clean roll for email generation
    const cleanRollForEmail = rollNumber.toLowerCase().replace(/[^a-z0-9.-]/g, '')

    // If parent email is missing, auto-generate [student_rollnumber]@[school_name].eduflow.local
    if (!parentEmail || !parentEmail.includes('@')) {
      parentEmail = `${cleanRollForEmail}@${schoolSlug}.eduflow.local`
    }

    // Auto-generate temporary password
    const cleanRollAlphaNum = rollNumber.replace(/[^a-zA-Z0-9]/g, '') || String(i + 100)
    const temporaryPassword = `EF#${cleanRollAlphaNum}!${Math.floor(100 + Math.random() * 900)}`

    // 5. Use Supabase Admin API to create parent account
    let parentUserId: string | null = null
    try {
      const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email: parentEmail,
        password: temporaryPassword,
        phone: parentPhone || undefined,
        email_confirm: true,
        phone_confirm: Boolean(parentPhone),
        user_metadata: {
          role: 'parent',
          full_name: parentName,
          student_roll: rollNumber,
          phone: parentPhone,
        },
      })

      if (!authError && authUser?.user) {
        parentUserId = authUser.user.id
      } else if (authError?.message?.toLowerCase().includes('already') || authError?.status === 422) {
        // Parent already registered in auth, update metadata & password
        const { data: userList } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 })
        const existingUser = userList?.users?.find((u) => u.email?.toLowerCase() === parentEmail)
        if (existingUser) {
          parentUserId = existingUser.id
          await adminClient.auth.admin.updateUserById(existingUser.id, {
            password: temporaryPassword,
            user_metadata: {
              role: 'parent',
              full_name: parentName,
              student_roll: rollNumber,
              phone: parentPhone,
            },
          })
        }
      }
    } catch (authErr) {
      console.warn(`Auth creation notice for student ${rollNumber}:`, authErr)
    }

    // 6. Explicitly include school_id in Drizzle ORM insert statement
    try {
      await db.insert(schema.students).values({
        schoolId: schoolId, // explicitly included!
        fullName: studentName,
        rollNumber,
        grade,
        section,
        guardianName: parentName,
        guardianPhone: parentPhone || null,
        guardianEmail: parentEmail,
        parentId: parentUserId || undefined,
        monthlyFee: String(monthlyFee),
        status: 'active',
      })
    } catch (drizzleErr) {
      // Drizzle TCP fallback to Supabase PostgREST
      console.warn('Drizzle bulk insert failed, falling back to Supabase client:', drizzleErr)
      await adminClient.from('students').insert([
        {
          school_id: schoolId, // explicitly included!
          full_name: studentName,
          father_name: parentName,
          roll_number: rollNumber,
          class_name: grade,
          section,
          guardian_name: parentName,
          guardian_phone: parentPhone || null,
          guardian_email: parentEmail,
          parent_id: parentUserId || null,
          monthly_fee: monthlyFee,
          status: 'active',
        },
      ])
    }

    // 7. Upsert parent profile
    if (parentUserId) {
      try {
        await adminClient.from('profiles').upsert([
          {
            id: parentUserId,
            email: parentEmail,
            full_name: parentName,
            role: 'parent',
            school_id: schoolId,
            phone_number: parentPhone || null,
            updated_at: new Date().toISOString(),
          },
        ])
      } catch {}
    }

    credentials.push({
      roll_number: rollNumber,
      student_name: studentName,
      grade,
      parent_name: parentName,
      parent_phone: parentPhone || '—',
      parent_email: parentEmail,
      temporary_password: temporaryPassword,
      // Legacy aliases
      rollNumber,
      studentName,
      parentPhone: parentPhone || '—',
      parentEmail,
      temporaryPassword,
    })
  }

    return {
      success: true,
      imported: credentials.length,
      credentials,
    }
  } catch (err: any) {
    console.error('bulkUploadStudentsAction error:', err)
    return {
      success: false,
      imported: 0,
      credentials: [],
      error: err?.message || 'An error occurred during bulk student import.',
    }
  }
}
