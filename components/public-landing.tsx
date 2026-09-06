'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Bot, Check, ChevronDown, CircleCheck, CreditCard, FileText, Headphones, MessageCircle, Mic, Play, Sparkles, Users, Zap } from 'lucide-react'

const whatsapp = 'https://wa.me/923127803616'
const plans = [
  { name: 'Starter', price: '2,500', limit: 'Up to 1,000 Students', features: ['1-Click Attendance', 'Voice & Text Diaries', 'Basic Gradebook & Marks Entry'] },
  { name: 'Pro', price: '5,000', limit: 'Up to 2,500 Students', popular: true, features: ['Everything in Starter', '1-Click Fee Automation & 3-Copy Challans', 'Automated Term Exam Report Cards', 'WhatsApp Fee Reminders'] },
  { name: 'Enterprise', price: '12,000', limit: 'Unlimited Students', features: ['Everything in Pro', '24/7 Gemini AI Companion Chatbot', 'WhatsApp Attendance Notifications', 'Multi-Campus Management', 'Full Accounting Ledger', 'Custom Branded Domain'] },
]
const faqs = [
  ['What happens during internet downtime?', 'EduFlow keeps the essential classroom actions available with a lightweight fallback flow. Attendance can be captured and synced once the connection returns, so a weak signal never becomes a missed register.'],
  ['Can we import our existing Excel data?', 'Yes. We help you bring over your students, classes, fee structures, and marks from clean Excel sheets during onboarding.'],
  ['Do WhatsApp messages have extra charges?', 'Your school dashboard does not use an SMS balance. WhatsApp delivery uses the school\'s connected WhatsApp account and any provider charges are shown transparently.'],
]

