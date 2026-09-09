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
      'Multi-Campus Tenant Control Plane',
      'Universal Cloud Sync & Offline Mode',
      'Online Debit/Credit Fee Gateway',
      'Custom Campus Branded Domain',
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
  const [activePortalTab, setActivePortalTab] = useState<'parent' | 'admin' | 'teacher' | 'superadmin'>('parent')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar matching Mockup Screen 5 */}
      <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200/90 bg-white/95 px-6 backdrop-blur-md lg:px-12">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <AcademicCrest className="size-6" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">EduFlow</span>
        </Link>

        {/* Center Navigation Links from Mockup */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          <a href="#portals" className="hover:text-blue-600 transition-colors">Requests</a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login?force=1"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            Request a Demo
          </Link>
        </div>
      </nav>

      {/* Hero Section matching Screen 5 */}
      <section className="relative overflow-hidden bg-white py-12 lg:py-20 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Interactive Product Showcase Card (SaaS Preview - NO FAKE PHONE FRAME) */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/60">
                {/* Showcase Header with Window Dots & Portal Tabs */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-400" />
                    <span className="size-2.5 rounded-full bg-amber-400" />
                    <span className="size-2.5 rounded-full bg-emerald-400" />
                  </div>

                  {/* Portal Switcher Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                    <button
                      onClick={() => setActivePortalTab('parent')}
                      className={`px-2.5 py-1 rounded-lg transition ${activePortalTab === 'parent' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Parent
                    </button>
                    <button
                      onClick={() => setActivePortalTab('admin')}
                      className={`px-2.5 py-1 rounded-lg transition ${activePortalTab === 'admin' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => setActivePortalTab('teacher')}
                      className={`px-2.5 py-1 rounded-lg transition ${activePortalTab === 'teacher' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Teacher
                    </button>
                    <button
                      onClick={() => setActivePortalTab('superadmin')}
                      className={`px-2.5 py-1 rounded-lg transition ${activePortalTab === 'superadmin' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Super Admin
                    </button>
                  </div>
                </div>

                {/* Tab Content 1: Parent Portal Preview (Screen 4 / 5) */}
                {activePortalTab === 'parent' && (
                  <div className="pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Welcome,</span>
                        <h4 className="text-base font-black text-slate-900">Sarah Miller</h4>
                        <span className="text-xs text-slate-500 font-medium">Two Students Enrolled</span>
                      </div>
                      <Link
                        href="/parent"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                      >
                        Open Portal <ArrowRight className="size-3" />
                      </Link>
                    </div>

                    {/* Dual Student Cards Preview (Liam & Ava Miller) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Child 1: Liam Miller */}
                      <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                              LM
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">Liam Miller</div>
                              <div className="text-[10px] text-slate-500">Grade 4 · Sec A</div>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-1 border-t border-blue-100 pt-2 text-center">
                          <div><span className="text-[9px] text-slate-400">Status</span><div className="text-xs font-black text-slate-900">23</div></div>
                          <div><span className="text-[9px] text-slate-400">Grades</span><div className="text-xs font-black text-blue-600">76%</div></div>
                          <div><span className="text-[9px] text-slate-400">Total</span><div className="text-xs font-black text-slate-900">10</div></div>
                          <div><span className="text-[9px] text-slate-400">Fee</span><div className="text-xs font-black text-emerald-600">100%</div></div>
                        </div>
                      </div>

                      {/* Child 2: Ava Miller */}
                      <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                              AM
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">Ava Miller</div>
                              <div className="text-[10px] text-slate-500">Grade 2 · Sec B</div>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-1 border-t border-slate-100 pt-2 text-center">
                          <div><span className="text-[9px] text-slate-400">Status</span><div className="text-xs font-black text-slate-900">23</div></div>
                          <div><span className="text-[9px] text-slate-400">Grades</span><div className="text-xs font-black text-blue-600">76%</div></div>
                          <div><span className="text-[9px] text-slate-400">Total</span><div className="text-xs font-black text-slate-900">10</div></div>
                          <div><span className="text-[9px] text-slate-400">Fee</span><div className="text-xs font-black text-emerald-600">100%</div></div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Assignments Strip */}
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                      <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-slate-700">
                        <span>Recent Assignments</span>
                        <span className="text-slate-400 font-medium text-[11px]">Due Today</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Liam Math Algebra Chapter 4 Homework</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Submitted</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Admin Dashboard Preview (Screen 3) */}
                {activePortalTab === 'admin' && (
                  <div className="pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campus Admin</span>
                        <h4 className="text-base font-black text-slate-900">Annual Platform Growth</h4>
                      </div>
                      <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                        Open Portal <ArrowRight className="size-3" />
                      </Link>
                    </div>

                    {/* 4 Stats */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Students</span>
                        <span className="text-xs font-black text-slate-900">25,500</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Classes</span>
                        <span className="text-xs font-black text-slate-900">650</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Average</span>
                        <span className="text-xs font-black text-blue-600">84%</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Performance</span>
                        <span className="text-xs font-black text-emerald-600">85%</span>
                      </div>
                    </div>

                    {/* Blue Wave Chart */}
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60 relative">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                        <span>Platform Growth Curve</span>
                        <span className="text-blue-600 font-black">15,442 Active Students</span>
                      </div>
                      <svg className="w-full h-24 overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="landingWave" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0 80 Q 100 20, 200 50 T 400 15 L 400 100 L 0 100 Z" fill="url(#landingWave)" />
                        <path d="M 0 80 Q 100 20, 200 50 T 400 15" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                        <circle cx="200" cy="50" r="4" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Teacher Portal Preview (Screen 2) */}
                {activePortalTab === 'teacher' && (
                  <div className="pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teacher Console</span>
                        <h4 className="text-base font-black text-slate-900">Welcome, Professor Carter</h4>
                      </div>
                      <Link href="/teacher" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                        Open Portal <ArrowRight className="size-3" />
                      </Link>
                    </div>

                    {/* Course Cards Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-slate-200 p-2.5 bg-white">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">CS550</span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm">ACTIVE</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Enrolled: 27.4%</div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full w-[27%]" />
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-2.5 bg-white">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">CE596</span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm">ACTIVE</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Enrolled: 21%</div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full w-[21%]" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="size-4 text-blue-600" />
                        <span className="font-bold text-slate-800">Voice Diary Ready</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600">3 Classes Logged Today</span>
                    </div>
                  </div>
                )}

                {/* Tab Content 4: Super Admin Preview (Screen 1) */}
                {activePortalTab === 'superadmin' && (
                  <div className="pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Super Admin</span>
                        <h4 className="text-base font-black text-slate-900">Institutions Overview</h4>
                      </div>
                      <Link href="/super-admin" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                        Open Portal <ArrowRight className="size-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Campuses</span>
                        <span className="text-xs font-black text-slate-900">0085</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Revenue</span>
                        <span className="text-xs font-black text-emerald-600">15,70,000</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-bold">Sessions</span>
                        <span className="text-xs font-black text-blue-600">1,376</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800 pb-1 border-b border-slate-100">
                        <span>Institution Directory</span>
                        <span className="text-emerald-600 text-[10px]">● All Campuses Connected</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Beacon Scholars Main Campus</span>
                        <span className="font-mono text-[11px] font-bold text-slate-800">23 Students</span>
                      </div>
                    </div>
                  </div>
                )}
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
        <Link href="/signup" className="hover:text-blue-600 transition-colors">Request a Demo</Link>
      </div>

      {/* 4 Portals Explorer Grid */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200/80" id="portals">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Dedicated Workspaces
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            One Platform. Four Purpose-Built Portals.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Experience role-specific operating consoles designed with precision for school directors, teachers, and parents.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Portal 1: Super Admin */}
            <Link
              href="/super-admin"
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-blue-500 hover:shadow-md no-underline"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <Building2 className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Super Admin Console</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Multi-campus tenant directory, license provisioning, revenue telemetry, and root god-mode controls.
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                Explore Screen 1 →
              </span>
            </Link>

            {/* Portal 2: School Admin */}
            <Link
              href="/admin"
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-blue-500 hover:shadow-md no-underline"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <LayoutDashboard className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Campus Admin Portal</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Annual platform growth wave analytics, automated fee challan slips, faculty attendance, and P&amp;L ledger.
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                Explore Screen 3 →
              </span>
            </Link>

            {/* Portal 3: Teacher Console */}
            <Link
              href="/teacher"
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-blue-500 hover:shadow-md no-underline"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <CalendarCheck className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Teacher Haziri Console</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                30-second digital classroom attendance, Urdu audio voice diary broadcast, and course performance metrics.
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                Explore Screen 2 →
              </span>
            </Link>

            {/* Portal 4: Parent Portal */}
            <Link
              href="/parent"
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-blue-500 hover:shadow-md no-underline"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <Users className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Parents Learning Space</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Dynamic student cards (Liam &amp; Ava Miller), online fee payment gateway, 3-face challans, and AI companion.
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                Explore Screen 4 →
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
                <li><Link href="/super-admin" className="hover:text-blue-600">Super Admin (Screen 1)</Link></li>
                <li><Link href="/admin" className="hover:text-blue-600">Admin Portal (Screen 3)</Link></li>
                <li><Link href="/admin/students" className="hover:text-blue-600">Student Directory</Link></li>
                <li><Link href="/admin/fees" className="hover:text-blue-600">Fee Challans</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Classroom &amp; Home</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="/teacher" className="hover:text-blue-600">Teacher Console (Screen 2)</Link></li>
                <li><Link href="/teacher/diary" className="hover:text-blue-600">Voice Diary</Link></li>
                <li><Link href="/parent" className="hover:text-blue-600">Parents Portal (Screen 4)</Link></li>
                <li><Link href="/parent#ai" className="hover:text-blue-600">AI Companion</Link></li>
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
            <div className="flex items-center gap-6">
              <Link href="/login?force=1" className="hover:text-blue-600">Portal Login</Link>
              <Link href="/signup" className="hover:text-blue-600">Register Campus</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
