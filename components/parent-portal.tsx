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
  ChevronDown,
  CircleHelp,
  Download,
  FileText,
  Headphones,
  LogOut,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

function AudioDiary({ audioUrl, note }: { audioUrl?: string; note?: string }) {
  const [playing, setPlaying] = useState(false)
  if (!audioUrl && !note) {
    return (
      <div className="rounded-xl border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        No voice diary published for today.
      </div>
    )
  }

  return (
    <div className="parent-audio">
      {audioUrl ? (
        <button className="audio-play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause teacher voice diary' : 'Play teacher voice diary'}>
          {playing ? <Pause /> : <Play />}
        </button>
      ) : (
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Volume2 className="size-5" />
        </div>
      )}
      <div className="audio-copy">
        <div className="audio-title"><Headphones /> Teacher Daily Diary</div>
        {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
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
        body: JSON.stringify({ prompt: text })
      })
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
    <section className="parent-ai card-surface">
      <div className="parent-ai-header">
        <div className="ai-avatar"><Bot /></div>
        <div>
          <h2>EduFlow AI Companion <span>(Gemini Powered)</span></h2>
          <p>Ask questions about your child&apos;s attendance, diary, or fees in English or Urdu.</p>
        </div>
        <Sparkles className="ai-sparkle" />
      </div>
      <div className="ai-chips">
        {quickPrompts.map((prompt) => (
          <button key={prompt} onClick={() => send(prompt)}>{prompt}</button>
        ))}
      </div>
      <div className="ai-messages" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`ai-message ${message.role}`} key={`${message.time}-${index}`}>
            <div className="message-bubble">{message.text}</div>
            <time>{message.time}</time>
          </div>
        ))}
        {typing && <div className="ai-message ai"><div className="message-bubble typing"><i /><i /><i /></div></div>}
      </div>
      <div className="ai-composer">
        <input
          data-testid="input-parent-ai"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send() }}
          placeholder="Type your question..."
          aria-label="Ask EduFlow AI"
        />
        <button onClick={() => send()} aria-label="Send message"><Send /></button>
      </div>
    </section>
  )
}

