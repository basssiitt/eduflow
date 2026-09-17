'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  ExternalLink,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Mic,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { AcademicCrest } from '@/components/academic-crest'

const whatsapp = 'https://wa.me/923127803616'

const plans = [
  {
    name: 'Starter',
    price: '2,500',
    limit: 'Up to 1,000 Students',
    features: [
      '1-Click Attendance Register',
      'Audio & Text Homework Diaries',
      'Basic Gradebook & Marks Entry',
      'Student Identity & Roll Call',
    ],
  },
  {
    name: 'Pro',
    price: '5,000',
    limit: 'Up to 2,500 Students',
    popular: true,
    features: [
      'Everything in Starter',
      '1-Click Automated Fee Challans (3-Copy)',
      'Automated WhatsApp Absent & Fee Alerts',
      'Term Examination Report Cards',
      'Staff Payroll & Operational Ledger',
    ],
  },
  {
    name: 'Enterprise',
    price: '12,000',
    limit: 'Unlimited Students',
    features: [
      'Everything in Pro',
      '24/7 Gemini AI Parent Companion',
      'Universal Cloud Sync & Offline Mode',
      'Online Debit/Credit Fee Gateway',
      'Custom Campus Branded Domain',
      'Priority Implementation & Training',
    ],
  },
]

const faqs = [
  [
    'What happens during internet downtime?',
    'EduFlow keeps essential actions available offline. Attendance and daily marks can be captured instantly and sync automatically when internet connectivity returns.',
  ],
  [
    'Can we import our existing student and fee data from Excel?',
    'Yes. We support 1-click Excel and CSV bulk data imports for students, classes, fee arrears, and staff records with automatic schema validation.',
  ],
  [
    'Do WhatsApp absent notifications cost extra credits?',
    'No separate SMS balance is needed. EduFlow broadcasts directly through WhatsApp with transparent institutional logging and zero SMS balance fees.',
  ],
]

