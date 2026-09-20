import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).maybeSingle()
  if (!profile || !['school_admin', 'admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const rows = Array.isArray(body?.rows) ? body.rows : []
  if (!rows.length || rows.length > 500) return NextResponse.json({ error: 'Upload between 1 and 500 rows.' }, { status: 400 })

  const normalized: Array<{ name: string; email: string; phone: string | null; subject: string | null; schoolId: string }> = rows.map((row: Record<string, unknown>) => ({
    name: String(row.name ?? row.full_name ?? '').trim(),
    email: String(row.email ?? '').trim().toLowerCase(),
    phone: String(row.phone ?? '').trim() || null,
    subject: String(row.subject ?? '').trim() || null,
    schoolId: String(row.school_id ?? profile.school_id ?? '').trim(),
  }))
  const invalid = normalized.findIndex((row) => !row.name || !emailPattern.test(row.email))
  if (invalid >= 0) return NextResponse.json({ error: `Row ${invalid + 1} needs a valid name and email.` }, { status: 400 })
  if (normalized.some((row) => !row.schoolId)) return NextResponse.json({ error: 'No school is attached to this account.' }, { status: 400 })

  const existing = await db.select({ email: schema.teachers.email }).from(schema.teachers).where(eq(schema.teachers.schoolId, normalized[0].schoolId))
  const existingEmails = new Set(existing.map((row: { email: string | null }) => row.email?.toLowerCase()).filter(Boolean))
  const unique = normalized.filter((row: (typeof normalized)[number], index: number, all: (typeof normalized)) => all.findIndex((item: (typeof normalized)[number]) => item.email === row.email) === index)
  const toInsert = unique.filter((row: (typeof normalized)[number]) => !existingEmails.has(row.email))
  if (toInsert.length) {
    await db.insert(schema.teachers).values(toInsert.map((row, index) => ({ fullName: row.name, employeeCode: `IMP-${Date.now()}-${index + 1}`, email: row.email, phone: row.phone, specialization: row.subject, schoolId: row.schoolId })))
  }
  return NextResponse.json({ imported: toInsert.length, skipped: normalized.length - toInsert.length })
}
