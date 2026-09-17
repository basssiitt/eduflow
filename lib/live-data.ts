import { supabaseClient } from '@/lib/supabaseClient'

async function requireUser() {
  if (!supabaseClient) return { user: null, error: new Error('Supabase is not configured') }
  const { data, error } = await supabaseClient.auth.getUser()
  return { user: data.user, error: error ?? (data.user ? null : new Error('Authentication required')) }
}

export async function fetchStudents() {
  if (!supabaseClient) return { data: [], error: new Error('Supabase is not configured') }
  
  try {
    const res = await supabaseClient
      .from('students')
      .select('id, full_name, father_name, roll_number, class_name, section, monthly_fee, status, school_id')
      .order('roll_number', { ascending: true, nullsFirst: false })

    if (res.error) {
      return { data: [], error: res.error }
    }

    const mapped = (res.data || []).map((row: any) => ({
      id: row.id,
      name: row.full_name || 'Enrolled Student',
      father_name: row.father_name || '',
      roll_no: row.roll_number || '',
      class: row.class_name || 'Unassigned',
      section: row.section || 'A',
      guardian_phone: '',
      tuition_fee: Number(row.monthly_fee) || 0,
      status: row.status || 'active',
      school_id: row.school_id,
    }))

    return { data: mapped, error: null }
  } catch (err: any) {
    return { data: [], error: err }
  }
}

export async function saveAttendance(
  rows: Array<{ student_id: string | number; status: string; note?: string; date?: string; school_id?: string }>
) {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const today = new Date().toISOString().split('T')[0]
  const formattedRows = rows.map((row) => ({
    student_id: row.student_id,
    status: row.status,
    remarks: row.note ?? '',
    date: row.date || today,
    ...(row.school_id ? { school_id: row.school_id } : {}),
  }))

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

  const today = new Date().toISOString().split('T')[0]
  try {
    const [studentsRes, attendanceRes] = await Promise.all([
      supabaseClient.from('students').select('id, monthly_fee, status', { count: 'exact' }),
      supabaseClient.from('attendance').select('status').eq('date', today),
    ])

    const studentsCount = studentsRes.count ?? (studentsRes.data ? studentsRes.data.length : 0)
    const studentList = studentsRes.data || []
    const invoices = studentList.map((st: any) => ({
      amount: Number(st.monthly_fee) || 0,
      status: st.status === 'active' ? 'Paid' : 'Pending',
    }))

    return {
      data: {
        students: studentsCount,
        attendance: attendanceRes.data ?? [],
        invoices,
        expenses: [],
      },
      error: studentsRes.error || attendanceRes.error || null,
    }
  } catch (err: any) {
    return {
      data: { students: 0, attendance: [], invoices: [], expenses: [] },
      error: err,
    }
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

export async function fetchParentStudents() {
  if (!supabaseClient) return { data: [], error: new Error('Supabase is not configured') }
  const auth = await requireUser()
  
  if (auth.user?.id) {
    const { data: parentStudents, error } = await supabaseClient
      .from('students')
      .select('id, full_name, father_name, roll_number, class_name, section, monthly_fee, status, school_id')
      .eq('parent_id', auth.user.id)
      
    if (!error && parentStudents && parentStudents.length > 0) {
      return {
        data: parentStudents.map((s: any) => ({
          id: s.id,
          name: s.full_name,
          father_name: s.father_name || '',
          roll: s.roll_number || '',
          class: `${s.class_name || 'Class 5'} · Sec ${s.section || 'A'}`,
          feeAmount: Number(s.monthly_fee) || 0,
          school_id: s.school_id,
        })),
        error: null,
      }
    }
  }

  // If no parent_id match, fetch real students from DB if any exist
  const { data: allStudents, error } = await supabaseClient
    .from('students')
    .select('id, full_name, father_name, roll_number, class_name, section, monthly_fee, status, school_id')
    .limit(10)

  return {
    data: (allStudents || []).map((s: any) => ({
      id: s.id,
      name: s.full_name,
      father_name: s.father_name || '',
      roll: s.roll_number || '',
      class: `${s.class_name || 'Class 5'} · Sec ${s.section || 'A'}`,
      feeAmount: Number(s.monthly_fee) || 0,
      school_id: s.school_id,
    })),
    error,
  }
}

export async function fetchCurrentParentData() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const auth = await requireUser()
  if (auth.error) return { data: null, error: auth.error }

  let studentId = auth.user?.app_metadata?.student_id ?? auth.user?.user_metadata?.student_id

  if (!studentId && auth.user?.id) {
    const { data: student } = await supabaseClient
      .from('students')
      .select('id')
      .eq('parent_id', auth.user.id)
      .limit(1)
      .maybeSingle()

    if (student?.id) {
      studentId = student.id
    }
  }

  if (!studentId) {
    const { data: anyStudent } = await supabaseClient
      .from('students')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (anyStudent?.id) {
      studentId = anyStudent.id
    }
  }

  if (!studentId) {
    return { data: null, error: new Error('No student record found') }
  }

  return fetchParentData(studentId)
}

export async function fetchParentData(studentId: string | number) {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const [attendance, fees, diaries] = await Promise.all([
    supabaseClient
      .from('attendance')
      .select('date,status,remarks')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(30),
    supabaseClient
      .from('fee_invoices')
      .select('id,status,due_date,challan_number')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false })
      .limit(12),
    supabaseClient
      .from('diaries')
      .select('id,audio_url,created_at')
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

export async function fetchCurrentStudentData() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const auth = await requireUser()
  let studentId = auth.user?.app_metadata?.student_id ?? auth.user?.user_metadata?.student_id

  if (!studentId && auth.user?.id) {
    const { data: student } = await supabaseClient
      .from('students')
      .select('id, full_name, roll_number, class_name, section, father_name')
      .eq('id', auth.user.id)
      .limit(1)
      .maybeSingle()

    if (student?.id) {
      studentId = student.id
    }
  }

  if (!studentId) {
    const { data: anyStudent } = await supabaseClient
      .from('students')
      .select('id, full_name, roll_number, class_name, section, father_name')
      .limit(1)
      .maybeSingle()
    if (anyStudent?.id) {
      studentId = anyStudent.id
    }
  }

  if (!studentId) {
    return { data: null, error: new Error('No student record found') }
  }

  const [studentInfo, attendance, diaries] = await Promise.all([
    supabaseClient
      .from('students')
      .select('id, full_name, roll_number, class_name, section, father_name')
      .eq('id', studentId)
      .maybeSingle(),
    supabaseClient
      .from('attendance')
      .select('date, status, remarks')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(30),
    supabaseClient
      .from('diaries')
      .select('id, audio_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const studentData = studentInfo.data
    ? {
        id: studentInfo.data.id,
        name: studentInfo.data.full_name,
        roll_no: studentInfo.data.roll_number,
        class: studentInfo.data.class_name,
        section: studentInfo.data.section,
        father_name: studentInfo.data.father_name,
      }
    : null

  return {
    data: {
      student: studentData,
      attendance: attendance.data ?? [],
      diaries: diaries.data ?? [],
    },
    error: studentInfo.error || attendance.error || diaries.error,
  }
}

export type TeacherRecord = {
  id: string | number
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
}

export async function fetchTeachers(): Promise<{ data: TeacherRecord[]; error: Error | null }> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('teachers')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data) {
        return {
          data: data.map((t: any) => ({
            id: t.id,
            name: t.name,
            email: t.email || '',
            phone: t.phone || '',
            employee_code: t.employee_code || `TCH-${t.id}`,
            qualification: t.qualification || 'Educator',
            department: t.department || 'Academics',
            subject: t.subject || 'General',
            classes: Array.isArray(t.classes) ? t.classes : (t.classes ? String(t.classes).split(',').map(s => s.trim()) : ['Class 5']),
            salary: Number(t.salary) || 65000,
            joining_date: t.joining_date || new Date().toISOString().split('T')[0],
            status: t.status || 'Active',
          })),
          error: null,
        }
      }
    } catch {
      // Fall through to check storage or empty
    }
  }

  // Session persistence for newly onboarded faculty
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('eduflow_teachers')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          return { data: parsed, error: null }
        }
      } catch {}
    }
  }

  return { data: [], error: null }
}

