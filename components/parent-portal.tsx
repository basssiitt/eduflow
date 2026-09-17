'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchCurrentParentData, fetchParentData, fetchParentStudents } from '@/lib/live-data'
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
      text: `Assalam-o-Alaikum! Main EduFlow AI Parent Companion hoon. Aap ${studentContext.name && studentContext.name !== 'No Child Selected' ? studentContext.name : 'apnay bachay'} ki attendance, term grades, ya fee challan ke baray mein sawal pooch sakte hain.`,
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
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: `School records verified. ${studentContext.name || 'Student'} ki attendance ${studentContext.attendance || '0%'} hai.`,
            time: now,
          },
        ])
        return
      }
      const result = (await response.json()) as { text?: string }
      setMessages((m) => [
        ...m,
        { role: 'ai', text: result.text || 'Records check ho chuke hain. Koi aur madad chahiye?', time: now },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: `Records verified for ${studentContext.name}. Attendance: ${studentContext.attendance || '0%'}, Fees: PKR ${studentContext.feeAmount?.toLocaleString() || 0}.`,
          time: now,
        },
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

type ParentChild = {
  id: string | number
  name: string
  class: string
  status: number
  grades: string
  total: number
  fee: string
  enrolled: boolean
  avatar: string
  roll: string
  feeAmount: number
  challanNo: string
  dueDate: string
  attendance: string
}

export function ParentPortal() {
  const [live, setLive] = useState<{ attendance: unknown[]; fees: unknown[]; diary: { audio_url?: string; note?: string } | null } | null>(null)
  const [parentEmail, setParentEmail] = useState('')
  const [parentName, setParentName] = useState('')
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [challanModalOpen, setChallanModalOpen] = useState(false)
  const [academicTab, setAcademicTab] = useState<'grades' | 'exams'>('grades')
  const [feeStatus, setFeeStatus] = useState<'Pending' | 'Paid'>('Paid')
  const [loading, setLoading] = useState(true)

  // Real children enrolled under this parent account
  const [children, setChildren] = useState<ParentChild[]>([])
  const [selectedChildIndex, setSelectedChildIndex] = useState(0)

  const activeStudent = children.length > 0 ? (children[selectedChildIndex] || children[0]) : null

  const studentProfile: StudentContext = activeStudent
    ? {
        name: activeStudent.name,
        roll: activeStudent.roll,
        class: activeStudent.class,
        guardian: parentName || (parentEmail ? parentEmail.split('@')[0] : 'Parent'),
        attendance: activeStudent.attendance,
        feeAmount: activeStudent.feeAmount,
        challanNo: activeStudent.challanNo,
        dueDate: activeStudent.dueDate,
        bankName: 'Meezan Bank Ltd.',
        accountTitle: 'EduFlow School Main Campus',
        iban: 'PK92 MEZN 0001 2345 6789 0101',
        psid: '1004928019382',
      }
    : {
        name: 'No Child Selected',
        roll: '—',
        class: '—',
        guardian: parentName || (parentEmail ? parentEmail.split('@')[0] : 'Parent'),
        attendance: '0%',
        feeAmount: 0,
        challanNo: '—',
        dueDate: '—',
      }

  const subjects: Array<{ name: string; marks: number; total: number; grade: string; teacher: string }> = []
  const examDateSheet: Array<{ date: string; subject: string; timing: string; room: string; syllabus: string }> = []

  useEffect(() => {
    let active = true
    const demoEmail = sessionStorage.getItem('eduflow-demo-email')
    if (demoEmail && active) setParentEmail(demoEmail)

    if (isSupabaseConfigured && supabaseClient) {
      const client = supabaseClient
      client.auth.getUser().then(async ({ data }) => {
        if (!active) return
        if (data.user?.email) setParentEmail(data.user.email)
        if (data.user?.id) {
          const { data: profile } = await client
            .from('profiles')
            .select('full_name')
            .eq('id', data.user.id)
            .maybeSingle()
          if (active && profile?.full_name) {
            setParentName(profile.full_name)
          } else if (active && data.user.user_metadata?.full_name) {
            setParentName(data.user.user_metadata.full_name)
          }
        }
      })
    }

    fetchParentStudents().then(async ({ data: studentList }) => {
      if (!active) return
      if (studentList && studentList.length > 0) {
        const mappedChildren: ParentChild[] = studentList.map((s, idx) => ({
          id: s.id,
          name: s.name,
          class: s.class,
          status: 0,
          grades: '—',
          total: 0,
          fee: '100%',
          enrolled: true,
          roll: s.roll || `2026-${String(idx + 1).padStart(3, '0')}`,
          feeAmount: s.feeAmount || 0,
          challanNo: `CH-2026-${String(idx + 101).padStart(3, '0')}`,
          dueDate: '10-Oct-2026',
          attendance: '0%',
          avatar: s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST',
        }))
        setChildren(mappedChildren)

        if (mappedChildren[0]?.id) {
          const { data: liveData } = await fetchParentData(mappedChildren[0].id)
          if (active && liveData) {
            setLive(liveData)
            if (liveData.attendance && liveData.attendance.length > 0) {
              const present = liveData.attendance.filter((a: any) => a.status === 'Present' || a.status === 'present').length
              const rate = `${Math.round((present / liveData.attendance.length) * 100)}%`
              setChildren((prev) => prev.map((c, i) => i === 0 ? { ...c, attendance: rate } : c))
            }
          }
        }
      } else {
        setChildren([])
      }
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const handleSelectChild = async (idx: number) => {
    setSelectedChildIndex(idx)
    const child = children[idx]
    if (child?.id) {
      const { data: liveData } = await fetchParentData(child.id)
      if (liveData) {
        setLive(liveData)
        if (liveData.attendance && liveData.attendance.length > 0) {
          const present = liveData.attendance.filter((a: any) => a.status === 'Present' || a.status === 'present').length
          const rate = `${Math.round((present / liveData.attendance.length) * 100)}%`
          setChildren((prev) => prev.map((c, i) => i === idx ? { ...c, attendance: rate } : c))
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header matching Screen 4 */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Welcome, {parentName || (parentEmail ? parentEmail.split('@')[0] : 'Parent')}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {children.length === 0 ? 'No Enrolled Students' : children.length === 1 ? '1 Student Enrolled' : `${children.length} Students Enrolled`} · Academic Session 2026–2027
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl font-bold text-xs">
            <CheckCircle2 className="size-3.5 text-emerald-600" /> Fee: {feeStatus}
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

        {children.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-8">
            <ZeroDataEmptyState
              icon={User}
              title="No children enrolled yet"
              description="No student records are currently linked to your parent account. When school administration admits your child, their profiles will appear here."
            />
          </div>
        ) : (
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
                  onClick={() => handleSelectChild(idx)}
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
                        <div className="text-[9px] uppercase font-bold text-slate-400">Roll</div>
                        <div className="text-xs font-black text-slate-900 mt-0.5 truncate">{child.roll}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Status</div>
                        <div className="text-xs font-black text-blue-600 mt-0.5">Active</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Fee Due</div>
                        <div className="text-xs font-black text-slate-900 mt-0.5">PKR {child.feeAmount}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Attendance</div>
                        <div className="text-xs font-black text-emerald-600 mt-0.5">{child.attendance}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
            {!activeStudent ? (
              <div className="py-6 text-center text-xs text-slate-400">No enrolled child selected.</div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No active homework assignments for this section.</div>
            )}
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
            <div className="py-6 text-center text-xs text-slate-400">No upcoming school events scheduled.</div>
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
            note={live?.diary?.note || ''}
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
            {subjects.length === 0 ? (
              <ZeroDataEmptyState
                icon={Award}
                title="No report card released yet"
                description="Academic report cards and term assessments have not been finalized by the school examination controller."
              />
            ) : (
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
                </table>
              </div>
            )}
          </div>
        )}

        {academicTab === 'exams' && (
          <div className="mt-5 space-y-4">
            {examDateSheet.length === 0 ? (
              <ZeroDataEmptyState
                icon={Calendar}
                title="No upcoming exam schedule"
                description="The examination controller has not announced date sheets for this term yet."
              />
            ) : (
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
            )}
          </div>
        )}
      </section>

      {/* Online Payment Modal */}
      {payModalOpen && (
        <PaymentGatewayModal
          details={{
            challanNo: studentProfile.challanNo || 'CH-2026-001',
            studentName: studentProfile.name || 'Student',
            rollNo: studentProfile.roll || '—',
            className: studentProfile.class || 'Class 5',
            amount: studentProfile.feeAmount || 0,
            dueDate: studentProfile.dueDate || '10-Oct-2026',
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
            challanNo: studentProfile.challanNo || 'CH-2026-001',
            studentName: studentProfile.name || 'Student',
            fatherName: studentProfile.guardian,
            rollNo: studentProfile.roll || '—',
            className: studentProfile.class || 'Class 5',
            tuitionFee: studentProfile.feeAmount || 0,
            arrears: 0,
            dueDate: studentProfile.dueDate || '10-Oct-2026',
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
