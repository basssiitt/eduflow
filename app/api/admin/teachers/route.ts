import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'teachers.json')

export interface StoredTeacher {
  id: string
  name: string
  email: string
  phone: string
  employee_code: string
  qualification: string
  department: string
  subject: string
  classes: string[]
  salary: number
  joining_date: string
  status: 'Active' | 'On Leave' | 'Inactive'
  tempPassword?: string
  authUserId?: string
  created_at: string
}

function readTeachers(): StoredTeacher[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (err) {
    console.error('Failed to read teachers store:', err)
  }
  return []
}

function writeTeachers(teachers: StoredTeacher[]) {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(teachers, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write teachers store:', err)
  }
}

export async function GET() {
  const teachers = readTeachers()
  // Return teachers list without revealing plaintext passwords to public viewers
  const sanitized = teachers.map(({ tempPassword, ...rest }) => rest)
  return NextResponse.json({ success: true, data: sanitized })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      tempPassword,
      qualification,
      department,
      subject,
      classes,
      salary,
      joining_date,
      status,
    } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Teacher full name and email are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const passwordToUse = tempPassword && tempPassword.trim().length >= 6
      ? tempPassword.trim()
      : `Teach#${Math.floor(1000 + Math.random() * 9000)}!`

    // Requirement: Automatically generate employee code (admin does not give employee code)
    const existing = readTeachers()
    const year = new Date().getFullYear()
    const sequence = String(existing.length + 1).padStart(3, '0')
    const employee_code = `TCH-${year}-${sequence}`

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    const client = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : createClient(supabaseUrl, anonKey)

    let authUserId: string | undefined = undefined
    let authNotice = ''

    // 1. Register teacher in Supabase Auth with role: 'teacher'
    try {
      if (serviceRoleKey) {
        const { data: adminUser, error: adminErr } = await client.auth.admin.createUser({
          email: cleanEmail,
          password: passwordToUse,
          email_confirm: true,
          user_metadata: {
            full_name: name.trim(),
            role: 'teacher',
            employee_code,
            phone: phone ? phone.trim() : '',
            department: department || 'Academics',
            subject: subject || 'General',
          },
        })
        if (!adminErr && adminUser?.user) {
          authUserId = adminUser.user.id
        } else if (adminErr) {
          authNotice = adminErr.message
        }
      } else {
        const { data: signUpData, error: signUpErr } = await client.auth.signUp({
          email: cleanEmail,
          password: passwordToUse,
          options: {
            data: {
              full_name: name.trim(),
              role: 'teacher',
              employee_code,
              phone: phone ? phone.trim() : '',
              department: department || 'Academics',
              subject: subject || 'General',
            },
          },
        })
        if (!signUpErr && signUpData?.user) {
          authUserId = signUpData.user.id
        } else if (signUpErr) {
          authNotice = signUpErr.message
        }
      }
    } catch (err: any) {
      console.warn('Supabase Auth registration notice:', err?.message)
    }

    // 2. Provision profile in Supabase profiles table if user was created
    if (authUserId) {
      try {
        await client.from('profiles').upsert([
          {
            id: authUserId,
            full_name: name.trim(),
            role: 'teacher',
            phone_number: phone ? phone.trim() : null,
          },
        ])
      } catch (profileErr: any) {
        console.warn('Profiles table notice:', profileErr?.message)
      }
    }

    // 3. Insert into Supabase teachers table if table exists
    try {
      await client.from('teachers').insert([
        {
          name: name.trim(),
          email: cleanEmail,
          phone: phone ? phone.trim() : '',
          employee_code,
          qualification: qualification || 'Educator',
          department: department || 'Academics',
          subject: subject || 'General',
          classes: Array.isArray(classes) ? classes : [classes || 'Class 5'],
          salary: Number(salary) || 65000,
          joining_date: joining_date || new Date().toISOString().split('T')[0],
          status: status || 'Active',
        },
      ])
    } catch {
      // Table may not exist in schema cache; data persists in teachers store
    }

    // 4. Save into persistent teachers store
    const newTeacher: StoredTeacher = {
      id: authUserId || `tch-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      employee_code,
      qualification: qualification || 'Educator',
      department: department || 'Academics',
      subject: subject || 'General',
      classes: Array.isArray(classes) ? classes : [classes || 'Class 5'],
      salary: Number(salary) || 65000,
      joining_date: joining_date || new Date().toISOString().split('T')[0],
      status: status || 'Active',
      tempPassword: passwordToUse,
      authUserId,
      created_at: new Date().toISOString(),
    }

    // Filter out duplicates with same email
    const updated = [newTeacher, ...existing.filter((t) => t.email.toLowerCase() !== cleanEmail)]
    writeTeachers(updated)

    return NextResponse.json({
      success: true,
      teacher: {
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        phone: newTeacher.phone,
        employee_code: newTeacher.employee_code,
        qualification: newTeacher.qualification,
        department: newTeacher.department,
        subject: newTeacher.subject,
        classes: newTeacher.classes,
        salary: newTeacher.salary,
        joining_date: newTeacher.joining_date,
        status: newTeacher.status,
      },
      employee_code,
      tempPassword: passwordToUse,
      authNotice: authNotice || null,
      message: `Teacher ${name} registered successfully with employee code ${employee_code}.`,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to onboard teacher.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 })
    }

    const existing = readTeachers()
    const updated = existing.filter((t) => t.id !== id && String(t.id) !== String(id))
    writeTeachers(updated)

    return NextResponse.json({ success: true, message: 'Teacher removed successfully.' })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete teacher.' }, { status: 500 })
  }
}
