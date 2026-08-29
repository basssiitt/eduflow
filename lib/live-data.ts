import { supabaseClient } from '@/lib/supabaseClient'

async function requireUser() { if (!supabaseClient) return { user: null, error: new Error('Supabase is not configured') }; const { data, error } = await supabaseClient.auth.getUser(); return { user: data.user, error: error ?? (data.user ? null : new Error('Authentication required')) } }

export async function fetchStudents() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const auth = await requireUser(); if (auth.error) return { data: null, error: auth.error }
  return supabaseClient.from('students').select('id,name,father_name,roll_no,class,section').order('name')
}

export async function saveAttendance(rows: Array<{ student_id: string | number; status: string; note?: string }>) {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  return supabaseClient.from('attendance').insert(rows)
}

export async function uploadVoiceDiary(file: Blob, studentId: string | number, diary: string) {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const path = `${studentId}/${Date.now()}.webm`
  const uploaded = await supabaseClient.storage.from('voice-diaries').upload(path, file, { contentType: file.type || 'audio/webm' })
  if (uploaded.error) return uploaded
  const { data: publicFile } = supabaseClient.storage.from('voice-diaries').getPublicUrl(path)
  const saved = await supabaseClient.from('diaries').insert({ student_id: studentId, note: diary, audio_url: publicFile.publicUrl })
  return saved.error ? saved : { data: { url: publicFile.publicUrl }, error: null }
}

export async function fetchAdminStats() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const auth = await requireUser(); if (auth.error) return { data: null, error: auth.error }
  const [students, attendance, invoices, expenses] = await Promise.all([supabaseClient.from('students').select('id', { count: 'exact', head: true }), supabaseClient.from('attendance').select('status'), supabaseClient.from('fee_invoices').select('amount,status'), supabaseClient.from('expenses').select('amount')])
  return { data: { students: students.count ?? 0, attendance: attendance.data ?? [], invoices: invoices.data ?? [], expenses: expenses.data ?? [] }, error: students.error || attendance.error || invoices.error || expenses.error }
}

export async function createExpense(payload: Record<string, unknown>) { const auth = await requireUser(); if (auth.error || !supabaseClient) return { data: null, error: auth.error ?? new Error('Supabase is not configured') }; return supabaseClient.from('expenses').insert(payload).select().single() }
export async function createInvoice(payload: Record<string, unknown>) { const auth = await requireUser(); if (auth.error || !supabaseClient) return { data: null, error: auth.error ?? new Error('Supabase is not configured') }; return supabaseClient.from('fee_invoices').insert(payload).select().single() }

export async function fetchCurrentParentData() { if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }; const auth = await requireUser(); if (auth.error) return { data: null, error: auth.error }; const studentId = auth.user?.app_metadata?.student_id ?? auth.user?.user_metadata?.student_id; if (!studentId) return { data: null, error: new Error('No student is assigned to this account') }; return fetchParentData(studentId) }

export async function fetchParentData(studentId: string | number) {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const [attendance, fees, diaries] = await Promise.all([
    supabaseClient.from('attendance').select('date,status').eq('student_id', studentId).order('date', { ascending: false }).limit(30),
    supabaseClient.from('fee_invoices').select('id,amount,status,due_date').eq('student_id', studentId).order('due_date', { ascending: false }).limit(12),
    supabaseClient.from('diaries').select('note,audio_url,created_at').eq('student_id', studentId).order('created_at', { ascending: false }).limit(1),
  ])
  return { data: { attendance: attendance.data ?? [], fees: fees.data ?? [], diary: diaries.data?.[0] ?? null }, error: attendance.error || fees.error || diaries.error }
}
