import { supabaseClient } from '@/lib/supabaseClient'

async function requireUser() {
  if (!supabaseClient) return { user: null, error: new Error('Supabase is not configured') }
  const { data, error } = await supabaseClient.auth.getUser()
  return { user: data.user, error: error ?? (data.user ? null : new Error('Authentication required')) }
}

export async function fetchStudents() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const auth = await requireUser()
  if (auth.error) return { data: null, error: auth.error }
  return supabaseClient
    .from('students')
    .select('id, name, father_name, roll_no, class, section, guardian_phone, tuition_fee')
    .order('roll_no', { ascending: true, nullsFirst: false })
}

export async function saveAttendance(
  rows: Array<{ student_id: string | number; status: string; note?: string; date?: string }>
) {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const today = new Date().toISOString().split('T')[0]
  const formattedRows = rows.map((row) => ({
    student_id: row.student_id,
    status: row.status,
    note: row.note ?? '',
    date: row.date || today,
  }))

  // Try upsert first for (student_id, date) uniqueness, fallback to insert
  const upsertRes = await supabaseClient
    .from('attendance')
    .upsert(formattedRows, { onConflict: 'student_id,date' })
  if (upsertRes.error) {
    return supabaseClient.from('attendance').insert(formattedRows)
  }
  return upsertRes
}

export async function uploadVoiceDiary(file: Blob, studentId: string | number, diary: string) {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const path = `${studentId}/${Date.now()}.webm`
  const uploaded = await supabaseClient.storage
    .from('voice-diaries')
    .upload(path, file, { contentType: file.type || 'audio/webm' })

  let audioUrl = ''
  if (!uploaded.error) {
    const { data: publicFile } = supabaseClient.storage.from('voice-diaries').getPublicUrl(path)
    audioUrl = publicFile.publicUrl
  }

  const saved = await supabaseClient
    .from('diaries')
    .insert({ student_id: studentId, note: diary, audio_url: audioUrl })
  return saved.error ? saved : { data: { url: audioUrl }, error: null }
}

export async function fetchAdminStats() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const auth = await requireUser()
  if (auth.error) return { data: null, error: auth.error }

  const today = new Date().toISOString().split('T')[0]
  const [students, attendance, invoices, expenses] = await Promise.all([
    supabaseClient.from('students').select('id', { count: 'exact', head: true }),
    supabaseClient.from('attendance').select('status').eq('date', today),
    supabaseClient.from('fee_invoices').select('amount,status'),
    supabaseClient.from('expenses').select('amount'),
  ])

  return {
    data: {
      students: students.count ?? 0,
      attendance: attendance.data ?? [],
      invoices: invoices.data ?? [],
      expenses: expenses.data ?? [],
    },
    error: students.error || attendance.error || invoices.error || expenses.error,
  }
}

export async function fetchFeeInvoices() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const auth = await requireUser()
  if (auth.error) return { data: null, error: auth.error }

  return supabaseClient
    .from('fee_invoices')
    .select('id, student_id, amount, status, due_date, month, students(name, class, section, roll_no)')
    .order('due_date', { ascending: false })
}

export async function createExpense(payload: Record<string, unknown>) {
  const auth = await requireUser()
  if (auth.error || !supabaseClient) {
    return { data: null, error: auth.error ?? new Error('Supabase is not configured') }
  }
  const fullPayload = {
    date: new Date().toISOString().split('T')[0],
    ...payload,
  }
  return supabaseClient.from('expenses').insert(fullPayload).select().single()
}

export async function createInvoice(payload: Record<string, unknown>) {
  const auth = await requireUser()
  if (auth.error || !supabaseClient) {
    return { data: null, error: auth.error ?? new Error('Supabase is not configured') }
  }
  return supabaseClient.from('fee_invoices').insert(payload).select().single()
}

export async function fetchCurrentParentData() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const auth = await requireUser()
  if (auth.error) return { data: null, error: auth.error }

  let studentId = auth.user?.app_metadata?.student_id ?? auth.user?.user_metadata?.student_id

  if (!studentId) {
    // Attempt lookup by parent_id or guardian_email
    const { data: student } = await supabaseClient
      .from('students')
      .select('id')
      .or(`parent_id.eq.${auth.user?.id},guardian_email.eq.${auth.user?.email}`)
      .limit(1)
      .single()

    if (student?.id) {
      studentId = student.id
    }
  }

  if (!studentId) {
    // If no specific student assigned, fetch default student for the demo / active parent
    const { data: fallbackStudent } = await supabaseClient.from('students').select('id').limit(1).single()
    if (fallbackStudent?.id) {
      studentId = fallbackStudent.id
    } else {
      return { data: null, error: new Error('No student is assigned to this account') }
    }
  }

  return fetchParentData(studentId)
}

export async function fetchParentData(studentId: string | number) {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const [attendance, fees, diaries] = await Promise.all([
    supabaseClient
      .from('attendance')
      .select('date,status')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(30),
    supabaseClient
      .from('fee_invoices')
      .select('id,amount,status,due_date')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false })
      .limit(12),
    supabaseClient
      .from('diaries')
      .select('note,audio_url,created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1),
  ])
  return {
    data: {
      attendance: attendance.data ?? [],
      fees: fees.data ?? [],
      diary: diaries.data?.[0] ?? null,
    },
    error: attendance.error || fees.error || diaries.error,
  }
}

