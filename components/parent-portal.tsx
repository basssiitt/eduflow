'use client'

import { useMemo, useState } from 'react'
import { Bot, CalendarDays, Check, CheckCircle2, ChevronDown, CircleHelp, Download, FileText, Headphones, Pause, Play, Send, Sparkles, Volume2, X } from 'lucide-react'

const homework = [
  { subject: 'Mathematics', task: 'Complete worksheet 5B: Fractions and Decimals', due: 'Due tomorrow', tone: 'math' },
  { subject: 'English', task: 'Read chapter 4 and write five new vocabulary words', due: 'Due Thursday', tone: 'english' },
  { subject: 'Science', task: 'Draw and label the water cycle in notebook', due: 'Due Friday', tone: 'science' },
  { subject: 'Urdu', task: 'سبق نمبر 6 کے سوالات مکمل کریں', due: 'Due Friday', tone: 'urdu' },
]

const marks = [
  { subject: 'English', mark: 88, color: 'blue' },
  { subject: 'Math', mark: 95, color: 'emerald' },
  { subject: 'Science', mark: 90, color: 'purple' },
  { subject: 'Urdu', mark: 82, color: 'amber' },
]

const aiReplies: Record<string, string> = {
  'Sara ki parhai ki summary dein': 'Sara ne is term mein bohat achi progress dikhayi hai. Mathematics mein unka score sab se strong hai aur homework completion consistent hai.',
  'Kia koi homework pending hai?': 'Ji, Sara ka Mathematics worksheet abhi pending hai. Baqi subjects ka homework complete mark hua hai.',
  'Next exam date sheet kia hai?': 'Next term assessment date sheet school office jald share karega. Main aap ko notification bhej dunga jab publish hogi.',
}

function AudioDiary() {
  const [playing, setPlaying] = useState(false)
  return <div className="parent-audio">
    <button className="audio-play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause teacher voice diary' : 'Play teacher voice diary'}>{playing ? <Pause /> : <Play />}</button>
    <div className="audio-copy"><div className="audio-title"><Headphones /> Teacher voice diary <span>01:24</span></div><div className={`soundwave ${playing ? 'is-playing' : ''}`} aria-hidden="true">{Array.from({ length: 30 }, (_, i) => <i key={i} style={{ height: `${12 + ((i * 17) % 24)}px` }} />)}</div></div>
    <span className="teacher-tag">Miss Ayesha</span>
  </div>
}

function AiAssistant() {
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Assalam-o-alaikum! Main Sara ki parhai aur school routine mein aap ki madad ke liye hazir hoon.', time: '10:42 AM' }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const send = (text = input) => { if (!text.trim()) return; const now = '10:43 AM'; setMessages((m) => [...m, { role: 'user', text, time: now }]); setInput(''); setTyping(true); setTimeout(() => { setTyping(false); setMessages((m) => [...m, { role: 'ai', text: aiReplies[text] || 'Main is sawal ko school records ke saath check karke aap ko update karta hoon.', time: '10:43 AM' }]) }, 700) }
  return <section className="parent-ai card-surface">
    <div className="parent-ai-header"><div className="ai-avatar"><Bot /></div><div><h2>EduFlow AI Assistant <span>(Gemini Powered)</span></h2><p>Puchiye bache ki parhai, attendance, ya fee ke baare me Roman Urdu ya English me.</p></div><Sparkles className="ai-sparkle" /></div>
    <div className="ai-chips">{Object.keys(aiReplies).map((prompt) => <button key={prompt} onClick={() => send(prompt)}>{prompt}</button>)}</div>
    <div className="ai-messages" aria-live="polite">{messages.map((message, index) => <div className={`ai-message ${message.role}`} key={`${message.time}-${index}`}><div className="message-bubble">{message.text}</div><time>{message.time}</time></div>)}{typing && <div className="ai-message ai"><div className="message-bubble typing"><i /><i /><i /></div></div>}</div>
    <div className="ai-composer"><input data-testid="input-parent-ai" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send() }} placeholder="Type your question..." aria-label="Ask EduFlow AI" /><button onClick={() => send()} aria-label="Send message"><Send /></button></div>
  </section>
}