function ReceiptModal({ onClose, fee }: { onClose: () => void; fee: any }) {
  return (
    <div className="parent-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
      <div className="report-modal">
        <header className="no-print">
          <div><span className="parent-eyebrow">Payment Verification</span><h2 id="receipt-title">Official Fee Payment Receipt</h2></div>
          <button className="modal-close" onClick={onClose} aria-label="Close receipt"><X /></button>
        </header>
        <div className="report-school">
          <div className="school-seal">EF</div>
          <div><strong>EduFlow Campus</strong><span>Official Student Fee Receipt</span></div>
        </div>
        <div className="report-table">
          <div className="report-row report-head"><span>Description</span><span>Status</span><span>Amount</span></div>
          <div className="report-row"><span>Tuition &amp; Campus Fee</span><span>{fee?.status || 'Paid'}</span><b>Rs. {(Number(fee?.amount) || 0).toLocaleString()}</b></div>
          <div className="report-row report-total"><span>Total</span><span>{fee?.status || 'Cleared'}</span><strong>Rs. {(Number(fee?.amount) || 0).toLocaleString()}</strong></div>
        </div>
        <div className="remarks">
          <CheckCircle2 className="size-5 text-emerald-600" />
          <div><b>Payment Record</b><p>Issued by school administration.</p></div>
        </div>
        <footer><span>Date: {fee?.due_date || 'Current Session'}</span><span>Accounts Office</span></footer>
        <button className="parent-btn primary report-print" onClick={() => window.print()}><Printer /> Print Receipt</button>
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

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        await supabaseClient.auth.signOut()
      } catch {}
    }
    sessionStorage.clear()
    window.location.href = '/login'
  }

  const attendanceRate = useMemo(() => {
    if (!live?.attendance || live.attendance.length === 0) return null
    const present = live.attendance.filter((row) => row.status === 'Present').length
    return Math.round((present / live.attendance.length) * 100)
  }, [live])

  const latestFee = live?.fees?.[0] ?? null
  const userInitials = (parentEmail ? parentEmail.slice(0, 2) : 'PT').toUpperCase()

  return (
    <main className="parent-page">
      <header className="parent-topbar no-print">
        <div className="parent-brand">
          <div className="parent-brand-mark">EF</div>
          <div><b>EduFlow OS</b><span>Parent Portal</span></div>
        </div>
        <div className="parent-nav">
          <OfflineStatusBar compact />
          <span className="parent-live"><i /> Campus online</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="parent-profile" aria-label="Open parent user menu">
                <span>{userInitials}</span> {parentEmail || 'Parent Account'} <ChevronDown />
              </button>
            } />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>Parent Account</span>
                  <span className="text-xs text-muted-foreground">{parentEmail || 'parent@school.edu.pk'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                <LogOut className="mr-2 size-4 text-rose-600" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="parent-container">
        <section className="parent-student-head">
          <div>
            <span className="parent-eyebrow">Academic Session 2026–2027</span>
            <h1>Student Learning Space</h1>
            <p>Monitor your child&apos;s daily classroom attendance, homework diaries, and fee challans.</p>
          </div>
        </section>

        <section className="parent-status-grid">
          <div className="status-card attendance">
            <div className="status-icon"><CheckCircle2 /></div>
            <div>
              <span>Today&apos;s attendance</span>
              <strong>{live?.attendance?.[0]?.status ?? (loading ? 'Loading…' : 'Not recorded')}</strong>
              <small>{attendanceRate !== null ? `${attendanceRate}% term attendance` : 'No attendance history yet'}</small>
            </div>
            <div className="status-pulse">Live</div>
          </div>
          <div className="status-card fee">
            <div className="status-icon"><ReceiptText /></div>
            <div>
              <span>Fee status</span>
              {latestFee ? (
                <>
                  <strong>{latestFee.status} <small>Rs. {(Number(latestFee.amount) || 0).toLocaleString()}</small></strong>
                  <button
                    className="text-xs text-primary font-medium underline mt-1"
                    onClick={() => { setSelectedFee(latestFee); setReceiptOpen(true) }}
                  >
                    View receipt
                  </button>
                </>
              ) : (
                <>
                  <strong>{loading ? 'Checking…' : 'No Invoices'}</strong>
                  <small>No pending invoices</small>
                </>
              )}
            </div>
          </div>
          <div className="status-card class">
            <div className="status-icon"><CalendarDays /></div>
            <div>
              <span>Academic Year</span>
              <strong>Session 2026–2027</strong>
              <small>Campus Node Active</small>
            </div>
          </div>
        </section>

        <div className="parent-main-grid">
          <section className="parent-diary card-surface">
            <div className="section-heading">
              <div><span className="parent-eyebrow">Class diary</span><h2>Today&apos;s Class Diary</h2></div>
            </div>
            <AudioDiary audioUrl={live?.diary?.audio_url} note={live?.diary?.note} />
          </section>
          <AiAssistant />
        </div>

        <section className="parent-report card-surface">
          <div className="section-heading">
            <div><span className="parent-eyebrow">Academic Record</span><h2>Examination &amp; Performance Status</h2></div>
          </div>
          <div className="p-8 text-center text-sm text-muted-foreground">
            Official term evaluation results will be published here by the class teacher.
          </div>
        </section>

        <footer className="parent-footer">
          <span><CircleHelp /> Need help? Contact the school office at support@eduflow.pk</span>
          <span>EduFlow OS · Campus Parent Portal</span>
        </footer>
      </div>

      {receiptOpen && <ReceiptModal fee={selectedFee} onClose={() => setReceiptOpen(false)} />}
    </main>
  )
}
