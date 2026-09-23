'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { normalizeRole, isSuperAdminEmail } from '@/lib/config'

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

import { authorizeAdminCaller } from '@/lib/auth/authorizeAdmin'

export interface AddTeacherInput {
  name: string
  email: string
  phone: string
  tempPassword?: string
  department?: string
  subject?: string
  qualification?: string
  classes?: string[]
  salary?: number
  joining_date?: string
}

export async function addTeacher(input: AddTeacherInput) {
  // 1. Authenticate calling administrator
  const supabase = await createServerSupabase()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Authentication required to onboard faculty members.')
  }

  // 2. Authorize admin role
  const { isAuthorized, callerProfile } = await authorizeAdminCaller(currentUser)
  if (!isAuthorized) {
    throw new Error('Forbidden: Only school administrators can onboard teachers.')
  }

  let schoolId = callerProfile?.school_id || null
  if (!schoolId && currentUser.email) {
    const { data: userSchool } = await supabase
      .from('schools')
      .select('id')
      .eq('admin_email', currentUser.email.toLowerCase())
      .limit(1)
      .maybeSingle()
    if (userSchool?.id) {
      schoolId = userSchool.id
    }
  }

  if (!schoolId) {
    throw new Error('No school attached to this administrator account. Please complete school onboarding first.')
  }

  // 3. Strict field extraction & validation - NEVER generate fake teacher.test emails
  const exactName = String(input.name ?? '').trim()
  const exactEmail = String(input.email ?? '').trim().toLowerCase()
  const exactPhone = String(input.phone ?? '').trim()
  const tempPassword = String(input.tempPassword ?? 'Teach#2026!').trim()

  if (!exactName) {
    throw new Error('Teacher full name is required.')
  }
  if (!exactEmail || !exactEmail.includes('@')) {
    throw new Error('A valid email address is required for teacher onboarding. Fallback test emails are not permitted.')
  }
  if (!exactPhone) {
    throw new Error('A valid phone number is required.')
  }
  if (tempPassword.length < 6) {
    throw new Error('Temporary password must be at least 6 characters long.')
  }

  const adminClient = getAdminClient()

  // 4. Register exact teacher in Supabase Auth via Admin API
  let createdUserId: string | null = null
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email: exactEmail,
    password: tempPassword,
    phone: exactPhone || undefined,
    email_confirm: true,
    phone_confirm: Boolean(exactPhone),
    user_metadata: {
      full_name: exactName,
      role: 'teacher',
      phone: exactPhone,
      department: input.department || 'Academics',
      subject: input.subject || 'General',
    },
  })

  if (authError) {
    // If user already exists in Auth, retrieve user ID
    if (authError.message?.toLowerCase().includes('already') || authError.status === 422) {
      const { data: existingList } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 })
      const found = existingList?.users?.find((u) => u.email?.toLowerCase() === exactEmail)
      if (found) {
        createdUserId = found.id
        // Update password to requested temp password
        await adminClient.auth.admin.updateUserById(found.id, {
          password: tempPassword,
          user_metadata: { role: 'teacher', full_name: exactName, phone: exactPhone },
        })
      } else {
        throw new Error(`Unable to register teacher auth account: ${authError.message}`)
      }
    } else {
      throw new Error(`Auth account registration failed: ${authError.message}`)
    }
  } else if (authUser?.user) {
    createdUserId = authUser.user.id
  }

  // 5. Generate employee code
  const currentYear = new Date().getFullYear()
  const employeeCode = `TCH-${currentYear}-${Date.now().toString().slice(-6)}`

  // 6. Insert into database via Drizzle ORM (with Supabase fallback)
  let insertedTeacher: any = null

  try {
    const [drizzleTeacher] = await db
      .insert(schema.teachers)
      .values({
        fullName: exactName,
        employeeCode,
        email: exactEmail,
        phone: exactPhone || null,
        department: input.department ? String(input.department).trim() : 'Academics',
        specialization: input.subject ? String(input.subject).trim() : 'General',
        monthlySalary: input.salary ? String(input.salary) : '65000.00',
        schoolId,
        status: 'active',
      })
      .returning()
    insertedTeacher = drizzleTeacher
  } catch (drizzleErr) {
    console.warn('Drizzle direct insert failed, executing via Supabase PostgREST:', drizzleErr)
    const { data: sbTeacher, error: sbErr } = await adminClient
      .from('teachers')
      .insert([
        {
          full_name: exactName,
          employee_code: employeeCode,
          email: exactEmail,
          phone: exactPhone || null,
          department: input.department ? String(input.department).trim() : 'Academics',
          specialization: input.subject ? String(input.subject).trim() : 'General',
          monthly_salary: input.salary || 65000,
          school_id: schoolId,
          status: 'active',
        },
      ])
      .select()
      .single()

    if (sbErr) {
      throw new Error(`Failed to save teacher to database: ${sbErr.message}`)
    }
    insertedTeacher = sbTeacher
  }

  // 7. Upsert user into profiles table as teacher
  if (createdUserId) {
    try {
      await adminClient.from('profiles').upsert([
        {
          id: createdUserId,
          email: exactEmail,
          full_name: exactName,
          role: 'teacher',
          school_id: schoolId,
          phone_number: exactPhone,
          updated_at: new Date().toISOString(),
        },
      ])
    } catch (profileErr) {
      console.warn('Profile upsert notice:', profileErr)
    }
  }

  return {
    success: true,
    teacher: {
      id: insertedTeacher?.id,
      name: exactName,
      email: exactEmail,
      phone: exactPhone,
      employee_code: employeeCode,
      department: input.department || 'Academics',
      subject: input.subject || 'General',
      status: 'Active',
    },
    employeeCode,
    temporaryPassword: tempPassword,
  }
}