function ReportModal({ onClose }: { onClose: () => void }) {
  return <div className="parent-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="report-title"><div className="report-modal"><header><div><span className="parent-eyebrow">Academic record · Term 1 2026</span><h2 id="report-title">Official Term Report Card</h2></div><button className="modal-close" onClick={onClose} aria-label="Close report card"><X /></button></header><div className="report-school"><div className="school-seal">EF</div><div><strong>The Smart Scholars Academy</strong><span>Campus Location: Knowledge Avenue, Lahore · Student progress and achievement record</span></div><div className="report-student"><b>Sara Khan</b><span>Class 5-A · Roll No: 2026-001</span></div></div><div className="report-table"><div className="report-row report-head"><span>Subject</span><span>Marks</span><span>Grade</span></div>{marks.map((item) => <div className="report-row" key={item.subject}><span>{item.subject}</span><b>{item.mark} / 100</b><strong>{item.mark >= 90 ? 'A+' : item.mark >= 80 ? 'A' : 'B'}</strong></div>)}<div className="report-row report-total"><span>Term average</span><b>88.7%</b><strong>A</strong></div></div><div className="remarks"><FileText /><div><b>Teacher remarks</b><p>Sara is a focused and curious learner. She participates thoughtfully in class and has shown excellent improvement in independent work. Keep it up!</p></div></div><footer><span>Issued 29 August 2026</span><span>Class Teacher: Miss Ayesha</span></footer><button className="parent-btn primary report-print" onClick={() => window.print()}><Download /> Print Report Card (A4 Sheet)</button><a className="parent-btn outline" href="https://wa.me/?text=Sara%20Khan%20Term%20Report%20Card" target="_blank" rel="noreferrer"><Send /> Share PDF on Parent WhatsApp</a></div></div>
}

export function ParentPortal() {
  const [completed, setCompleted] = useState<string[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const completedCount = useMemo(() => completed.length, [completed])
  return <main className="parent-page">
    <header className="parent-topbar"><div className="parent-brand"><div className="parent-brand-mark">EF</div><div><b>EduFlow OS</b><span>Parent Portal</span></div></div><div className="parent-nav"><span className="parent-live"><i /> Campus online</span><button className="parent-profile"><span>SK</span> Sana Khan <ChevronDown /></button></div></header>
    <div className="parent-container">
      <section className="parent-student-head"><div><span className="parent-eyebrow">Good morning, Sana</span><h1>Sara&apos;s learning space</h1><p>Wednesday, 29 August 2026 · Here&apos;s what&apos;s happening today.</p></div><div className="student-identity"><div className="student-avatar">SK</div><div><b>Sara Khan</b><span>Class 5-A <em>•</em> Roll No: 2026-001</span></div></div></section>
      <section className="parent-status-grid"><div className="status-card attendance"><div className="status-icon"><CheckCircle2 /></div><div><span>Today&apos;s attendance</span><strong>Present</strong><small>94% term attendance</small></div><div className="status-pulse">Live</div></div><div className="status-card fee"><div className="status-icon"><Check /></div><div><span>August fee</span><strong>Paid <small>Rs. 2,500</small></strong><a href="#receipt" onClick={(e) => { e.preventDefault(); alert('Receipt download started for Sara Khan.') }}><Download /> Download receipt</a></div></div><div className="status-card class"><div className="status-icon"><CalendarDays /></div><div><span>Next class event</span><strong>Parent-teacher meeting</strong><small>Friday, 06 September · 3:30 PM</small></div></div></section>
      <div className="parent-main-grid"><section className="parent-diary card-surface"><div className="section-heading"><div><span className="parent-eyebrow">Class diary</span><h2>Today&apos;s Class Diary</h2></div><button className="date-picker"><CalendarDays /> 29 Aug 2026 <ChevronDown /></button></div><AudioDiary /><div className="homework-heading"><div><h3>Homework for today</h3><span>{completedCount} of {homework.length} completed</span></div><div className="homework-progress"><i style={{ width: `${(completedCount / homework.length) * 100}%` }} /></div></div><ul className="homework-list">{homework.map((item) => <li className={completed.includes(item.subject) ? 'done' : ''} key={item.subject}><button className={`homework-check ${item.tone}`} onClick={() => setCompleted((current) => current.includes(item.subject) ? current.filter((subject) => subject !== item.subject) : [...current, item.subject])} aria-label={`Mark ${item.subject} homework ${completed.includes(item.subject) ? 'incomplete' : 'complete'}`}>{completed.includes(item.subject) && <Check />}</button><div><b>{item.subject}</b><p>{item.task}</p><small>{item.due}</small></div></li>)}</ul></section><AiAssistant /></div>
      <section className="parent-report card-surface"><div className="section-heading"><div><span className="parent-eyebrow">Academic performance</span><h2>Term Examination &amp; Progress Report</h2></div><button data-testid="btn-report-card" className="parent-btn outline" onClick={() => setReportOpen(true)}><FileText /> View official report card</button></div><div className="marks-grid">{marks.map((item) => <div className="mark-card" key={item.subject}><div className={`mark-ring ${item.color}`}><strong>{item.mark}</strong><span>/100</span></div><b>{item.subject}</b><small>{item.mark >= 90 ? 'Excellent' : 'Very good'}</small></div>)}<div className="report-summary"><div><span>Term average</span><strong>88.7%</strong><small>Top 10% of class</small></div><div className="mini-chart" aria-label="Progress chart"><i /><i /><i /><i /><i /><i /></div></div></div></section>
      <footer className="parent-footer"><span><CircleHelp /> Need help? Contact the school office at support@eduflow.pk</span><span>EduFlow OS · Built for better learning</span></footer>
    </div>{reportOpen && <ReportModal onClose={() => setReportOpen(false)} />}
  </main>
}
