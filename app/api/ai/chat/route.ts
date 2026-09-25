import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aj } from '@/lib/arcjet'

export async function POST(request: NextRequest) {
  const decision = await aj.protect(request as any)
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Access denied by security shield.' }, { status: 403 })
  }

  let authenticatedUser = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    authenticatedUser = user
  } catch {}

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 })
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

  const context = body.context

  if (!context || !context.name || context.name === 'No Child Selected') {
    return NextResponse.json({
      text: 'Assalam-o-Alaikum! Aap ke account se filhaal koi student record link nahi hai. Baraye meherbani school administration se rabta karein taake bachay ka admission profile activate ho sake.',
    })
  }

  const studentName = context.name || 'Student'
  const studentGrade = context.class || context.grade || 'Enrolled Class'
  const studentRoll = context.roll || '—'
  const studentAttendance = context.attendance || '0%'
  const studentFeeDue = context.feeDue || (context.feeAmount ? `PKR ${Number(context.feeAmount).toLocaleString()}` : 'PKR 0')
  const studentFeeDueDate = context.feeDueDate || context.dueDate || 'Current Session'
  const studentExamDate = context.examDate || 'Schedule announced soon'
  const studentMarks = context.marks || 'Term results pending'
  const studentRemarks = context.remarks || 'Regular classroom conduct.'

  const apiKey = process.env.GEMINI_API_KEY

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey })
      const systemPrompt = `You are the EduFlow AI Parent Companion for Pakistani schools.
You have authoritative, real student records:
- Student: ${studentName} (${studentGrade}, Roll #${studentRoll})
- Attendance: ${studentAttendance}
- Fees: ${studentFeeDue} (Due: ${studentFeeDueDate})
- Academic Marks: ${studentMarks}
- Upcoming Exams: ${studentExamDate}
- Teacher Note: ${studentRemarks}

Instructions:
- Answer the parent's question factually based strictly on the child's records.
- If a record is 0 or pending, state that factually without fabricating numbers or achievements.
- Reply in the language used by the parent (English, Urdu, or Roman Urdu).
- Keep responses warm, encouraging, concise, and structured.`

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\nParent Question: ${prompt}`,
      })

      return NextResponse.json({
        text: result.text ?? `Records verified for ${studentName}. Attendance: ${studentAttendance}, Fee Balance: ${studentFeeDue}.`,
      })
    } catch (err: unknown) {
      console.warn('Google GenAI generation note, using verified record fallback:', err)
    }
  }

  // Factual deterministic reply based exclusively on authentic student records
  const lower = prompt.toLowerCase()
  let text = ''
  if (lower.includes('attendance') || lower.includes('haziri') || lower.includes('present') || lower.includes('absent')) {
    text = `${studentName} ki overall attendance ${studentAttendance} hai.`
  } else if (lower.includes('fee') || lower.includes('fees') || lower.includes('challan') || lower.includes('dues') || lower.includes('paisa')) {
    text = `${studentName} ka current fee balance ${studentFeeDue} hai (${studentFeeDueDate} tak payable).`
  } else if (lower.includes('grade') || lower.includes('mark') || lower.includes('result') || lower.includes('score')) {
    text = `${studentName} ke academic term evaluation records: ${studentMarks}.`
  } else if (lower.includes('exam') || lower.includes('date sheet') || lower.includes('schedule') || lower.includes('paper')) {
    text = `${studentName} ke exams schedule: ${studentExamDate}.`
  } else {
    text = `Assalam-o-Alaikum! ${studentName} (${studentGrade}, Roll #${studentRoll}) ki attendance ${studentAttendance} hai. Current fee balance ${studentFeeDue} hai.`
  }

  return NextResponse.json({ text })
}