export function PublicLanding() {
  const [preview, setPreview] = useState<'attendance' | 'fees' | 'ai'>('attendance')
  const [openFaq, setOpenFaq] = useState(0)
  const planLink = (name: string) => `${whatsapp}?text=Hello%20EduFlow%2C%20I%20want%20to%20subscribe%20to%20the%20${name}%20plan.`
  return <main className="landing-page">
    <nav className="landing-nav">
      <Link className="landing-logo" href="/"><span>EF</span><strong>EduFlow <em>OS</em></strong></Link>
      <div className="landing-links">
        <a href="#features" className="hover:text-sky-600 transition-colors">Why EduFlow</a>
        <a href="#pricing" className="hover:text-sky-600 transition-colors">Pricing</a>
        <a href="#faq" className="hover:text-sky-600 transition-colors">FAQ</a>
        <Link href="/login?next=/admin" className="hidden sm:inline-block text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-600 transition-colors">Campus Admin</Link>
        <Link href="/login?next=/teacher" className="hidden sm:inline-block text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-600 transition-colors">Teacher</Link>
        <Link href="/login?next=/parent" className="hidden sm:inline-block text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-600 transition-colors">Parent</Link>
      </div>
      <div className="flex items-center gap-2">
        <Link className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 hover:text-sky-600 dark:text-slate-200 transition-colors" href="/login?force=1">
          Sign In
        </Link>
        <Link className="nav-login text-xs font-semibold inline-flex items-center gap-1" href="/signup">
          Start Free Trial <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </nav>
    <section className="landing-hero" id="top"><div className="hero-copy"><div className="trust-badge"><span aria-hidden="true">🇵🇰</span> Built Specifically for Pakistani Matric &amp; Cambridge Schools</div><h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">Pakistan Ka Pehla <mark>1-Click AI</mark> School Operating System</h1><p>Replace manual paper registers, eliminate fee arrears, and automate parent communication with 1-click attendance, 3-copy fee challans, and 24/7 Gemini AI.</p><div className="hero-actions"><Link className="landing-btn primary" href="/signup">Start 30-Day Free Trial <ArrowRight /></Link><Link className="landing-btn outline" href="/login?force=1">Sign In <ArrowRight /></Link></div><div className="hero-proof"><div className="avatar-stack"><span>AK</span><span>RS</span><span>MK</span></div><span><b>Trusted by forward-thinking schools</b><small>Built for how your campus actually works.</small></span></div></div><div className="hero-preview"><div className="preview-glow" /><div className="preview-window"><div className="preview-bar"><span className="window-dots"><i /><i /><i /></span><span>eduflow.os / live-preview</span><span className="secure-chip"><CircleCheck /> Live</span></div><div className="preview-tabs">{[['attendance', 'Teacher Haziri'], ['fees', 'Bank Challan'], ['ai', 'Parent AI']].map(([key, label]) => <button key={key} className={preview === key ? 'active' : ''} onClick={() => setPreview(key as typeof preview)}>{label}</button>)}</div>{preview === 'attendance' && <div className="mock-panel attendance-panel"><div className="mock-heading"><div><small>CLASS 8 · SECTION A</small><h3>Good morning, Ms. Ayesha</h3></div><span className="live-status"><i /> Live class</span></div><div className="attendance-row"><div className="mock-avatar green">SA</div><div><b>Sara Ahmed</b><small>Roll no. 08 · Present today</small></div><button className="present-toggle"><Check /> Present</button></div><div className="attendance-row"><div className="mock-avatar blue">HM</div><div><b>Hamza Malik</b><small>Roll no. 09 · Present today</small></div><button className="present-toggle"><Check /> Present</button></div><div className="mock-summary"><span><strong>31</strong> present</span><span><strong>02</strong> absent</span><Link href="/login?next=/teacher" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline">Open Live Haziri <Zap /></Link></div></div>}{preview === 'fees' && <div className="mock-panel challan-panel"><div className="receipt-top"><span className="receipt-logo">EF</span><div><small>EDUFLOW OS · FEE CHALLAN</small><h3>Greenfield Academy</h3></div><span className="receipt-tag">COPY 1 / 3</span></div><div className="receipt-meta"><span>Student<strong>Sara Ahmed</strong></span><span>Class<strong>8 - A</strong></span><span>Due date<strong>10 Aug 2026</strong></span></div><div className="receipt-line"><span>Monthly Tuition Fee</span><strong>Rs. 8,500</strong></div><div className="receipt-line"><span>Computer &amp; Activity</span><strong>Rs. 1,500</strong></div><div className="receipt-total"><span>Total payable</span><strong>Rs. 10,000</strong></div><div className="receipt-footer"><Link href="/login?next=/admin/fees" className="text-sky-700 hover:underline font-semibold">✓ Open Fee Challan Generator</Link><span>✓ 3-Copy Print Ready</span></div></div>}{preview === 'ai' && <div className="mock-panel ai-panel"><div className="ai-heading"><span className="ai-icon"><Bot /></span><div><h3>EduFlow AI Companion</h3><small>Roman Urdu · Online 24/7</small></div><Sparkles /></div><div className="chat-bubble parent">Sara ki Maths mein progress kaisi hai?</div><div className="chat-bubble ai">Sara is making great progress. Her recent score is <b>86%</b>. Her teacher has also shared a new algebra worksheet for practice.</div><div className="ai-input"><span>Ask about Sara&apos;s school day...</span><Link href="/login?next=/parent" className="inline-flex items-center justify-center size-7 rounded-full bg-sky-600 text-white"><ArrowRight className="size-4" /></Link></div></div>}<div className="preview-foot"><span><Sparkles /> One connected school day</span><Link href="/signup" className="text-sky-700 hover:underline font-semibold">Start Free Trial →</Link></div></div></div></section>
    <section className="logo-strip"><span>Designed for the rhythm of</span><b>MATRIC</b><b>CAMBRIDGE</b><b>PRIVATE SCHOOLS</b><b>ACADEMIES</b></section>
    <section className="feature-section" id="features"><div className="section-intro"><span className="section-kicker">Less admin. More teaching.</span><h2>The daily school work, <em>made lighter.</em></h2><p>One clear operating layer for teachers, administrators, and families — designed around the moments that matter.</p></div><div className="feature-grid"><Feature href="/login?next=/teacher" icon={<Zap />} title="1-Click Digital Haziri" text="30-second class attendance with instant WhatsApp absent alerts." /><Feature href="/login?next=/admin/fees" icon={<CreditCard />} title="3-Copy Bank Fee Challans" text="1-click generation, automated WhatsApp reminders, zero SMS balance costs." /><Feature href="/login?next=/teacher/diary" icon={<Mic />} title="Urdu & English Audio Diaries" text="Teachers record 10-second voice notes that broadcast directly to parents." /><Feature href="/login?next=/parent" icon={<Bot />} title="24/7 Gemini AI Parent Companion" text="Parents ask about progress, syllabus, and marks in Roman Urdu." /></div></section>
    <section className="pricing-section" id="pricing"><div className="section-intro"><span className="section-kicker">Simple, local, transparent</span><h2>Plans that scale with<br /><em>your school.</em></h2><p>Start with the essentials. Add automation when your campus is ready.</p></div><div className="plans-grid">{plans.map(plan => <article className={`plan-card transition-all duration-200 hover:shadow-md hover:border-sky-300 ${plan.popular ? 'featured' : ''}`} key={plan.name}>{plan.popular && <div className="popular-ribbon">MOST POPULAR</div>}<span className="plan-name">{plan.name}</span><h3><small>Rs.</small>{plan.price}<small>/ month</small></h3><p className="plan-limit">{plan.limit}</p><div className="plan-divider" /> <ul>{plan.features.map(f => <li key={f}><Check />{f}</li>)}</ul><Link className={`landing-btn ${plan.popular ? 'primary' : 'outline'}`} href={`/signup?plan=${plan.name}`}>Start 30-Day Free Trial <ArrowRight /></Link></article>)}</div></section>
    <section className="faq-section" id="faq"><div className="faq-intro"><span className="section-kicker">Questions, answered</span><h2>Ready when<br /><em>you are.</em></h2><p>Still curious? Our team can walk you through the full school workflow in five minutes.</p><a className="landing-btn primary" href={`${whatsapp}?text=Hello%20EduFlow%2C%20I%20have%20a%20question.`}>Chat with our team <MessageCircle /></a></div><div className="faq-list">{faqs.map(([question, answer], i) => <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={question}><button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}><span>{question}</span><ChevronDown /></button>{openFaq === i && <p>{answer}</p>}</div>)}</div></section>
    
    <footer className="landing-footer">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 w-full py-8 text-left border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <Link className="landing-logo mb-2 inline-flex" href="/"><span>EF</span><strong>EduFlow <em>OS</em></strong></Link>
          <p className="text-xs text-slate-500 mt-2">Next-generation operating system built specifically for Pakistani schools.</p>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">Campus Admin</span>
          <Link href="/login?next=/admin" className="text-slate-600 hover:text-sky-600 transition-colors">Admin Overview</Link>
          <Link href="/login?next=/admin/students" className="text-slate-600 hover:text-sky-600 transition-colors">Student Register</Link>
          <Link href="/login?next=/admin/attendance" className="text-slate-600 hover:text-sky-600 transition-colors">Daily Attendance</Link>
          <Link href="/login?next=/admin/fees" className="text-slate-600 hover:text-sky-600 transition-colors">Fee Challans</Link>
          <Link href="/login?next=/admin/finance" className="text-slate-600 hover:text-sky-600 transition-colors">Finance Ledger</Link>
          <Link href="/login?next=/admin/billing" className="text-slate-600 hover:text-sky-600 transition-colors">Billing &amp; Plan</Link>
          <Link href="/login?next=/admin/settings" className="text-slate-600 hover:text-sky-600 transition-colors">Campus Settings</Link>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">Classroom &amp; Home</span>
          <Link href="/login?next=/teacher" className="text-slate-600 hover:text-sky-600 transition-colors">Teacher Haziri Console</Link>
          <Link href="/login?next=/teacher/diary" className="text-slate-600 hover:text-sky-600 transition-colors">Audio Voice Diary</Link>
          <Link href="/login?next=/teacher/gradebook" className="text-slate-600 hover:text-sky-600 transition-colors">Gradebook &amp; Marks</Link>
          <Link href="/login?next=/parent" className="text-slate-600 hover:text-sky-600 transition-colors">Parent Learning Space</Link>
          <Link href="/login?next=/parent#ai" className="text-slate-600 hover:text-sky-600 transition-colors">24/7 AI Companion</Link>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">Platform</span>
          <Link href="/signup" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">Start 30-Day Free Trial</Link>
          <Link href="/login?force=1" className="text-slate-600 hover:text-sky-600 transition-colors">Account Sign In</Link>
          <Link href="/login?next=/super-admin" className="text-slate-600 hover:text-sky-600 transition-colors">Super Admin Control Plane</Link>
          <a href={`${whatsapp}?text=Hello%20EduFlow%2C%20I%20want%20to%20book%20a%20demo.`} className="text-slate-600 hover:text-sky-600 transition-colors">WhatsApp Support (03127803616)</a>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full pt-4">
        <span>School operations, finally in sync.</span>
        <a href={`${whatsapp}?text=Hello%20EduFlow%2C%20I%20want%20to%20learn%20more.`}>03127803616 <ArrowRight /></a>
      </div>
    </footer>
    <a className="whatsapp-float" href={`${whatsapp}?text=Hello%20EduFlow%2C%20I%20want%20to%20book%20a%20demo.`} aria-label="Chat with EduFlow on WhatsApp"><span><i /></span><MessageCircle /></a>
  </main>
}
function Feature({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="feature-card group block no-underline transition hover:scale-[1.02] hover:shadow-md hover:border-sky-300">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="inline-flex items-center text-xs font-semibold text-sky-600 dark:text-sky-400 mt-2">
        Open Module <ArrowRight className="ml-1 size-3 transition group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
