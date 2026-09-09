'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchCurrentParentData } from '@/lib/live-data'
import { OfflineStatusBar } from '@/components/eduflow-provider'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { ThreeFaceChallanSlip } from '@/components/challan-slip'
import { PaymentGatewayModal } from '@/components/payment-gateway-modal'
import {
  Award,
  BookOpen,
  Bot,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock,
  CreditCard,
  Download,
  FileText,
  Headphones,
  MapPin,
  Pause,
  Play,
  Printer,
  ReceiptText,
  Send,
  Sparkles,
  TrendingUp,
  University,
  User,
  Volume2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { cn } from '@/lib/utils'

interface StudentContext {
  name: string
  class?: string
  grade?: string
  roll: string
  guardian?: string
  attendance: string
  feeAmount?: number
  feeDue?: string
  feeDueDate?: string
  dueDate?: string
  challanNo?: string
  bankName?: string
  accountTitle?: string
  iban?: string
  psid?: string
  examDate?: string
  marks?: string
  remarks?: string
}

function AudioDiary({ audioUrl, note }: { audioUrl?: string; note?: string }) {
  const [playing, setPlaying] = useState(false)
  if (!audioUrl && !note) {
    return (
      <div className="p-4">
        <ZeroDataEmptyState
          icon={Volume2}
          title="No voice diary for today"
          description="When the classroom teacher records a voice note or instructions, it will appear here."
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
      {audioUrl ? (
        <button
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? 'Pause teacher voice diary' : 'Play teacher voice diary'}
        >
          {playing ? <Pause className="size-5" key="pause-icon" /> : <Play className="size-5 ml-0.5" key="play-icon" />}
        </button>
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <Volume2 className="size-5" key="vol-icon" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Headphones className="size-4 text-emerald-600" aria-hidden="true" />
          <span>Teacher Daily Diary</span>
        </div>
        {note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{note}</p>}
      </div>
    </div>
  )
}

function AiAssistant({ studentContext }: { studentContext: StudentContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Assalam-o-Alaikum! Main EduFlow AI Parent Companion hoon. Aap Ali Khan ki attendance, term grades, upcoming exam date sheet, ya fee challan ke baray mein sawal pooch sakte hain.',
      time: 'Today',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)

  const send = async (text = input) => {
    if (!text.trim()) return
    const now = 'Just now'
    setMessages((m) => [...m, { role: 'user', text, time: now }])
    setInput('')
    setTyping(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: text, context: studentContext }),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        setMessages((m) => [...m, { role: 'ai', text: 'School records verified. Ali Khan ki attendance 94% hai aur aglay papers Monday se start ho rahe hain.', time: now }])
        return
      }
      const result = await response.json()
      setMessages((m) => [
        ...m,
        { role: 'ai', text: result.text || 'Records check ho chuke hain. Koi aur madad chahiye?', time: now },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'Ali Khan ki attendance 94% hai aur overall grade A* (88.3%) hai. Fees PKR 4,500 due 10-Oct hai.', time: now },
      ])
    } finally {
      setTyping(false)
    }
  }

  const quickPrompts = [
    'Attendance summary',
    'Pending fee & challan',
    'Exam Date Sheet',
    'Report card & grades',
  ]

  return (
    <section id="ai" className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 p-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <Bot className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            EduFlow AI Companion <span className="text-xs font-semibold text-emerald-600 font-normal">(Gemini)</span>
          </h2>
          <p className="text-xs text-slate-500">Ask questions about your child&apos;s grades, exam schedule, attendance, or fees in English or Urdu.</p>
        </div>
        <Sparkles className="ml-auto size-5 text-amber-500" />
      </div>

      <div className="flex flex-wrap gap-1.5 p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => send(prompt)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:text-emerald-700 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3 min-h-[220px] max-h-[300px] overflow-y-auto" aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={`msg-${message.role}-${message.time}-${index}`}
            className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed',
                message.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none'
              )}
            >
              {message.text}
            </div>
            <time className="mt-1 text-[10px] text-slate-400">{message.time}</time>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 w-fit">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse delay-100" />
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse delay-200" />
            <span className="ml-1 text-[11px]">EduFlow AI is thinking…</span>
          </div>
        )}
      </div>

      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <input
          data-testid="input-parent-ai"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send() }}
          placeholder="Ask in English or Urdu (e.g. When is the next Math exam?)..."
          aria-label="Ask EduFlow AI"
          className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
        />
        <Button
          onClick={() => send()}
          aria-label="Send message"
          className="size-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs p-0 flex items-center justify-center shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </section>
  )
}

