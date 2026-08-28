import { supabaseClient } from '@/lib/supabaseClient'

export async function fetchStudents() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
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

export async function fetchParentData(studentId: string | number) {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const [attendance, fees, diaries] = await Promise.all([
    supabaseClient.from('attendance').select('date,status').eq('student_id', studentId).order('date', { ascending: false }).limit(30),
    supabaseClient.from('fee_invoices').select('id,amount,status,due_date').eq('student_id', studentId).order('due_date', { ascending: false }).limit(12),
    supabaseClient.from('diaries').select('note,audio_url,created_at').eq('student_id', studentId).order('created_at', { ascending: false }).limit(1),
  ])
  return { data: { attendance: attendance.data ?? [], fees: fees.data ?? [], diary: diaries.data?.[0] ?? null }, error: attendance.error || fees.error || diaries.error }
}
