import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 32 * 1024) {
    return NextResponse.json({ error: 'Payload too large. Max 32KB allowed.' }, { status: 413 })
  }

  const body = await request.json().catch(() => ({}))
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) return NextResponse.json({ error: 'A message is required.' }, { status: 400 })
  if (prompt.length > 2000) {
    return NextResponse.json({ error: 'Message exceeds maximum length of 2,000 characters.' }, { status: 400 })
  }
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ text: 'Main aap ke school records check karke update karunga. Gemini connection abhi preview mode mein available nahi hai.' })
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `You are EduFlow OS school assistant. Reply clearly in the user's language. Roman Urdu is allowed. Keep answers concise and helpful.\n\nUser: ${prompt}` })
    return NextResponse.json({ text: result.text ?? 'Main is waqt jawab nahi de saka.' })
  } catch {
    return NextResponse.json({ text: 'Service temporarily unavailable. Please try again shortly.' }, { status: 200 })
  }
}
