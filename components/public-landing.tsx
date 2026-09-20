'use client'

import Image from 'next/image'
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
  Mail,
  Mic,
  Receipt,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { AcademicCrest } from '@/components/academic-crest'
import { supabaseClient } from '@/lib/supabaseClient'

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
      'Automated SMS & Bell Notification Alerts',
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
    'Can parents receive automated absent alerts on their phones?',
    'Yes. EduFlow broadcasts instant attendance and fee alerts directly via automated SMS and mobile notifications with transparent logging.',
  ],
]

export function PublicLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)

  const handleSignUpClick = async (e?: React.MouseEvent, targetUrl: string = '/signup') => {
    if (e) e.preventDefault()
    try {
      if (supabaseClient) {
        await supabaseClient.auth.signOut({ scope: 'global' })
      }
    } catch {}
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear()
        localStorage.removeItem('eduflow-user-email')
        localStorage.removeItem('eduflow-user-role')
        document.cookie = 'eduflow-user-email=; path=/; max-age=0'
        document.cookie = 'eduflow-user-role=; path=/; max-age=0'
      } catch {}
      window.location.assign(targetUrl)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200/90 bg-white/95 px-6 backdrop-blur-md lg:px-12">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-600 shadow-xs">
            <Image src="/eduflow-logo.svg" alt="EduFlow" width={40} height={40} className="size-10" />
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
            onClick={handleSignUpClick}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section with Left Text & Right iPhone Mockup */}
      <section className="relative overflow-hidden bg-white py-12 lg:py-20 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Copy, Badges & Feature Checkmarks */}
            <div className="lg:col-span-6 flex flex-col items-start text-left order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 mb-4 shadow-2xs">
                <Sparkles className="size-3.5 text-blue-600" />
                <span>30-Day Free Pro Trial • No Credit Card Required</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                EduFlow: The Unified Educational System.
              </h1>
              
              <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Boost Efficiency, Empower Staff, Engage Parents, and Nurture Students — from one unified, integrated platform designed for Pakistani schools.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition hover:shadow-lg cursor-pointer"
                >
                  Start 30-Day Free Trial <ArrowRight className="ml-2 size-4" />
                </button>
                <Link
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                  href="/login?force=1"
                >
                  Sign In to Portals
                </Link>
              </div>

              {/* 2x2 Feature Checklist with Blue Icons */}
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

            {/* Right Column: Clean High-Resolution Tilted iPhone Mockup showing Parent Portal */}
            <div className="lg:col-span-6 flex justify-center items-center order-2 py-4">
              <div className="relative mx-auto w-full max-w-[440px] flex justify-center items-center">
                {/* Soft ambient glow behind the tilted device */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                <Image
                  src="/eduflow-parent-portal-hero.png"
                  alt="EduFlow Parents Portal mobile application mockup on tilted iPhone"
                  width={617}
                  height={885}
                  priority
                  className="relative z-10 w-full max-w-[360px] sm:max-w-[410px] h-auto object-contain drop-shadow-[0_24px_36px_rgba(15,23,42,0.18)]"
                />
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
                Capture class attendance in 30 seconds with automatic instant SMS absent alerts to parents.
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

                <button
                  type="button"
                  onClick={(e) => handleSignUpClick(e, `/signup?plan=${encodeURIComponent(plan.name)}`)}
                  className={`mt-8 flex w-full items-center justify-center rounded-xl py-3 text-xs font-bold transition cursor-pointer ${
                    plan.popular
                      ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                      : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Start 30-Day Free Trial
                </button>
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

      {/* Comprehensive Institutional SaaS Footer */}
      <footer className="bg-white py-14 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-200">
            {/* Column 1: Brand & Pakistan Trust */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                  <AcademicCrest className="size-5" />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">EduFlow OS</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Pakistan&apos;s premier 1-click AI school management system &amp; operating system for K-12 schools, colleges, and academies.
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                <span>🇵🇰 Proudly Engineered for Pakistan</span>
              </div>
            </div>

            {/* Column 2: Core Modules */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Core Modules</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="/admin" className="hover:text-blue-600">Campus Admin Portal</Link></li>
                <li><Link href="/admin/students" className="hover:text-blue-600">Student Directory</Link></li>
                <li><Link href="/admin/attendance" className="hover:text-blue-600">1-Click Haziri Attendance</Link></li>
                <li><Link href="/admin/fees" className="hover:text-blue-600">3-Copy Bank Challans</Link></li>
                <li><Link href="/admin/timetable" className="hover:text-blue-600">Master Timetable</Link></li>
                <li><Link href="/admin/exams" className="hover:text-blue-600">Examinations &amp; Reports</Link></li>
              </ul>
            </div>

            {/* Column 3: Dedicated Portals */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">User Portals</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="/admin" className="hover:text-blue-600">School Admin</Link></li>
                <li><Link href="/teacher" className="hover:text-blue-600">Teacher Console</Link></li>
                <li><Link href="/parent" className="hover:text-blue-600">Parent Portal</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-600">Pricing &amp; Calculator</Link></li>
                <li><button type="button" onClick={(e) => handleSignUpClick(e)} className="hover:text-blue-600 font-semibold text-blue-600 cursor-pointer bg-transparent border-0 p-0 text-xs">30-Day Free Pro Trial</button></li>
              </ul>
            </div>

            {/* Column 4: Legal & Policies */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Legal &amp; Compliance</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="/terms" className="hover:text-blue-600 font-medium">Terms &amp; Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600 font-medium">Privacy Policy</Link></li>
                <li><Link href="/refund-policy" className="hover:text-blue-600 font-medium">Refund &amp; Cancellation</Link></li>
                <li><span className="text-slate-400">Student Data Security</span></li>
                <li><span className="text-slate-400">100% Data Sovereignty</span></li>
              </ul>
            </div>

            {/* Column 5: Direct Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Direct Support</h4>
              <p className="text-xs text-slate-500 mb-3">
                Talk directly with our local implementation team:
              </p>
              <a
                href="mailto:support@eduflow.pk?subject=EduFlow%20Inquiry"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition"
              >
                <Mail className="size-3.5" /> support@eduflow.pk
              </a>
              <p className="mt-2 text-[11px] text-slate-400">
                Direct phone: +92 312 7803616
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-500">
            <p>© 2026 EduFlow OS. All rights reserved. Registered Educational Technology System in Pakistan.</p>
            <div className="flex flex-wrap items-center gap-5 font-medium">
              <Link href="/terms" className="hover:text-blue-600 transition">Terms</Link>
              <Link href="/privacy" className="hover:text-blue-600 transition">Privacy</Link>
              <Link href="/refund-policy" className="hover:text-blue-600 transition">Refunds</Link>
              <Link href="/pricing" className="hover:text-blue-600 transition">Pricing</Link>
              <button type="button" onClick={(e) => handleSignUpClick(e)} className="hover:text-blue-600 transition font-semibold text-blue-600 cursor-pointer bg-transparent border-0 p-0 text-xs">Start 30-Day Free Trial</button>
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
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
                const subject = encodeURIComponent(`EduFlow Demo Request - ${school}`)
                const body = encodeURIComponent(`Hello EduFlow Team,\n\nI am ${name} from ${school} (${city}) with ~${students} students. I would like to schedule an EduFlow demo walkthrough.\n\nThank you!`)
                window.location.href = `mailto:demo@eduflow.pk?subject=${subject}&body=${body}`
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
                >
                  <Mail className="size-4" /> Request Demo Walkthrough
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