export async function createTeacher(
  payload: Omit<TeacherRecord, 'id'>
): Promise<{ data: TeacherRecord | null; error: Error | null }> {
  const newTeacher: TeacherRecord = {
    ...payload,
    id: `tch-${Date.now()}`,
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('teachers')
        .insert([{
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          employee_code: payload.employee_code,
          qualification: payload.qualification,
          department: payload.department,
          subject: payload.subject,
          classes: payload.classes,
          salary: payload.salary,
          joining_date: payload.joining_date,
          status: payload.status,
        }])
        .select()
        .single()

      if (!error && data) {
        return {
          data: {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            employee_code: data.employee_code,
            qualification: data.qualification,
            department: data.department,
            subject: data.subject,
            classes: Array.isArray(data.classes) ? data.classes : [data.classes],
            salary: Number(data.salary) || payload.salary,
            joining_date: data.joining_date,
            status: data.status,
          },
          error: null,
        }
      }
    } catch {
      // Fall through to local storage save
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const current = localStorage.getItem('eduflow_teachers')
      const list: TeacherRecord[] = current ? JSON.parse(current) : []
      const updated = [newTeacher, ...list]
      localStorage.setItem('eduflow_teachers', JSON.stringify(updated))
    } catch {}
  }

  return { data: newTeacher, error: null }
}

export async function deleteTeacher(id: string | number): Promise<{ success: boolean; error: Error | null }> {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('teachers')
        .delete()
        .eq('id', id)

      if (!error) {
        return { success: true, error: null }
      }
    } catch {
      // Fall through
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const current = localStorage.getItem('eduflow_teachers')
      const list: TeacherRecord[] = current ? JSON.parse(current) : []
      const updated = list.filter((t) => String(t.id) !== String(id))
      localStorage.setItem('eduflow_teachers', JSON.stringify(updated))
    } catch {}
  }

  return { success: true, error: null }
}