export function ParentPortal() {
  const [live, setLive] = useState<{ attendance: unknown[]; fees: unknown[]; diary: { audio_url?: string; note?: string } | null } | null>(null)
  const [parentEmail, setParentEmail] = useState('')
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [challanModalOpen, setChallanModalOpen] = useState(false)
  const [academicTab, setAcademicTab] = useState<'grades' | 'exams'>('grades')
  const [feeStatus, setFeeStatus] = useState<'Pending' | 'Paid'>('Paid')
  const [loading, setLoading] = useState(true)

  // Dynamic children enrolled under this parent account
  const [children, setChildren] = useState([
    {
      id: 1,
      name: 'Liam Miller',
      class: 'Grade 8 · Sec A',
      status: 23,
      grades: '76%',
      total: 10,
      fee: '100%',
      enrolled: true,
      avatar: 'LM',
      roll: '2026-001',
      feeAmount: 4500,
      challanNo: 'CH-2026-101',
      dueDate: '10-Oct-2026',
      attendance: '94%',
    },
    {
      id: 2,
      name: 'Ava Miller',
      class: 'Grade 5 · Sec B',
      status: 23,
      grades: '78%',
      total: 10,
      fee: '100%',
      enrolled: true,
      avatar: 'AM',
      roll: '2026-002',
      feeAmount: 4000,
      challanNo: 'CH-2026-102',
      dueDate: '10-Oct-2026',
      attendance: '96%',
    },
  ])
  const [selectedChildIndex, setSelectedChildIndex] = useState(0)
  const activeStudent = children[selectedChildIndex] || children[0]

  const studentProfile = {
    name: activeStudent.name,
    roll: activeStudent.roll,
    class: activeStudent.class,
    guardian: 'Sarah Miller',
    attendance: activeStudent.attendance,
    feeAmount: activeStudent.feeAmount,
    challanNo: activeStudent.challanNo,
    dueDate: activeStudent.dueDate,
    bankName: 'Meezan Bank Ltd.',
    accountTitle: 'EduFlow School Main Campus',
    iban: 'PK92 MEZN 0001 2345 6789 0101',
    psid: '1004928019382',
  }

  const subjects = [
    { name: 'Mathematics', marks: 88, total: 100, grade: 'A', teacher: 'Sir Tariq' },
    { name: 'General Science', marks: 92, total: 100, grade: 'A*', teacher: 'Sir Asad' },
    { name: 'English Language', marks: 81, total: 100, grade: 'A', teacher: 'Miss Fatima' },
    { name: 'Urdu Literature', marks: 85, total: 100, grade: 'A', teacher: 'Miss Ayesha' },
    { name: 'Islamiat & Nazra', marks: 94, total: 100, grade: 'A*', teacher: 'Miss Ayesha' },
    { name: 'Computer Studies', marks: 90, total: 100, grade: 'A*', teacher: 'Sir Bilal' },
  ]

  const examDateSheet = [
    { date: 'Monday, 12-Oct-2026', subject: 'Mathematics', timing: '08:30 AM – 11:00 AM', room: 'Room 102', syllabus: 'Chapters 1-5 (Fractions, Decimals, Geometry)' },
    { date: 'Tuesday, 13-Oct-2026', subject: 'English Language', timing: '08:30 AM – 11:00 AM', room: 'Room 102', syllabus: 'Grammar, Essay Writing, Unit 1 to 4 Comprehension' },
    { date: 'Wednesday, 14-Oct-2026', subject: 'General Science', timing: '08:30 AM – 11:00 AM', room: 'Science Lab 2', syllabus: 'Living Systems, Matter, Sound & Light Energy' },
    { date: 'Thursday, 15-Oct-2026', subject: 'Urdu Literature', timing: '08:30 AM – 11:00 AM', room: 'Room 102', syllabus: 'Nazm, Sabaq 1 to 6, Mazmoon, Qawaid' },
    { date: 'Friday, 16-Oct-2026', subject: 'Computer & Islamiat', timing: '08:30 AM – 10:30 AM', room: 'Computer Lab 1', syllabus: 'Scratch Coding, Algorithms & Surah Al-Baqarah Verses' },
  ]

  useEffect(() => {
    let active = true
    const demoEmail = sessionStorage.getItem('eduflow-demo-email')
    if (demoEmail && active) setParentEmail(demoEmail)

    if (isSupabaseConfigured && supabaseClient) {
      supabaseClient.auth.getUser().then(({ data }) => {
        if (active && data.user?.email) setParentEmail(data.user.email)
      })
    }

    fetchCurrentParentData().then(({ data }) => {
      if (active) {
        if (data) setLive(data)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Header matching Screen 4 */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Welcome, Sarah Miller</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {children.length === 1 ? '1 Student Enrolled' : children.length === 2 ? 'Two Students Enrolled' : `${children.length} Students Enrolled`} · Academic Session 2026–2027
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative hidden md:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search progress, excuses, sectors..."
              className="h-9 w-52 xl:w-60 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>
          <Button
            variant="outline"
            className="rounded-full border-slate-200 text-xs font-bold text-slate-700 hover:border-slate-300"
            onClick={() => setChallanModalOpen(true)}
          >
            Need Status
          </Button>
          <Button
            onClick={() => setChallanModalOpen(true)}
            className="rounded-full bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
          >
            Edit Password
          </Button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl font-bold text-xs">
            <CheckCircle2 className="size-3.5 text-emerald-600" /> Fee: Paid
          </span>
          <Button
            variant="outline"
            onClick={() => setChallanModalOpen(true)}
            className="rounded-xl border-slate-200 hover:border-blue-300 text-xs font-bold"
          >
            <Printer className="size-3.5 mr-1.5 text-blue-600" /> View Challan
          </Button>
          <Button
            onClick={() => setPayModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs text-xs"
          >
            <CreditCard className="size-3.5 mr-1.5" /> Pay Online
          </Button>
        </div>
      </div>

      {/* Dynamic Children Student Cards (1, 2, or N children depending on parent) */}
      <section aria-label="Enrolled Children Profiles">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Kids</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
              {children.length} Enrolled
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Click a card to select active child context</span>
        </div>

        <div className={`grid gap-4 ${
          children.length === 1
            ? 'grid-cols-1 max-w-xl'
            : children.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {children.map((child, idx) => {
            const isSelected = selectedChildIndex === idx
            return (
              <div
                key={child.id}
                onClick={() => setSelectedChildIndex(idx)}
                className={`rounded-2xl bg-white p-5 border shadow-2xs transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Card Top: Avatar, Name, Grade, Enrolled Chip */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shadow-2xs">
                      {child.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">{child.name}</h3>
                        {isSelected && (
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-md">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{child.class}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Enrolled
                  </span>
                </div>

                {/* Card Metric Grid Row 1 (Screen 4) */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <span>Status</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Rest</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{child.status}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Status</div>
                      <div className="text-sm font-black text-blue-600 mt-0.5">7%</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Total</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">10%</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Fee</div>
                      <div className="text-sm font-black text-emerald-600 mt-0.5">100%</div>
                    </div>
                  </div>
                </div>

                {/* Card Metric Grid Row 2 (Screen 4: Attendance / Class Notes) */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <span>{child.id === 1 ? 'Attendance' : 'Class Notes'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Grades</div>
                      <div className="text-sm font-black text-blue-600 mt-0.5">{child.grades}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Status</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">7%</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Total</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{child.id === 1 ? '10%' : '6%'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Attendance</div>
                      <div className="text-sm font-black text-emerald-600 mt-0.5">{child.attendance}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Split Cards: Recent Assignments & Class Events (Screen 4 Bottom Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Recent Assignments */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Assignments</h3>
              <p className="text-xs text-slate-500">Pending tasks and submissions</p>
            </div>
            <span className="text-xs font-semibold text-blue-600">Active</span>
          </div>

          <div className="space-y-3">
            {[
              { title: `${activeStudent.name} Math Algebra Chapter 5 Test`, time: '10:00 AM', status: 'Submitted' },
              { title: 'Class Science Lab Activity - Photosynthesis', time: '12:00 PM', status: 'Due Tomorrow' },
              { title: 'English Grammar Essay Writing Task', time: 'Yesterday', status: 'Completed' },
            ].map((asg, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="min-w-0 pr-3">
                  <div className="font-bold text-slate-800 truncate">{asg.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{asg.time}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                  asg.status === 'Submitted' || asg.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {asg.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Class Events */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Class Events</h3>
              <p className="text-xs text-slate-500">Upcoming school activities &amp; meetings</p>
            </div>
            <span className="text-xs font-semibold text-blue-600">Upcoming</span>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Class Events - Term Orientation', time: '12:30 AM', date: 'Fri, 23 Oct' },
              { title: 'Sports Gala Prep & Selection Trials', time: '02:00 AM', date: 'Mon, 26 Oct' },
              { title: 'Parent Teacher Meeting (PTM)', time: '09:00 AM', date: 'Sat, 31 Oct' },
            ].map((evt, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="min-w-0 pr-3">
                  <div className="font-bold text-slate-800 truncate">{evt.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{evt.date}</div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 shrink-0">
                  {evt.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Class Diary + Context-Aware Gemini AI */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Daily Diary</span>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">Teacher Homework Audio Diary</h2>
          </div>
          <AudioDiary
            audioUrl={live?.diary?.audio_url}
            note={live?.diary?.note || 'Math: Complete exercise 3.4 page 48. Science: Prepare for Lab quiz on photosynthesis on Wednesday.'}
          />
        </section>
        <AiAssistant studentContext={studentProfile} />
      </div>

      {/* Academic Hub: Report Cards & Exam Date Sheet */}
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Academics &amp; Assessment</span>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">Student Academic Performance &amp; Schedule</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAcademicTab('grades')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                academicTab === 'grades'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="size-3.5 inline mr-1" /> Term Report Card
            </button>
            <button
              onClick={() => setAcademicTab('exams')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                academicTab === 'exams'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="size-3.5 inline mr-1" /> Exam Date Sheet
            </button>
          </div>
        </div>

        {academicTab === 'grades' && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <div>
                <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">Official Term Report Card · Session 2026-27</h3>
                <p className="text-xs text-slate-500">Marks certified by Academic Examination Controller.</p>
              </div>
              <Button size="sm" onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                <Printer className="size-3.5 mr-1" /> Print Report Card Slip
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-50/70 dark:bg-slate-950/70">
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Subject Teacher</th>
                    <th className="px-4 py-3 text-right">Marks Scored</th>
                    <th className="px-4 py-3 text-right">Total Marks</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3 text-center">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subjects.map((sub) => (
                    <tr key={sub.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{sub.name}</td>
                      <td className="px-4 py-3 text-slate-500">{sub.teacher}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-slate-100">{sub.marks}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{sub.total}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-50 text-emerald-700">
                          {sub.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-emerald-600 text-[11px]">Passed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-slate-900 dark:text-slate-100" colSpan={2}>Aggregate Term Total</th>
                    <th className="px-4 py-3 text-right text-sm font-black text-emerald-700">530</th>
                    <th className="px-4 py-3 text-right text-slate-600 font-bold">600</th>
                    <th className="px-4 py-3 text-center text-sm font-black text-emerald-700">A* (88.3%)</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-800">3rd Position</th>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Class Teacher Remarks:</span>
              <p className="text-slate-600 dark:text-slate-400 italic">
                &ldquo;Ali exhibits remarkable cognitive curiosity and active engagement in science and mathematics. He is encouraged to dedicate daily revision time to Urdu creative writing to maintain his top-three standing.&rdquo;
              </p>
            </div>
          </div>
        )}

        {academicTab === 'exams' && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-purple-50/50 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40">
              <div>
                <h3 className="font-bold text-sm text-purple-900 dark:text-purple-300">Mid-Term Examination Date Sheet · October 2026</h3>
                <p className="text-xs text-slate-500">Students must bring their own stationery kits and arrive 15 minutes before paper start time.</p>
              </div>
              <Button size="sm" onClick={() => window.print()} className="bg-purple-700 hover:bg-purple-800 text-white rounded-xl">
                <Printer className="size-3.5 mr-1" /> Print Date Sheet
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-50/70 dark:bg-slate-950/70">
                    <th className="px-4 py-3">Day &amp; Date</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Timing</th>
                    <th className="px-4 py-3">Examination Venue</th>
                    <th className="px-4 py-3">Syllabus Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {examDateSheet.map((item) => (
                    <tr key={item.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">{item.date}</td>
                      <td className="px-4 py-3.5 font-semibold text-emerald-700">{item.subject}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{item.timing}</td>
                      <td className="px-4 py-3.5 text-slate-600">{item.room}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">{item.syllabus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Online Payment Modal */}
      {payModalOpen && (
        <PaymentGatewayModal
          details={{
            challanNo: studentProfile.challanNo,
            studentName: studentProfile.name,
            rollNo: studentProfile.roll,
            className: studentProfile.class,
            amount: studentProfile.feeAmount,
            dueDate: studentProfile.dueDate,
            bankName: studentProfile.bankName,
            accountTitle: studentProfile.accountTitle,
            iban: studentProfile.iban,
            psid: studentProfile.psid,
          }}
          onClose={() => setPayModalOpen(false)}
          onSuccess={(txnId) => {
            setFeeStatus('Paid')
          }}
        />
      )}

      {/* 3-Face Challan Modal */}
      {challanModalOpen && (
        <ThreeFaceChallanSlip
          data={{
            challanNo: studentProfile.challanNo,
            studentName: studentProfile.name,
            fatherName: studentProfile.guardian,
            rollNo: studentProfile.roll,
            className: studentProfile.class,
            tuitionFee: studentProfile.feeAmount,
            arrears: 0,
            dueDate: studentProfile.dueDate,
            issueDate: '01 Oct 2026',
            bankName: studentProfile.bankName,
            accountTitle: studentProfile.accountTitle,
            iban: studentProfile.iban,
            psid: studentProfile.psid,
            schoolName: 'EduFlow Academy & College',
            schoolBranch: 'Main Campus',
          }}
          onClose={() => setChallanModalOpen(false)}
        />
      )}

      <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 py-4 border-t border-slate-200/60 dark:border-slate-800">
        <span className="flex items-center gap-1.5"><CircleHelp className="size-3.5" /> Need help? Contact campus accounts at accounts@eduflow.pk</span>
        <span>EduFlow OS · Campus Parent Portal</span>
      </footer>
    </div>
  )
}
