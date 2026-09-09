'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  GraduationCap,
  Printer,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const subjects = [
  { code: 'MATH-101', name: 'Mathematics', teacher: 'Sir Tariq', max: 100, mid: 45, final: 47, total: 92, grade: 'A*', remarks: 'Exceptional problem-solving skills in algebra.' },
  { code: 'ENG-102', name: 'English Language & Comp', teacher: 'Ms. Ayesha', max: 100, mid: 40, final: 45, total: 85, grade: 'A', remarks: 'Good creative writing and essay structure.' },
  { code: 'SCI-103', name: 'Physics & Chemistry', teacher: 'Sir Kamran', max: 100, mid: 42, final: 46, total: 88, grade: 'A', remarks: 'Strong conceptual grasp of lab experiments.' },
  { code: 'URD-104', name: 'Urdu Literature', teacher: 'Madam Fatima', max: 100, mid: 38, final: 41, total: 79, grade: 'B', remarks: 'Good progress in grammar and vocabulary.' },
  { code: 'ISL-105', name: 'Islamiat & Pak Studies', teacher: 'Qari Sb', max: 100, mid: 46, final: 44, total: 90, grade: 'A*', remarks: 'Fluent recitation and excellent historical dates memory.' },
]

export default function StudentGradesPage() {
  const totalObtained = subjects.reduce((sum, s) => sum + s.total, 0)
  const totalMax = subjects.reduce((sum, s) => sum + s.max, 0)
  const percentage = Math.round((totalObtained / totalMax) * 100)

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between text-xs text-slate-500 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/student" className="hover:text-blue-600 transition flex items-center gap-1 text-slate-600">
            <ArrowLeft className="size-3.5" /> Student Workspace
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Official Report Card</span>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          size="sm"
          className="gap-1.5 border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700"
        >
          <Printer className="size-3.5 text-slate-500" /> Print Report Card
        </Button>
      </nav>

      {/* Report Card Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
              <GraduationCap className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Academic Progress Report Card
                </h1>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Result
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Session 2026–2027 · Mid-Term Examination Evaluation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400">Overall Grade</p>
              <p className="text-2xl font-black text-blue-600">Grade A*</p>
            </div>
            <div className="h-9 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-xs text-slate-400">Percentage</p>
              <p className="text-2xl font-black text-slate-900">{percentage}%</p>
            </div>
          </div>
        </div>

        {/* Student Meta Strip */}
        <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4 text-xs">
          <div>
            <span className="text-slate-400">Class &amp; Section</span>
            <p className="font-bold text-slate-800 mt-0.5">Class 8 - Section A</p>
          </div>
          <div>
            <span className="text-slate-400">Roll Number</span>
            <p className="font-bold text-slate-800 mt-0.5">CH-08</p>
          </div>
          <div>
            <span className="text-slate-400">Total Marks</span>
            <p className="font-bold text-slate-800 mt-0.5">{totalObtained} / {totalMax}</p>
          </div>
          <div>
            <span className="text-slate-400">Examination Status</span>
            <p className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Promoted / Passed
            </p>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-bold text-slate-900">Subject Assessment Breakdown</h2>
          <p className="text-xs text-slate-500">Official grades confirmed by classroom teachers</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-600 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Subject Code</th>
                <th className="px-5 py-3.5">Course Name</th>
                <th className="px-5 py-3.5 text-center">Teacher</th>
                <th className="px-5 py-3.5 text-center">Mid-Term (50)</th>
                <th className="px-5 py-3.5 text-center">Final (50)</th>
                <th className="px-5 py-3.5 text-center">Total (100)</th>
                <th className="px-5 py-3.5 text-center">Grade</th>
                <th className="px-5 py-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((s) => (
                <tr key={s.code} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-slate-500">{s.code}</td>
                  <td className="px-5 py-4 font-bold text-slate-900">{s.name}</td>
                  <td className="px-5 py-4 text-center text-slate-500">{s.teacher}</td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-700">{s.mid}</td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-700">{s.final}</td>
                  <td className="px-5 py-4 text-center font-extrabold text-slate-900">{s.total}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-block rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 font-black text-blue-700">
                      {s.grade}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 italic max-w-xs truncate">{s.remarks}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold">
              <tr>
                <td colSpan={5} className="px-5 py-3.5 text-slate-600">Aggregate Total</td>
                <td className="px-5 py-3.5 text-center text-sm font-extrabold text-slate-900">
                  {totalObtained} / {totalMax}
                </td>
                <td className="px-5 py-3.5 text-center text-sm font-extrabold text-blue-600">
                  A*
                </td>
                <td className="px-5 py-3.5 text-slate-500 font-normal">Passed with distinction</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  )
}
