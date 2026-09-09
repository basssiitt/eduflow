'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Download,
  GraduationCap,
  Headphones,
  Heart,
  MessageCircle,
  ReceiptText,
  User,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type ChildProfile = {
  id: string
  name: string
  rollNo: string
  class: string
  section: string
  classTeacher: string
  attendanceRate: number
  termGrade: string
  gpa: string
  feeStatus: 'Paid' | 'Pending' | 'Overdue'
  monthlyFee: number
  lastDiaryNote: string
}

const registeredChildren: ChildProfile[] = [
  {
    id: 'child-01',
    name: 'Zain Ahmed',
    rollNo: '2026-012',
    class: 'Class 5',
    section: 'A',
    classTeacher: 'Ms. Ayesha Siddiqa',
    attendanceRate: 95,
    termGrade: 'A+',
    gpa: '3.85',
    feeStatus: 'Paid',
    monthlyFee: 15000,
    lastDiaryNote: 'Completed Mathematics exercise 4.2 fractions. Please ensure revision for tomorrow’s quiz.',
  },
  {
    id: 'child-02',
    name: 'Fatima Ahmed',
    rollNo: '2026-018',
    class: 'Class 3',
    section: 'B',
    classTeacher: 'Ms. Zainab Fatima',
    attendanceRate: 98,
    termGrade: 'A+',
    gpa: '3.95',
    feeStatus: 'Paid',
    monthlyFee: 14000,
    lastDiaryNote: 'Urdu handwriting practice chapter 6 page 42. Excellent classroom participation today!',
  },
]

export default function ParentChildrenPage() {
  const [selectedChild, setSelectedChild] = useState<string>(registeredChildren[0].id)

  const handleSelectChild = (id: string) => {
    setSelectedChild(id)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('eduflow-active-child-id', id)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/parent"
              className="text-xs text-slate-500 hover:text-blue-600 transition flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="size-3.5" /> Learning Space
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200">
              Session 2026–2027
            </Badge>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            My Enrolled Children
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Switch active sibling profile, review academic report cards, fee challans, and teacher diaries.
          </p>
        </div>

        <Link href="/parent">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs text-xs">
            Open Learning Dashboard <ArrowRight className="ml-1.5 size-3.5" />
          </Button>
        </Link>
      </div>

      {/* Top Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Enrolled Children</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {registeredChildren.length} Siblings
          </p>
          <p className="mt-1 text-xs text-slate-500">Linked to this parent guardian account</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Average Attendance</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            96.5%
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Regular in classrooms
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Term Fee Clearance</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ReceiptText className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-emerald-600">
            100% Cleared
          </p>
          <p className="mt-1 text-xs text-slate-500">All student vouchers verified</p>
        </article>
      </section>

      {/* Children Cards List */}
      <div className="grid gap-6 md:grid-cols-2">
        {registeredChildren.map((child) => {
          const isSelected = selectedChild === child.id

          return (
            <article
              key={child.id}
              className={`rounded-2xl border bg-white p-6 shadow-xs transition-all duration-200 ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-600/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-base shadow-xs">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-900">
                        {child.name}
                      </h3>
                      {isSelected && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                          Active Selection
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Roll No: {child.rollNo} · {child.class} - Section {child.section}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                  {child.feeStatus}
                </span>
              </div>

              {/* Child Highlights Grid */}
              <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] font-medium text-slate-500">Attendance</span>
                  <p className="mt-1 font-extrabold text-slate-900 text-base">
                    {child.attendanceRate}%
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] font-medium text-slate-500">Term Grade</span>
                  <p className="mt-1 font-extrabold text-emerald-600 text-base">
                    {child.termGrade} ({child.gpa})
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] font-medium text-slate-500">Class Incharge</span>
                  <p className="mt-1 font-bold text-slate-800 text-xs truncate">
                    {child.classTeacher.split(' ').slice(-1)[0]}
                  </p>
                </div>
              </div>

              {/* Latest Homework Diary Snippet */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Headphones className="size-3.5 text-blue-600" />
                  <span>Latest Daily Homework Diary</span>
                </div>
                <p className="mt-1 text-slate-600 leading-relaxed line-clamp-2">
                  &ldquo;{child.lastDiaryNote}&rdquo;
                </p>
              </div>

              {/* Card Actions */}
              <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
                <Link
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Assalam-o-Alaikum, inquiry regarding ${child.name} (${child.class}-${child.section}).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition"
                >
                  <MessageCircle className="size-3.5 text-emerald-600" />
                  <span>Contact Teacher</span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link href="/parent">
                    <Button
                      size="sm"
                      onClick={() => handleSelectChild(child.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs"
                    >
                      Select &amp; View Portal
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
