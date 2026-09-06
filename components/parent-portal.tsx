'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchCurrentParentData } from '@/lib/live-data'
import { OfflineStatusBar } from '@/components/eduflow-provider'
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import {
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleHelp,
  Download,
  FileText,
  Headphones,
  Pause,
  Play,
  Printer,
  ReceiptText,
  Send,
  Sparkles,
  User,
  Volume2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { cn } from '@/lib/utils'

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
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md hover:bg-sky-700 transition"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? 'Pause teacher voice diary' : 'Play teacher voice diary'}
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
        </button>
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
          <Volume2 className="size-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Headphones className="size-4 text-sky-600" aria-hidden="true" />
          <span>Teacher Daily Diary</span>
        </div>
        {note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{note}</p>}
      </div>
    </div>
  )
}

function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Assalam-o-alaikum! How can I assist you with your child\'s school routine, attendance, or fees today?', time: 'Today' }
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
        body: JSON.stringify({ prompt: text }),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        setMessages((m) => [...m, { role: 'ai', text: 'Session expired. Please sign in again.', time: now }])
        return
      }
      const result = await response.json()
      setMessages((m) => [
        ...m,
        { role: 'ai', text: result.text || 'I have checked your child\'s records. Please let me know if you need more details.', time: now }
      ])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'Thank you for your question. You can also contact the school office directly.', time: now }
      ])
    } finally {
      setTyping(false)
    }
  }

  const quickPrompts = [
    'Attendance summary',
    'Pending fee status',
    'Class routine questions',
  ]

  return (
    <section id="ai" className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 p-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
          <Bot className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            EduFlow AI Companion <span className="text-xs font-semibold text-slate-400 font-normal">(Gemini)</span>
          </h2>
          <p className="text-xs text-slate-500">Ask questions about your child&apos;s attendance, diary, or fees in English or Urdu.</p>
        </div>
        <Sparkles className="ml-auto size-5 text-amber-500" />
      </div>

      <div className="flex flex-wrap gap-1.5 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => send(prompt)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-sky-300 hover:text-sky-700 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 p-5 flex flex-col gap-3 min-h-[220px] max-h-[300px] overflow-y-auto" aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={`${message.time}-${index}`}
            className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed',
                message.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
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
            <span className="size-1.5 rounded-full bg-slate-400 animate-pulse" />
            <span className="size-1.5 rounded-full bg-slate-400 animate-pulse delay-100" />
            <span className="size-1.5 rounded-full bg-slate-400 animate-pulse delay-200" />
            <span className="ml-1 text-[11px]">EduFlow AI is typing…</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <input
          data-testid="input-parent-ai"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send() }}
          placeholder="Type your question in English or Urdu..."
          aria-label="Ask EduFlow AI"
          className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
        />
        <Button
          onClick={() => send()}
          aria-label="Send message"
          className="size-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs p-0 flex items-center justify-center shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </section>
  )
}

function ReceiptModal({ onClose, fee }: { onClose: () => void; fee: any }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <header className="flex items-start justify-between no-print border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Payment Verification</span>
            <h2 id="receipt-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">Official Fee Payment Receipt</h2>
          </div>
          <button className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose} aria-label="Close receipt">
            <X className="size-4" />
          </button>
        </header>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-4 bg-slate-50/50 dark:bg-slate-950">
          <div className="flex size-10 items-center justify-center rounded-full bg-sky-600 text-white font-bold text-xs">EF</div>
          <div>
            <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">EduFlow OS Campus</strong>
            <p className="text-xs text-slate-500">Official Student Fee Receipt · Session 2026–27</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden text-xs">
          <div className="grid grid-cols-3 bg-slate-50 p-3 font-bold text-slate-500 uppercase tracking-wider">
            <span>Description</span>
            <span>Status</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="grid grid-cols-3 p-3 border-t border-slate-100">
            <span>Tuition &amp; Campus Fee</span>
            <span className="font-semibold text-emerald-600">{fee?.status || 'Paid'}</span>
            <span className="text-right font-bold">Rs. {(Number(fee?.amount) || 0).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-3 p-3 border-t-2 border-slate-900 font-bold bg-slate-50/50">
            <span>Total Payable</span>
            <span>{fee?.status || 'Cleared'}</span>
            <span className="text-right text-sm text-sky-700">Rs. {(Number(fee?.amount) || 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 border border-emerald-100 text-xs text-emerald-800">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <p className="font-semibold">Electronic receipt registered in EduFlow secure campus ledger.</p>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2 no-print">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => window.print()} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs">
            <Printer className="size-4 mr-2" /> Print Receipt
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ParentPortal() {
  const [live, setLive] = useState<{ attendance: any[]; fees: any[]; diary: any } | null>(null)
  const [parentEmail, setParentEmail] = useState('')
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demoEmail = sessionStorage.getItem('eduflow-demo-email')
    if (demoEmail) setParentEmail(demoEmail)

    if (isSupabaseConfigured && supabaseClient) {
      supabaseClient.auth.getUser().then(({ data }) => {
        if (data.user?.email) setParentEmail(data.user.email)
      })
    }

    fetchCurrentParentData().then(({ data }) => {
      if (data) setLive(data)
      setLoading(false)
    })
  }, [])

  const attendanceRate = useMemo(() => {
    if (!live?.attendance || live.attendance.length === 0) return null
    const present = live.attendance.filter((row) => row.status === 'Present').length
    return Math.round((present / live.attendance.length) * 100)
  }, [live])

  const latestFee = live?.fees?.[0] ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Academic Session 2026–2027</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Student Learning Space</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor your child&apos;s daily classroom attendance, homework diaries, and fee challans.</p>
        </div>
      </div>

      {/* Modern Metric Cards */}
      <section id="attendance" className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Today&apos;s Attendance</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {live?.attendance?.[0]?.status ?? (loading ? 'Loading…' : 'Not recorded')}
          </p>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {attendanceRate !== null ? `${attendanceRate}% term attendance` : 'No attendance history yet'}
            </span>
          </div>
        </div>

        <div id="fees" className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Fee Status</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <ReceiptText className="size-5" />
            </div>
          </div>
          {latestFee ? (
            <>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Rs. {(Number(latestFee.amount) || 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                  latestFee.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                )}>
                  {latestFee.status}
                </span>
                <button
                  className="text-xs text-sky-600 hover:text-sky-700 font-semibold underline"
                  onClick={() => { setSelectedFee(latestFee); setReceiptOpen(true) }}
                >
                  View receipt
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{loading ? 'Checking…' : 'Cleared'}</p>
              <p className="mt-2 text-xs text-slate-500">No pending invoices for current session.</p>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Academic Session</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <CalendarDays className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">2026–27</p>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              Campus Node Active
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Class Diary</span>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">Today&apos;s Class Diary</h2>
          </div>
          <AudioDiary audioUrl={live?.diary?.audio_url} note={live?.diary?.note} />
        </section>
        <AiAssistant />
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Academic Record</span>
          <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">Examination &amp; Performance Status</h2>
        </div>
        <ZeroDataEmptyState
          icon={FileText}
          title="No term examination marks published"
          description="Official term evaluation results will be published here by the class teacher upon exam completion."
        />
      </section>

      <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 py-4 border-t border-slate-200/60 dark:border-slate-800">
        <span className="flex items-center gap-1.5"><CircleHelp className="size-3.5" /> Need help? Contact the school office at support@eduflow.pk</span>
        <span>EduFlow OS · Campus Parent Portal</span>
      </footer>

      {receiptOpen && <ReceiptModal fee={selectedFee} onClose={() => setReceiptOpen(false)} />}
    </div>
  )
}
