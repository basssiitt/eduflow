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
    return { data: null, error: new Error('No student is linked to this parent account') }
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

export async function fetchCurrentStudentData() {
  if (!supabaseClient) return { data: null, error: new Error('Supabase is not configured') }
  const auth = await requireUser()
  if (auth.error) return { data: null, error: auth.error }

  let studentId = auth.user?.app_metadata?.student_id ?? auth.user?.user_metadata?.student_id

  if (!studentId) {
    const { data: student } = await supabaseClient
      .from('students')
      .select('id, name, roll_no, class, section')
      .or(`id.eq.${auth.user?.id},user_id.eq.${auth.user?.id}`)
      .limit(1)
      .maybeSingle()

    if (student?.id) {
      studentId = student.id
    }
  }

  if (!studentId) {
    const { data: anyStudent } = await supabaseClient
      .from('students')
      .select('id, name, roll_no, class, section')
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
      .select('id, name, roll_no, class, section, father_name')
      .eq('id', studentId)
      .maybeSingle(),
    supabaseClient
      .from('attendance')
      .select('date, status, note')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(30),
    supabaseClient
      .from('diaries')
      .select('note, audio_url, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    data: {
      student: studentInfo.data ?? null,
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

export const INITIAL_DEMO_TEACHERS: TeacherRecord[] = [
  {
    id: 'tch-01',
    name: 'Prof. Tariq Mahmood',
    email: 'tariq.mahmood@eduflow.pk',
    phone: '+92 300 1234567',
    employee_code: 'TCH-2026-001',
    qualification: 'M.Phil Mathematics (QAU)',
    department: 'Science & Math',
    subject: 'Mathematics & Calculus',
    classes: ['Class 9-A', 'Class 10-A', 'FSc-I'],
    salary: 85000,
    joining_date: '2023-08-15',
    status: 'Active',
  },
  {
    id: 'tch-02',
    name: 'Ms. Ayesha Siddiqa',
    email: 'ayesha.siddiqa@eduflow.pk',
    phone: '+92 321 9876543',
    employee_code: 'TCH-2026-002',
    qualification: 'M.A English Literature (PU)',
    department: 'Languages',
    subject: 'English Grammar & Lit',
    classes: ['Class 5-A', 'Class 6-B', 'Class 7-A'],
    salary: 72000,
    joining_date: '2024-01-10',
    status: 'Active',
  },
  {
    id: 'tch-03',
    name: 'Mr. Muhammad Usman',
    email: 'usman.phy@eduflow.pk',
    phone: '+92 333 4567890',
    employee_code: 'TCH-2026-003',
    qualification: 'M.Sc Physics (NUST)',
    department: 'Science & Math',
    subject: 'Physics & Lab Experiments',
    classes: ['Class 9-B', 'Class 10-B'],
    salary: 78000,
    joining_date: '2023-09-01',
    status: 'Active',
  },
  {
    id: 'tch-04',
    name: 'Ms. Zainab Fatima',
    email: 'zainab.chem@eduflow.pk',
    phone: '+92 312 3456789',
    employee_code: 'TCH-2026-004',
    qualification: 'M.Sc Organic Chemistry',
    department: 'Science & Math',
    subject: 'Chemistry & Biology',
    classes: ['Class 9-A', 'Class 10-A'],
    salary: 75000,
    joining_date: '2024-02-15',
    status: 'On Leave',
  },
  {
    id: 'tch-05',
    name: 'Hafiz Abdul Rehman',
    email: 'abdul.rehman@eduflow.pk',
    phone: '+92 301 2345678',
    employee_code: 'TCH-2026-005',
    qualification: 'M.A Islamic Studies / Wafaq-ul-Madaris',
    department: 'Humanities',
    subject: 'Islamiat & Nazra Quran',
    classes: ['Class 5 to Matric'],
    salary: 68000,
    joining_date: '2022-04-01',
    status: 'Active',
  },
  {
    id: 'tch-06',
    name: 'Ms. Hira Noor',
    email: 'hira.cs@eduflow.pk',
    phone: '+92 345 6789012',
    employee_code: 'TCH-2026-006',
    qualification: 'BS Computer Science (FAST-NUCES)',
    department: 'Science & Math',
    subject: 'Computer Science & ICT',
    classes: ['Class 6 to 10', 'ICS'],
    salary: 82000,
    joining_date: '2024-08-01',
    status: 'Active',
  },
  {
    id: 'tch-07',
    name: 'Coach Bilal Khalid',
    email: 'bilal.sports@eduflow.pk',
    phone: '+92 302 7890123',
    employee_code: 'TCH-2026-007',
    qualification: 'B.Sc Physical Education',
    department: 'Arts & Sports',
    subject: 'Physical Education & Drill',
    classes: ['Primary & Middle'],
    salary: 60000,
    joining_date: '2023-11-01',
    status: 'Active',
  },
]

export async function fetchTeachers(): Promise<{ data: TeacherRecord[]; error: Error | null }> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('teachers')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data && data.length > 0) {
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
      // Fall through to local fallback
    }
  }

  // Client-side / demo fallback with session persistence
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('eduflow_teachers')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { data: parsed, error: null }
        }
      } catch {}
    }
  }

  return { data: INITIAL_DEMO_TEACHERS, error: null }
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
      const list: TeacherRecord[] = current ? JSON.parse(current) : INITIAL_DEMO_TEACHERS
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
      const list: TeacherRecord[] = current ? JSON.parse(current) : INITIAL_DEMO_TEACHERS
      const updated = list.filter((t) => String(t.id) !== String(id))
      localStorage.setItem('eduflow_teachers', JSON.stringify(updated))
    } catch {}
  }

  return { success: true, error: null }
}
