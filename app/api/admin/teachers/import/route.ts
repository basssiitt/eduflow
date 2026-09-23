import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { isSuperAdminEmail } from '@/lib/config'
import { authorizeAdminCaller } from '@/lib/auth/authorizeAdmin'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const authResult = await authorizeAdminCaller(user)
  if (!authResult.isAuthorized) {
    return NextResponse.json({ error: 'Forbidden: Only school administrators can onboard teachers.' }, { status: 403 })
  }

  const isSuperAdmin =
    isSuperAdminEmail((user.email || '').toLowerCase().trim()) ||
    authResult.callerProfile?.role === 'super_admin'

  const schoolId = authResult.schoolId
  if (!isSuperAdmin && !schoolId) {
    return NextResponse.json({ error: 'No school is attached to this account. Please complete school onboarding.' }, { status: 400 })
  }

  const contentLength = Number(request.headers.get('content-length') || '0')
  if (contentLength > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Payload too large (max 5MB)' }, { status: 413 })
  }

  const body = await request.json().catch(() => null)
  const rows = Array.isArray(body?.rows) ? body.rows : []
  if (!rows.length || rows.length > 500) return NextResponse.json({ error: 'Upload between 1 and 500 rows.' }, { status: 400 })

  const normalized: Array<{ name: string; email: string; phone: string | null; subject: string | null; schoolId: string | null }> = rows.map((row: Record<string, unknown>) => ({
    name: String(row.name ?? row.full_name ?? '').trim(),
    email: String(row.email ?? '').trim().toLowerCase(),
    phone: String(row.phone ?? '').trim() || null,
    subject: String(row.subject ?? '').trim() || null,
    schoolId: isSuperAdmin && row.school_id
      ? String(row.school_id).trim()
      : (schoolId || null),
  }))
  const invalid = normalized.findIndex((row) => !row.name || !emailPattern.test(row.email))
  if (invalid >= 0) return NextResponse.json({ error: `Row ${invalid + 1} needs a valid name and email.` }, { status: 400 })

  const validatedRows: Array<{ name: string; email: string; phone: string | null; subject: string | null; schoolId: string }> = []
  for (const row of normalized) {
    if (!row.schoolId) {
      return NextResponse.json({ error: 'No school is attached to this account or specified for all rows.' }, { status: 400 })
    }
    validatedRows.push({
      ...row,
      schoolId: row.schoolId,
    })
  }

  const existing = await db.select({ email: schema.teachers.email }).from(schema.teachers).where(eq(schema.teachers.schoolId, validatedRows[0].schoolId))
  const existingEmails = new Set(existing.map((row: { email: string | null }) => row.email?.toLowerCase()).filter(Boolean))
  const unique = validatedRows.filter((row: (typeof validatedRows)[number], index: number, all: (typeof validatedRows)) => all.findIndex((item: (typeof validatedRows)[number]) => item.email === row.email) === index)
  const toInsert = unique.filter((row: (typeof validatedRows)[number]) => !existingEmails.has(row.email))
  if (toInsert.length) {
    await db.insert(schema.teachers).values(toInsert.map((row, index) => ({ fullName: row.name, employeeCode: `IMP-${Date.now()}-${index + 1}`, email: row.email, phone: row.phone, specialization: row.subject, schoolId: row.schoolId })))
  }
  return NextResponse.json({ imported: toInsert.length, skipped: validatedRows.length - toInsert.length })
}
