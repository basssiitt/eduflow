import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { db, schema } from '@/lib/db'
import { and, eq } from 'drizzle-orm'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Supabase admin configuration is missing')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).maybeSingle()
  if (!profile || !['school_admin', 'admin', 'super_admin'].includes(profile.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user, profile }
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const rows = await db.select().from(schema.teachers).where(eq(schema.teachers.schoolId, auth.profile.school_id))
  return NextResponse.json({ success: true, data: rows })
}

const BLOCKED_PROPS = new Set(['__proto__', 'constructor', 'prototype'])

function validatePrototypeKeys<T extends Record<string, unknown>>(obj: T): T {
  const clean = Object.create(null)
  if (obj && typeof obj === 'object') {
    for (const prop of Object.keys(obj)) {
      if (!BLOCKED_PROPS.has(prop)) {
        clean[prop] = obj[prop]
      }
    }
  }
  return clean
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const rawBody = (await request.json().catch(() => Object.create(null))) as Record<string, unknown>
  const body = validatePrototypeKeys(rawBody || {})
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const phone = String(body.phone || '').trim()
  const tempPassword = String(body.tempPassword || '').trim()
  const department = String(body.department || '').trim() || null
  const specialization = String(body.subject || '').trim() || null

  if (!name || !email || !tempPassword || tempPassword.length < 6) {
    return NextResponse.json({ error: 'Name, email, and a password of at least 6 characters are required.' }, { status: 400 })
  }
  if (!auth.profile.school_id) return NextResponse.json({ error: 'No school is attached to this account.' }, { status: 400 })

  const admin = getAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    phone: phone || undefined,
    email_confirm: true,
    phone_confirm: Boolean(phone),
    user_metadata: { full_name: name, role: 'teacher', phone },
  })
  if (error || !data.user) return NextResponse.json({ error: error?.message || 'Unable to create teacher account.' }, { status: 400 })

  const employeeCode = `TCH-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
  let teacher: any = null
  try {
    const teacherRecord = {
      fullName: name,
      employeeCode,
      email,
      phone: phone || null,
      department,
      specialization,
      schoolId: String(auth.profile.school_id),
    }
    const [inserted] = await db.insert(schema.teachers).values(teacherRecord).returning()
    teacher = inserted
  } catch (drizzleErr) {
    const sbRecord = {
      full_name: name,
      employee_code: employeeCode,
      email,
      phone: phone || null,
      department,
      specialization,
      school_id: String(auth.profile.school_id),
    }
    const { data: sbTeacher, error: sbErr } = await admin.from('teachers').insert([sbRecord]).select().single()
    if (sbErr) {
      return NextResponse.json({ error: sbErr.message }, { status: 500 })
    }
    teacher = sbTeacher
  }

  // Upsert profile
  try {
    await admin.from('profiles').upsert([{
      id: data.user.id,
      email,
      full_name: name,
      role: 'teacher',
      school_id: auth.profile.school_id,
      phone_number: phone || null,
      updated_at: new Date().toISOString(),
    }])
  } catch {}

  return NextResponse.json({ success: true, teacher, temporaryPassword: tempPassword })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Teacher id is required.' }, { status: 400 })

  if (auth.profile.role === 'super_admin') {
    await db.delete(schema.teachers).where(eq(schema.teachers.id, id))
  } else {
    if (!auth.profile.school_id) {
      return NextResponse.json({ error: 'No school associated with this administrator.' }, { status: 403 })
    }
    await db.delete(schema.teachers).where(
      and(
        eq(schema.teachers.id, id),
        eq(schema.teachers.schoolId, auth.profile.school_id)
      )
    )
  }

  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
