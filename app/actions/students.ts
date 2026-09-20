'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { db, schema } from '@/lib/db'
import { normalizeRole } from '@/lib/config'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
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

export type BulkStudentInput =
  | {
      rollNumber?: string
      studentName: string
      parentPhone?: string
      parentEmail?: string
      grade?: string
      section?: string
      monthlyFee?: number
    }
  | [string, string, string, string] // [Roll Number, Student Name, Parent Phone, Parent Email]

export interface GeneratedParentCredential {
  rollNumber: string
  studentName: string
  parentPhone: string
  parentEmail: string
  temporaryPassword: string
}

export async function bulkUploadStudentsAction(
  rows: BulkStudentInput[]
): Promise<{
  success: boolean
  imported: number
  credentials: GeneratedParentCredential[]
}> {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: true, imported: 0, credentials: [] }
  }

  // 1. Authenticate calling administrator
  const supabase = await createServerSupabase()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Authentication required to bulk import student records.')
  }

  // 2. Authorize admin role
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', currentUser.id)
    .maybeSingle()

  const callerRole = normalizeRole(callerProfile?.role || '')
  if (!['school_admin', 'super_admin'].includes(callerRole)) {
    throw new Error('Forbidden: Only school administrators can import students.')
  }

  let schoolId = callerProfile?.school_id || null
  const adminClient = getAdminClient()

  // 3. Query school information for canonical domain generation
  let schoolSlug = 'school'
  if (schoolId) {
    try {
      const { data: school } = await adminClient
        .from('schools')
        .select('name, slug')
        .eq('id', schoolId)
        .maybeSingle()

      if (school?.slug) {
        schoolSlug = school.slug.toLowerCase().replace(/[^a-z0-9]/g, '')
      } else if (school?.name) {
        schoolSlug = school.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      }
    } catch {}
  } else {
    try {
      const { data: firstSchool } = await adminClient
        .from('schools')
        .select('id, name, slug')
        .limit(1)
        .maybeSingle()
      if (firstSchool) {
        schoolId = firstSchool.id
        schoolSlug = (firstSchool.slug || firstSchool.name || 'school').toLowerCase().replace(/[^a-z0-9]/g, '')
      }
    } catch {}
  }

  if (!schoolSlug) schoolSlug = 'school'

  // 4. Process each student row
  const credentials: GeneratedParentCredential[] = []

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]

    let rollNumber = ''
    let studentName = ''
    let parentPhone = ''
    let parentEmail = ''
    let grade = 'Class 5'
    let section = 'A'
    let monthlyFee = 15000

    if (Array.isArray(raw)) {
      rollNumber = String(raw[0] || '').trim()
      studentName = String(raw[1] || '').trim()
      parentPhone = String(raw[2] || '').trim()
      parentEmail = String(raw[3] || '').trim().toLowerCase()
    } else {
      rollNumber = String(raw.rollNumber || '').trim()
      studentName = String(raw.studentName || '').trim()
      parentPhone = String(raw.parentPhone || '').trim()
      parentEmail = String(raw.parentEmail || '').trim().toLowerCase()
      if (raw.grade) grade = String(raw.grade).trim()
      if (raw.section) section = String(raw.section).trim()
      if (raw.monthlyFee) monthlyFee = Number(raw.monthlyFee) || 15000
    }

    if (!rollNumber) {
      rollNumber = `2026-${String(i + 1).padStart(3, '0')}`
    }
    if (!studentName) {
      studentName = `Student ${rollNumber}`
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
          full_name: `${studentName} Guardian`,
          student_roll: rollNumber,
          phone: parentPhone,
        },
      })

      if (!authError && authUser?.user) {
        parentUserId = authUser.user.id
      } else if (authError?.message?.toLowerCase().includes('already') || authError?.status === 422) {
        // Parent already registered in auth, fetch ID
        const { data: userList } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 })
        const existingUser = userList?.users?.find((u) => u.email?.toLowerCase() === parentEmail)
        if (existingUser) {
          parentUserId = existingUser.id
          await adminClient.auth.admin.updateUserById(existingUser.id, {
            password: temporaryPassword,
            user_metadata: {
              role: 'parent',
              full_name: `${studentName} Guardian`,
              student_roll: rollNumber,
              phone: parentPhone,
            },
          })
        }
      }
    } catch (authErr) {
      console.warn(`Auth creation notice for student ${rollNumber}:`, authErr)
    }

    // 6. Insert relational student data into database via Drizzle ORM
    let studentSaved = false
    try {
      await db.insert(schema.students).values({
        schoolId: schoolId || undefined,
        fullName: studentName,
        rollNumber,
        grade,
        section,
        guardianName: `${studentName} Guardian`,
        guardianPhone: parentPhone || null,
        guardianEmail: parentEmail,
        parentId: parentUserId || undefined,
        monthlyFee: String(monthlyFee),
        status: 'active',
      })
      studentSaved = true
    } catch (drizzleErr) {
      // Drizzle TCP fallback to Supabase PostgREST
      console.warn('Drizzle insert failed, falling back to Supabase client:', drizzleErr)
      const { error: sbErr } = await adminClient.from('students').insert([
        {
          full_name: studentName,
          roll_number: rollNumber,
          class_name: grade,
          section,
          guardian_name: `${studentName} Guardian`,
          guardian_phone: parentPhone || null,
          guardian_email: parentEmail,
          parent_id: parentUserId || null,
          monthly_fee: monthlyFee,
          status: 'active',
          ...(schoolId ? { school_id: schoolId } : {}),
        },
      ])
      if (!sbErr) studentSaved = true
    }

    // 7. Upsert parent profile
    if (parentUserId) {
      try {
        await adminClient.from('profiles').upsert([
          {
            id: parentUserId,
            email: parentEmail,
            full_name: `${studentName} Guardian`,
            role: 'parent',
            school_id: schoolId,
            phone_number: parentPhone || null,
            updated_at: new Date().toISOString(),
          },
        ])
      } catch {}
    }

    credentials.push({
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
}