export function PublicLanding() {
  const [activePortalTab, setActivePortalTab] = useState<'admin' | 'teacher' | 'parent'>('admin')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200/90 bg-white/95 px-6 backdrop-blur-md lg:px-12">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <AcademicCrest className="size-6" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">EduFlow</span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
          <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing &amp; ROI</Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login?force=1"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
          >
            Log In
          </Link>
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
          >
            Request a Demo
          </button>
        </div>
      </nav>

      {/* Hero Section matching Screen 5 */}
      <section className="relative overflow-hidden bg-white py-12 lg:py-20 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Interactive Product Showcase Inside iPhone Mockup */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <div className="relative mx-auto w-full max-w-[390px] rounded-[50px] border-[10px] border-slate-900 bg-slate-900 p-2.5 shadow-2xl shadow-slate-950/25 ring-1 ring-slate-800">
                {/* Dynamic Island Notch & iOS Status Bar */}
                <div className="flex items-center justify-between px-3 pt-1 pb-2 text-[11px] font-bold text-white">
                  <span>9:41</span>
                  <div className="flex h-5 w-24 items-center justify-between rounded-full bg-black px-2">
                    <span className="size-2 rounded-full bg-slate-800" />
                    <span className="size-1.5 rounded-full bg-blue-950 ring-1 ring-emerald-500/40" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>5G</span>
                    <span className="inline-block size-2 rounded-full bg-white" />
                  </div>
                </div>

                {/* iPhone Screen Content */}
                <div className="rounded-[38px] bg-white p-4 shadow-inner">
                  {/* Institutional Header & Portal Switcher */}
                  <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-slate-800">EduFlow Mobile OS</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">Beaconhouse Scholars</span>
                    </div>

                    {/* Portal Switcher Tabs */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold text-center">
                      <button
                        type="button"
                        onClick={() => setActivePortalTab('admin')}
                        className={`py-1 rounded-lg transition cursor-pointer ${activePortalTab === 'admin' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePortalTab('teacher')}
                        className={`py-1 rounded-lg transition cursor-pointer ${activePortalTab === 'teacher' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        Teacher
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePortalTab('parent')}
                        className={`py-1 rounded-lg transition cursor-pointer ${activePortalTab === 'parent' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        Parent
                      </button>
                    </div>
                  </div>

                {/* Tab Content 1: Campus Admin Dashboard Preview */}
                {activePortalTab === 'admin' && (
                  <div className="pt-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campus Control Console</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900">Term 2 Operations &amp; Fee Recovery</h4>
                      </div>
                      <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                        Explore Portal <ArrowRight className="size-3" />
                      </Link>
                    </div>

                    {/* 4 Live Metric Pills */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Enrolled</span>
                        <span className="text-xs font-black text-slate-900">1,240</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Collected</span>
                        <span className="text-xs font-black text-emerald-600">PKR 1.45M</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Recovery</span>
                        <span className="text-xs font-black text-blue-600">96.2%</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Faculty</span>
                        <span className="text-xs font-black text-purple-600">48 / 50</span>
                      </div>
                    </div>

                    {/* Visual Growth & Fee Curve */}
                    <div className="rounded-xl bg-gradient-to-br from-blue-50/50 to-slate-50 p-3 border border-blue-100/70 relative">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-1">
                        <span>Monthly Fee Realization Trend</span>
                        <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold text-[9px]">● Auto-Bank Challans Dispatched</span>
                      </div>
                      <svg className="w-full h-20 overflow-visible" viewBox="0 0 400 90" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="landingWave" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0 75 Q 100 20, 200 45 T 400 12 L 400 90 L 0 90 Z" fill="url(#landingWave)" />
                        <path d="M 0 75 Q 100 20, 200 45 T 400 12" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                        <circle cx="200" cy="45" r="4" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                      </svg>
                    </div>

                    {/* Real-time Challan & WhatsApp Automation Badge */}
                    <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70">
                      <div className="flex items-center gap-2">
                        <ReceiptText className="size-4 text-blue-600" />
                        <span className="font-semibold text-slate-800">3-Copy Bank Challan Batch</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        100% Synced
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Teacher Portal Preview */}
                {activePortalTab === 'teacher' && (
                  <div className="pt-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teacher Portal</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900">Class 4-A · Morning Attendance</h4>
                      </div>
                      <Link href="/teacher" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                        Explore Portal <ArrowRight className="size-3" />
                      </Link>
                    </div>

                    {/* 1-Click Attendance Student Register Simulation */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-700 pb-1.5 border-b border-slate-100 text-[11px]">
                        <span>Student Roll Call</span>
                        <span className="text-slate-400 font-normal">28 Present · 1 Absent</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <span className="font-semibold text-slate-800">01. Ahmed Raza</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Present</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <span className="font-semibold text-slate-800">02. Fatima Noor</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Present</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/60 border border-rose-200">
                          <span className="font-semibold text-slate-800">03. Bilal Hassan</span>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Absent ✉</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <span className="font-semibold text-slate-800">04. Zainab Ali</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Present</span>
                        </div>
                      </div>
                    </div>

                    {/* Audio Voice Diary Strip */}
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Mic className="size-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">Urdu &amp; English Voice Diary</span>
                          <span className="text-[10px] text-slate-500">Auto-dispatches homework to WhatsApp</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-200/60">
                        0:38 Voice Note
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Parents Portal Preview */}
                {activePortalTab === 'parent' && (
                  <div className="pt-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parents Portal</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900">Welcome, Parents Portal</h4>
                      </div>
                      <Link
                        href="/parent"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                      >
                        Explore Portal <ArrowRight className="size-3" />
                      </Link>
                    </div>

                    {/* Dual Student Cards Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Child 1: Ali Khan */}
                      <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                              AK
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">Ali Khan</div>
                              <div className="text-[10px] text-slate-500">Grade 4 · Sec A</div>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-1 border-t border-blue-100 pt-2 text-center">
                          <div><span className="text-[9px] text-slate-400">Attendance</span><div className="text-xs font-black text-slate-900">96%</div></div>
                          <div><span className="text-[9px] text-slate-400">Exam Grade</span><div className="text-xs font-black text-blue-600">88% (A)</div></div>
                          <div><span className="text-[9px] text-slate-400">Fee Slip</span><div className="text-xs font-black text-emerald-600">Paid ✓</div></div>
                        </div>
                      </div>

                      {/* Child 2: Fatima Khan */}
                      <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                              FK
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">Fatima Khan</div>
                              <div className="text-[10px] text-slate-500">Grade 2 · Sec B</div>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-1 border-t border-slate-100 pt-2 text-center">
                          <div><span className="text-[9px] text-slate-400">Attendance</span><div className="text-xs font-black text-slate-900">98%</div></div>
                          <div><span className="text-[9px] text-slate-400">Exam Grade</span><div className="text-xs font-black text-blue-600">92% (A+)</div></div>
                          <div><span className="text-[9px] text-slate-400">Fee Slip</span><div className="text-xs font-black text-emerald-600">Paid ✓</div></div>
                        </div>
                      </div>
                    </div>

                    {/* Instant Fee Challan & WhatsApp Diary Pill */}
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                      <div className="flex items-center justify-between text-xs text-slate-700">
                        <span className="font-semibold">September 3-Copy Bank Challan</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Paid via Meezan Bank</span>
                      </div>
                    </div>
                  </div>
                )}
                </div>

                {/* iOS Home Indicator Bar */}
                <div className="mt-2.5 flex justify-center pb-1">
                  <span className="h-1 w-28 rounded-full bg-slate-600" />
                </div>
              </div>
            </div>

            {/* Right Column: Hero Copy & Feature Checkmarks (Screen 5) */}
            <div className="lg:col-span-6 flex flex-col items-start text-left order-1 lg:order-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                EduFlow: The Unified Educational System.
              </h1>
              
              <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Boost Efficiency, Empower Staff, Engage Parents, and Nurture Students — from one unified, integrated platform.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link 
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition hover:shadow-lg"
                  href="/signup"
                >
                  Get Started for Free <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                  href="/login?force=1"
                >
                  Sign In to Portals
                </Link>
              </div>

              {/* 2x2 Feature Checklist with Blue Icons from Mockup */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 pt-6 border-t border-slate-100 w-full">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200">✓</span>
                  <span>Complete Admin Control</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200">✓</span>
                  <span>Simplify Classroom Tools</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200">✓</span>
                  <span>Connected Parent Services</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200">✓</span>
                  <span>Segmented Learning</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Ribbon from Mockup Screen 5 Footer */}
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 py-4 border-b border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-2xs" id="testimonials">
        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
        <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
        <button
          type="button"
          onClick={() => setIsDemoModalOpen(true)}
          className="hover:text-blue-600 transition-colors cursor-pointer"
        >
          Request a Demo
        </button>
      </div>

      {/* 3 Dedicated Portals Explorer Grid */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200/80" id="portals">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Dedicated Workspaces
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            One Platform. Three Purpose-Built Portals.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Experience role-specific operating consoles designed with precision for school directors, teachers, and parents.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Portal 1: Campus Admin */}
            <Link
              href="/admin"
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-blue-500 hover:shadow-md no-underline"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <LayoutDashboard className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Campus Admin Portal</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Annual platform growth wave analytics, automated 3-copy fee challan slips, faculty attendance, and P&amp;L ledger.
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                Explore Campus Admin →
              </span>
            </Link>

            {/* Portal 2: Teacher Portal */}
            <Link
              href="/teacher"
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-blue-500 hover:shadow-md no-underline"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <CalendarCheck className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Teacher Portal</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                30-second digital classroom attendance, Urdu audio voice diary broadcast, and course performance metrics.
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                Explore Teacher Portal →
              </span>
            </Link>

            {/* Portal 3: Parents Portal */}
            <Link
              href="/parent"
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-blue-500 hover:shadow-md no-underline"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <Users className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Parents Portal</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Multi-child student profiles, online fee payment gateway, 3-copy challan receipts, and AI companion.
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                Explore Parents Portal →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200/80" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Built for Pakistani Schools</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
              Less Admin Overhead. More Quality Teaching.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Designed around daily school routines — from morning haziri registers to monthly bank fee collections.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md transition">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                <Zap className="size-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">1-Click Digital Haziri</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Capture class attendance in 30 seconds with automatic instant WhatsApp absent alerts to parents.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md transition">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                <CreditCard className="size-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">3-Copy Bank Challans</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Print compliant Bank/School/Parent 3-face fee challans with 1-Bill PSID numbers and online debit card pay.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md transition">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                <Mic className="size-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Voice Diary Recording</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Teachers speak their classroom homework notes in Urdu or English; parents listen directly on their portal.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md transition">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                <Bot className="size-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Gemini AI Companion</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                24/7 AI chatbot answering parent queries about term grades, syllabus, fee arrears, and exam dates in Roman Urdu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200/80" id="pricing">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Local &amp; Transparent</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
              Plans Built to Scale with Your Campus
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Start with classroom essentials. Unlock complete campus automation when you are ready.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 bg-white border transition duration-200 ${
                  plan.popular
                    ? 'border-2 border-blue-600 shadow-xl ring-2 ring-blue-600/10'
                    : 'border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-[11px] font-bold text-white uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{plan.limit}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-slate-500">Rs.</span>
                  <span className="text-4xl font-black tracking-tight text-slate-900">{plan.price}</span>
                  <span className="text-xs font-medium text-slate-500">/ month</span>
                </div>

                <div className="my-6 border-t border-slate-100" />

                <ul className="space-y-3 text-xs text-slate-700">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="size-4 shrink-0 text-blue-600 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/signup?plan=${plan.name}`}
                  className={`mt-8 flex w-full items-center justify-center rounded-xl py-3 text-xs font-bold transition ${
                    plan.popular
                      ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                      : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Start 30-Day Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200/80" id="faq">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Frequently Asked</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Questions &amp; Answers</h2>
          </div>

          <div className="divide-y divide-slate-200">
            {faqs.map(([q, a], idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left text-sm sm:text-base font-bold text-slate-900"
                  >
                    <span>{q}</span>
                    <ChevronDown className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Clean Modern SaaS Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <AcademicCrest className="size-6 text-blue-600" />
                <span className="text-base font-black text-slate-900">EduFlow</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The Unified Educational System designed for modern educational institutions in Pakistan.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Administrative</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="/admin" className="hover:text-blue-600">Campus Admin Portal</Link></li>
                <li><Link href="/admin/admissions" className="hover:text-blue-600">Admissions Desk</Link></li>
                <li><Link href="/admin/students" className="hover:text-blue-600">Student Directory</Link></li>
                <li><Link href="/admin/timetable" className="hover:text-blue-600">Master Timetable</Link></li>
                <li><Link href="/admin/exams" className="hover:text-blue-600">Examinations &amp; Reports</Link></li>
                <li><Link href="/admin/fees" className="hover:text-blue-600">Fee Challans (3-Copy)</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Portals &amp; Pricing</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="/admin" className="hover:text-blue-600">Campus Admin</Link></li>
                <li><Link href="/teacher" className="hover:text-blue-600">Teacher Portal</Link></li>
                <li><Link href="/parent" className="hover:text-blue-600">Parents Portal</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-600">Commercial Pricing &amp; ROI</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Direct Support</h4>
              <p className="text-xs text-slate-500 mb-3">
                Reach our local technical implementation team on WhatsApp:
              </p>
              <a
                href={`${whatsapp}?text=Hello%20EduFlow%20Team%2C%20I%20want%20to%20schedule%20a%20demo.`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700"
              >
                <MessageCircle className="size-3.5" /> 0312-7803616
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-400">
            <p>© 2026 EduFlow Systems. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/pricing" className="hover:text-blue-600">Pricing &amp; Calculator</Link>
              <Link href="/login?force=1" className="hover:text-blue-600">Portal Login</Link>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="hover:text-blue-600 cursor-pointer"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Request a Demo Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <AcademicCrest className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Request Institutional Demo</h3>
                <p className="text-xs text-slate-500">Live 1-on-1 walkthrough for School Principals &amp; Directors</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const school = (form.elements.namedItem('school') as HTMLInputElement)?.value || 'My School'
                const name = (form.elements.namedItem('name') as HTMLInputElement)?.value || 'Admin'
                const city = (form.elements.namedItem('city') as HTMLInputElement)?.value || 'Karachi'
                const students = (form.elements.namedItem('students') as HTMLSelectElement)?.value || '500'
                const text = encodeURIComponent(`Hello EduFlow Team, I am ${name} from ${school} (${city}) with ~${students} students. I would like to schedule an EduFlow demo walkthrough.`)
                window.open(`https://wa.me/923127803616?text=${text}`, '_blank', 'noopener,noreferrer')
                setIsDemoModalOpen(false)
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">School / Institution Name</label>
                <input
                  name="school"
                  required
                  placeholder="e.g. Beaconhouse Scholars Academy"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name &amp; Designation</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Principal Asim"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus City</label>
                  <input
                    name="city"
                    required
                    placeholder="Karachi, Lahore, etc."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Approx. Student Body Count</label>
                <select
                  name="students"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 text-xs focus:border-blue-600 focus:outline-none bg-white"
                >
                  <option value="250">Up to 250 Students</option>
                  <option value="750">250 – 750 Students</option>
                  <option value="1500">750 – 1,500 Students</option>
                  <option value="3000">1,500+ Students (Multi-Campus)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                >
                  <MessageCircle className="size-4" /> Schedule WhatsApp Demo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
