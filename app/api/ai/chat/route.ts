import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const demoRole = cookieStore.get('eduflow-demo-role')?.value
  let authenticatedUser = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    authenticatedUser = user
  } catch {}

  // Allow if real user OR demo role cookie is present
  if (!authenticatedUser && !demoRole) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 32 * 1024) {
    return NextResponse.json({ error: 'Payload too large. Max 32KB allowed.' }, { status: 413 })
  }

  const body = (await request.json().catch(() => ({}))) as { prompt?: string; context?: any }
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) return NextResponse.json({ error: 'A message is required.' }, { status: 400 })
  if (prompt.length > 2000) {
    return NextResponse.json({ error: 'Message exceeds maximum length of 2,000 characters.' }, { status: 400 })
  }

  const context = body.context ?? {
    name: 'Ali Khan',
    grade: 'Class 5-A',
    roll: '2026-001',
    attendance: '94%',
    feeDue: 'PKR 4,500',
    feeDueDate: '10-Oct-2026',
    examDate: 'Monday, 12-Oct-2026',
    marks: 'Mathematics: 88/100 (A), Science: 92/100 (A*), English: 81/100 (A). Overall: 88.3% (3rd Position in Class).',
    remarks: 'Consistent in analytical thinking. Recommended to revise Urdu grammar before exams.',
  }

  // Quota Protection: If unauthenticated demo role or GEMINI_API_KEY is not set, use high-fidelity simulation
  const apiKey = process.env.GEMINI_API_KEY
  if (!authenticatedUser || !apiKey) {
    const lower = prompt.toLowerCase()
    let text = ''
    if (lower.includes('attendance') || lower.includes('haziri') || lower.includes('present') || lower.includes('absent')) {
      text = `Ali Khan ki overall attendance ${context.attendance} hai. Aaj wo classroom mein Present mark hain aur unka attendance record regular hai.`
    } else if (lower.includes('fee') || lower.includes('fees') || lower.includes('challan') || lower.includes('dues') || lower.includes('paisa')) {
      text = `Ali Khan ka current session ka fee balance ${context.feeDue} hai jo ${context.feeDueDate} tak payable hai. Aap Parent Portal ke "Pay Online" button se 1Link ya EasyPaisa/JazzCash ke zariye direct pay kar sakte hain.`
    } else if (lower.includes('grade') || lower.includes('mark') || lower.includes('result') || lower.includes('math') || lower.includes('science') || lower.includes('report')) {
      text = `Ali Khan ne term evaluation mein 88.3% (Grade A*) score kiya hai aur class mein 3rd position hasil ki hai. Marks: ${context.marks}`
    } else if (lower.includes('exam') || lower.includes('date sheet') || lower.includes('schedule') || lower.includes('test') || lower.includes('paper')) {
      text = `Mid-Term Examinations ${context.examDate} se shuru ho rahe hain. Pehla paper Mathematics ka subah 08:30 AM Room 102 mein hoga. Date Sheet tab mein mukammal schedule available hai.`
    } else {
      text = `Assalam-o-Alaikum! Ali Khan (${context.grade}) ka academic record bohat acha hai. Unki attendance ${context.attendance} hai aur unho ne term exams mein 88.3% (Grade A*) score kiya hai. Unke Mid-term papers ${context.examDate} se start ho rahe hain. Agar koi mazeed sawal ho to zaroor batayein!`
    }
    return NextResponse.json({ text })
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const systemPrompt = `You are the EduFlow AI Parent Companion for Pakistani schools.
You have real, authoritative student records:
- Student: ${context.name} (${context.grade}, Roll #${context.roll})
- Attendance: ${context.attendance}
- Fees: ${context.feeDue} due on ${context.feeDueDate}
- Academic Marks: ${context.marks}
- Upcoming Exams: Mid-Terms commence ${context.examDate}
- Teacher Note: ${context.remarks}

Instructions:
- Answer the parent's query factually based on the child's real records.
- Reply in the language used by the parent (English, Urdu, or Roman Urdu).
- Keep answers warm, encouraging, concise, and structured.`

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\nParent Question: ${prompt}`,
    })
    return NextResponse.json({ text: result.text ?? 'Main aap ke sawal ka jawab talaash kar raha hoon. Baraye meherbani dobarah poochhein.' })
  } catch (_err: unknown) {
    return NextResponse.json({
      text: `Ali Khan (${context.grade}) ki attendance ${context.attendance} hai aur unke term exam marks 88.3% (Grade A*) hain. Upcoming Mid-Term exams ${context.examDate} se start honge.`,
    }, { status: 200 })
  }
}
