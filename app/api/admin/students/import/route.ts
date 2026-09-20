import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db, schema } from '@/lib/db'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).maybeSingle()
  if (!profile || !['school_admin', 'admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!profile.school_id) return NextResponse.json({ error: 'No school is attached to this account.' }, { status: 400 })

  const body = await request.json().catch(() => null)
  const rows = Array.isArray(body?.rows) ? body.rows : []
  if (!rows.length || rows.length > 500) return NextResponse.json({ error: 'Upload between 1 and 500 rows.' }, { status: 400 })

  const values = rows.map((row: Record<string, unknown>, index: number) => ({
    schoolId: profile.school_id,
    fullName: String(row.full_name ?? '').trim(),
    rollNumber: String(row.roll_number ?? `IMP-${Date.now()}-${index + 1}`).trim(),
    grade: String(row.grade ?? 'Unassigned').trim(),
    section: String(row.section ?? 'A').trim(),
    guardianName: String(row.guardian_name ?? '').trim() || null,
    guardianPhone: String(row.guardian_phone ?? '').trim() || null,
    monthlyFee: String(row.monthly_fee ?? '0').trim() || '0',
  }))
  const invalid = values.findIndex((row: (typeof values)[number]) => !row.fullName || !row.rollNumber || !row.grade || !row.section)
  if (invalid >= 0) return NextResponse.json({ error: `Row ${invalid + 1} is missing required student fields.` }, { status: 400 })

  const inserted = await db.insert(schema.students).values(values).returning({ id: schema.students.id, rollNumber: schema.students.rollNumber })
  return NextResponse.json({ imported: inserted.length, skipped: 0, generatedParentCredentials: [] })
}

export const dynamic = 'force-dynamic'
