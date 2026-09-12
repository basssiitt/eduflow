'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AcademicCrest,
} from '@/components/academic-crest'
import {
  ArrowRight,
  Calculator,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileSpreadsheet,
  Globe,
  HelpCircle,
  Laptop,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

const PLANS = [
  {
    name: 'Starter Campus',
    pricePKR: '2,500',
    frequency: 'per month',
    capacity: 'Up to 1,000 Students',
    description: 'Perfect for standalone primary schools, academies, and tuition centers starting digital management.',
    popular: false,
    cta: 'Start 30-Day Free Trial',
    features: [
      '1-Click Haziri Attendance Register',
      'Audio & Text Homework Diaries',
      'Student Directory & Roll Numbers',
      'Faculty Profiles & Duty Roster',
      'Basic Marks & Report Cards',
      'Offline-First Local Storage Mode',
      'WhatsApp Support Desk',
    ],
  },
  {
    name: 'Pro Campus',
    pricePKR: '5,000',
    frequency: 'per month',
    capacity: 'Up to 2,500 Students',
    description: 'Comprehensive solution for established private schools, matriculation colleges, and O-Level campuses.',
    popular: true,
    cta: 'Get Started with Pro',
    features: [
      'Everything in Starter Campus',
      '3-Copy Automated Fee Challans (Bank/School/Student)',
      '1-Click WhatsApp Fee & Absent Broadcasts',
      'Online Admissions Portal (/apply)',
      'Master Timetable Builder & Conflict Guard',
      'Board-Compliant Marks (BISE & Cambridge)',
      'Staff Payroll & Operational P&L Ledger',
      'Excel / CSV Bulk Student & Fee Import',
      'Dedicated Campus Priority Onboarding',
    ],
  },
  {
    name: 'Multi-Branch Network',
    pricePKR: '12,000',
    frequency: 'per month',
    capacity: 'Unlimited Students & Campuses',
    description: 'Designed for school groups, regional franchises, and multi-campus college networks.',
    popular: false,
    cta: 'Contact Network Sales',
    features: [
      'Everything in Pro Campus',
      'Super Admin Multi-Tenant Governance Dashboard',
      'Consolidated Fee Recovery & Arrears Audit',
      'Inter-Branch Student Transfer Registry',
      '24/7 Gemini AI Bilingual Parent Companion',
      'Custom Subdomain / Branded Domain',
      'Online Debit / Credit Card Fee Gateway',
      'Biometric / RFID Attendance Hardware Integration',
      'Dedicated Enterprise Account Manager',
    ],
  },
]

export default function PricingPage() {
  const [studentCount, setStudentCount] = useState(850)
  const [feePerStudent, setFeePerStudent] = useState(4500)

  // ROI Calculator Math
  // Monthly paper, printing, SMS & clerical cost in traditional manual operations
  const paperChallanPrintingCost = Math.round(studentCount * 15) // Rs 15 per 3-copy printed booklet
  const manualSmsCost = Math.round(studentCount * 8) // Rs 8/mo on bulk SMS gateways
  const clerkTimeSaved = Math.round(25000) // 1 clerical staff salary saved/reallocated
  const totalManualMonthlyExpense = paperChallanPrintingCost + manualSmsCost + clerkTimeSaved
  const eduflowProCost = 5000
  const netMonthlySavings = Math.max(0, totalManualMonthlyExpense - eduflowProCost)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-18 items-center justify-between border-b border-slate-200/90 bg-white/95 px-6 backdrop-blur-md lg:px-12">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <AcademicCrest className="size-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900">EduFlow OS</span>
            <span className="ml-2 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              Commercial License
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            Request Demo
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800">
            <Sparkles className="size-3.5" /> Transparent Institutional Pricing
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Predictable School Pricing in PKR. Zero Hidden Charges.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600">
            Choose the subscription tier for your campus size. All plans include 30 days of risk-free trial, unlimited teacher accounts, and seamless WhatsApp communication.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 bg-white relative ${
                plan.popular
                  ? 'border-blue-600 shadow-xl shadow-blue-500/10 ring-2 ring-blue-600'
                  : 'border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-xs">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-xs text-slate-500 min-h-[36px]">{plan.description}</p>

                <div className="mt-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">PKR</span>
                    <span className="text-4xl font-black tracking-tight text-slate-900">{plan.pricePKR}</span>
                    <span className="text-xs font-semibold text-slate-500">/{plan.frequency}</span>
                  </div>
                  <span className="inline-block mt-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                    {plan.capacity}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                    What&apos;s Included:
                  </span>
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href={`/signup?plan=${encodeURIComponent(plan.name)}`}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition shadow-xs ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive ROI Calculator for Campus Directors */}
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 p-7 sm:p-10 shadow-lg mb-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              <Calculator className="size-3.5" /> Institutional ROI Calculator
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              See How Much EduFlow Saves Your School Every Month
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Traditional schools spend tens of thousands of rupees on pre-printed carbon fee books, bulk SMS credits, and administrative clerical hours. Slide to calculate your campus savings:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                  <span>Enrolled Student Strength:</span>
                  <span className="text-base text-blue-600 font-black">{studentCount} Students</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="3000"
                  step="50"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>150 Students (Small Campus)</span>
                  <span>1,500</span>
                  <span>3,000 (Major Network)</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
                <span className="font-bold text-slate-900 block">Monthly Expenses Eliminated by EduFlow:</span>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Printed 3-Copy Challans:</span>
                  <span className="font-bold text-slate-800">PKR {paperChallanPrintingCost.toLocaleString()}/mo</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Bulk SMS Credits (Replaced with WhatsApp):</span>
                  <span className="font-bold text-slate-800">PKR {manualSmsCost.toLocaleString()}/mo</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Fee Ledger Reconciliation Labor Hours:</span>
                  <span className="font-bold text-slate-800">PKR {clerkTimeSaved.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

            {/* Right Result Banner */}
            <div className="lg:col-span-6 rounded-2xl border-2 border-emerald-500 bg-white p-6 sm:p-8 text-center shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                Estimated Net Campus Savings
              </span>
              <p className="mt-2 text-4xl sm:text-5xl font-black text-emerald-600">
                PKR {netMonthlySavings.toLocaleString()}
              </p>
              <span className="text-xs font-semibold text-slate-500 block mt-1">
                Saved every month (after paying EduFlow Pro subscription)
              </span>

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Claim Your Savings — Free Trial <ArrowRight className="size-3.5" />
                </Link>
                <a
                  href={`https://wa.me/923127803616?text=Hello%2C%20I%20calculated%20PKR%20${netMonthlySavings.toLocaleString()}%20monthly%20savings%20for%20my%20${studentCount}%20students%20school.%20Please%20schedule%20a%20walkthrough.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <MessageCircle className="size-3.5 text-emerald-600" /> WhatsApp Sales
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Interactive Tour Links */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-8 sm:p-10 text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-bold text-blue-300">
            <Laptop className="size-3.5" /> Zero Setup Barrier
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Explore? Test Drive Any Portal in 1 Click
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Experience why hundreds of school administrators, teachers, and parents love EduFlow OS. Test the live portals right now:
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/admin"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs"
            >
              School Admin Portal →
            </Link>
            <Link
              href="/teacher"
              className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              Teacher Console →
            </Link>
            <Link
              href="/student"
              className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              Student Space →
            </Link>
            <Link
              href="/parent"
              className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              Parent Portal →
            </Link>
            <Link
              href="/super-admin"
              className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              Super Admin Multi-Tenant →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
