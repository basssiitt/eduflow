'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Bot, Check, ChevronDown, CircleCheck, CreditCard, FileText, Headphones, MessageCircle, Mic, Play, Sparkles, Users, Zap } from 'lucide-react'
import { AcademicCrest } from '@/components/academic-crest'

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
    <nav className="landing-nav bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <Link className="landing-logo flex items-center gap-2.5 no-underline" href="/">
        <AcademicCrest className="size-8 text-white" />
        <strong className="text-lg font-black tracking-tight text-slate-900">EduFlow</strong>
      </Link>
      <div className="landing-links flex items-center gap-6">
        <a href="#features" className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">Features</a>
        <a href="#testimonials" className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">Testimonials</a>
        <a href="#pricing" className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
        <a href="#requests" className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">Requests</a>
        <Link href="/login?next=/admin" className="hidden lg:inline-block text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">Campus Admin</Link>
        <Link href="/login?next=/teacher" className="hidden lg:inline-block text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">Teacher</Link>
        <Link href="/login?next=/parent" className="hidden lg:inline-block text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">Parent</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link className="text-xs font-semibold px-3 py-2 text-slate-700 hover:text-blue-600 transition-colors" href="/login?force=1">
          Log In
        </Link>
        <Link className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition" href="/signup">
          Request a Demo
        </Link>
      </div>
    </nav>

    {/* Hero section matching Screen 5 of Mockup */}
    <section className="relative overflow-hidden bg-white py-12 md:py-20 border-b border-slate-100" id="top">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: iPhone Mockup with Parent Portal UI */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[320px] rounded-[48px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl p-2.5 ring-1 ring-slate-800">
              {/* Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 h-5 w-24 bg-black rounded-full z-20" />
              
              {/* Phone Screen Canvas */}
              <div className="rounded-[36px] bg-slate-50 overflow-hidden pt-7 pb-4 px-3.5 border border-slate-200/40 text-slate-900 font-sans">
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Welcome,</span>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">Sarah Miller</h4>
                    <span className="text-[9px] text-slate-500 font-medium">Two Students</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                {/* Child Snapshot Card */}
                <div className="mt-3 rounded-xl bg-white border border-slate-200/80 p-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        LM
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Liam Miller</div>
                        <div className="text-[10px] text-slate-500">Grade 8 · Sec A</div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700">Enrolled</span>
                  </div>

                  {/* 4-Stat Row */}
                  <div className="mt-3 grid grid-cols-4 gap-1 border-t border-slate-100 pt-2 text-center">
                    <div>
                      <div className="text-[9px] text-slate-400">Status</div>
                      <div className="text-xs font-black text-slate-900">23</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">Grades</div>
                      <div className="text-xs font-black text-blue-600">76%</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">Total</div>
                      <div className="text-xs font-black text-slate-900">10</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">Fee</div>
                      <div className="text-xs font-black text-emerald-600">100%</div>
                    </div>
                  </div>
                </div>

                {/* Recent Assignments Mini List */}
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Recent Assignments</div>
                  <div className="space-y-1.5">
                    <div className="rounded-lg bg-white border border-slate-200/60 p-2 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 truncate">Liam Math Algebra Test</span>
                      <span className="text-[9px] text-slate-400 font-medium">10:00 AM</span>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-200/60 p-2 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 truncate">Science Project Chapter 4</span>
                      <span className="text-[9px] text-slate-400 font-medium">12:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Copy & Feature Checkmarks */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
              EduFlow: The Unified Educational System.
            </h1>
            
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Boost Efficiency, Empower Staff, Engage Parents, and Nurture Students — from one unified, integrated platform.
            </p>

            {/* CTA Button */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link 
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition hover:shadow-lg"
                href="/signup"
              >
                Get Started for Free
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                href="/login?force=1"
              >
                Sign In <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </div>

            {/* 2x2 Feature Checkmark Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pt-6 border-t border-slate-100 w-full">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="flex size-4 items-center justify-center rounded-full bg-blue-50 text-blue-600">✓</span>
                <span>Complete Admin Control</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="flex size-4 items-center justify-center rounded-full bg-blue-50 text-blue-600">✓</span>
                <span>Instant Parent Notices</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="flex size-4 items-center justify-center rounded-full bg-blue-50 text-blue-600">✓</span>
                <span>Smart Fee Challans</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="flex size-4 items-center justify-center rounded-full bg-blue-50 text-blue-600">✓</span>
                <span>Segmented Learning</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    {/* Horizontal ribbon matching Screen 5 footer of hero */}
    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 py-4 border-b border-slate-200/80 bg-slate-50/80 text-sm font-bold text-slate-800" id="testimonials">
      <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
      <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
      <Link href="/signup" className="hover:text-blue-600 transition-colors">Request a Demo</Link>
    </div>

    <section className="logo-strip"><span>Designed for the rhythm of</span><b>MATRIC</b><b>CAMBRIDGE</b><b>PRIVATE SCHOOLS</b><b>ACADEMIES</b></section>
    <section className="feature-section" id="features"><div className="section-intro"><span className="section-kicker">Less admin. More teaching.</span><h2>The daily school work, <em>made lighter.</em></h2><p>One clear operating layer for teachers, administrators, and families — designed around the moments that matter.</p></div><div className="feature-grid"><Feature href="/login?next=/teacher" icon={<Zap />} title="1-Click Digital Haziri" text="30-second class attendance with instant WhatsApp absent alerts." /><Feature href="/login?next=/admin/fees" icon={<CreditCard />} title="3-Copy Bank Fee Challans" text="1-click generation, automated WhatsApp reminders, zero SMS balance costs." /><Feature href="/login?next=/teacher/diary" icon={<Mic />} title="Urdu & English Audio Diaries" text="Teachers record 10-second voice notes that broadcast directly to parents." /><Feature href="/login?next=/parent" icon={<Bot />} title="24/7 Gemini AI Parent Companion" text="Parents ask about progress, syllabus, and marks in Roman Urdu." /></div></section>
    <section className="pricing-section" id="pricing"><div className="section-intro"><span className="section-kicker">Simple, local, transparent</span><h2>Plans that scale with<br /><em>your school.</em></h2><p>Start with the essentials. Add automation when your campus is ready.</p></div><div className="plans-grid">{plans.map(plan => <article className={`plan-card transition-all duration-200 hover:shadow-md hover:border-blue-500/60 ${plan.popular ? 'featured' : ''}`} key={plan.name}>{plan.popular && <div className="popular-ribbon">MOST POPULAR</div>}<span className="plan-name">{plan.name}</span><h3><small>Rs.</small>{plan.price}<small>/ month</small></h3><p className="plan-limit">{plan.limit}</p><div className="plan-divider" /> <ul>{plan.features.map(f => <li key={f}><Check />{f}</li>)}</ul><Link className={`landing-btn ${plan.popular ? 'primary' : 'outline'}`} href={`/signup?plan=${plan.name}`}>Start 30-Day Free Trial <ArrowRight /></Link></article>)}</div></section>
    <section className="faq-section" id="faq"><div className="faq-intro"><span className="section-kicker">Questions, answered</span><h2>Ready when<br /><em>you are.</em></h2><p>Still curious? Our team can walk you through the full school workflow in five minutes.</p><a className="landing-btn primary" href={`${whatsapp}?text=Hello%20EduFlow%2C%20I%20have%20a%20question.`}>Chat with our team <MessageCircle /></a></div><div className="faq-list">{faqs.map(([question, answer], i) => <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={question}><button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}><span>{question}</span><ChevronDown /></button>{openFaq === i && <p>{answer}</p>}</div>)}</div></section>
    
    <footer className="landing-footer">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 w-full py-8 text-left border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <Link className="landing-logo mb-2 inline-flex" href="/"><span className="crest-emblem"><AcademicCrest className="size-5" /></span><strong>EduFlow <em>OS</em></strong></Link>
          <p className="text-xs text-slate-500 mt-2">Next-generation operating system built specifically for Pakistani schools.</p>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">Campus Admin</span>
          <Link href="/login?next=/admin" className="text-slate-600 hover:text-blue-600 transition-colors">Admin Overview</Link>
          <Link href="/login?next=/admin/students" className="text-slate-600 hover:text-blue-600 transition-colors">Student Register</Link>
          <Link href="/login?next=/admin/attendance" className="text-slate-600 hover:text-blue-600 transition-colors">Daily Attendance</Link>
          <Link href="/login?next=/admin/fees" className="text-slate-600 hover:text-blue-600 transition-colors">Fee Challans</Link>
          <Link href="/login?next=/admin/finance" className="text-slate-600 hover:text-blue-600 transition-colors">Finance Ledger</Link>
          <Link href="/login?next=/admin/billing" className="text-slate-600 hover:text-blue-600 transition-colors">Billing &amp; Plan</Link>
          <Link href="/login?next=/admin/settings" className="text-slate-600 hover:text-blue-600 transition-colors">Campus Settings</Link>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">Classroom &amp; Home</span>
          <Link href="/login?next=/teacher" className="text-slate-600 hover:text-blue-600 transition-colors">Teacher Haziri Console</Link>
          <Link href="/login?next=/teacher/diary" className="text-slate-600 hover:text-blue-600 transition-colors">Audio Voice Diary</Link>
          <Link href="/login?next=/teacher/gradebook" className="text-slate-600 hover:text-blue-600 transition-colors">Gradebook &amp; Marks</Link>
          <Link href="/login?next=/parent" className="text-slate-600 hover:text-blue-600 transition-colors">Parent Learning Space</Link>
          <Link href="/login?next=/parent#ai" className="text-slate-600 hover:text-blue-600 transition-colors">24/7 AI Companion</Link>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">Platform</span>
          <Link href="/signup" className="text-blue-600 font-bold hover:underline">Start 30-Day Free Trial</Link>
          <Link href="/login?force=1" className="text-slate-600 hover:text-blue-600 transition-colors">Account Sign In</Link>
          <Link href="/login?next=/super-admin" className="text-slate-600 hover:text-blue-600 transition-colors">Super Admin Control Plane</Link>
          <a href={`${whatsapp}?text=Hello%20EduFlow%2C%20I%20want%20to%20book%20a%20demo.`} className="text-slate-600 hover:text-blue-600 transition-colors">WhatsApp Support (03127803616)</a>
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
    <Link href={href} className="feature-card group block no-underline transition hover:scale-[1.02] hover:shadow-md hover:border-blue-500/50">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="inline-flex items-center text-xs font-semibold text-blue-600 mt-2">
        Open Module <ArrowRight className="ml-1 size-3 transition group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
