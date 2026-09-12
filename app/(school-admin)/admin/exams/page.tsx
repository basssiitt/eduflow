'use client'

import React, { useState } from 'react'
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Filter,
  GraduationCap,
  Printer,
  Search,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { AcademicCrest } from '@/components/academic-crest'

interface ExamRecord {
  id: string
  rollNumber: string
  studentName: string
  fatherName: string
  grade: string
  section: string
  subjects: {
    name: string
    total: number
    obtained: number
    grade: string
  }[]
  totalMarks: number
  obtainedMarks: number
  percentage: number
  overallGrade: string
  classRank: number
  attendanceRate: string
  teacherRemarks: string
}

const SAMPLE_EXAM_RECORDS: ExamRecord[] = [
  {
    id: 'rec-001',
    rollNumber: '2026-001',
    studentName: 'Muhammad Ali Khan',
    fatherName: 'Tariq Mehmood',
    grade: 'Class 5',
    section: 'A',
    subjects: [
      { name: 'Mathematics', total: 100, obtained: 94, grade: 'A*' },
      { name: 'General Science', total: 100, obtained: 92, grade: 'A*' },
      { name: 'English Literature', total: 100, obtained: 88, grade: 'A' },
      { name: 'Urdu Qawaid', total: 100, obtained: 85, grade: 'A' },
      { name: 'Islamiyat & Nazra', total: 100, obtained: 96, grade: 'A*' },
      { name: 'Computer IT', total: 100, obtained: 90, grade: 'A*' },
    ],
    totalMarks: 600,
    obtainedMarks: 545,
    percentage: 90.8,
    overallGrade: 'A*',
    classRank: 1,
    attendanceRate: '96.5%',
    teacherRemarks: 'Brilliant analytical mind. Outstanding mastery in Mathematics and Science.',
  },
  {
    id: 'rec-002',
    rollNumber: '2026-002',
    studentName: 'Fatima Zahra',
    fatherName: 'Ahmad Hassan',
    grade: 'Class 5',
    section: 'A',
    subjects: [
      { name: 'Mathematics', total: 100, obtained: 91, grade: 'A*' },
      { name: 'General Science', total: 100, obtained: 89, grade: 'A' },
      { name: 'English Literature', total: 100, obtained: 95, grade: 'A*' },
      { name: 'Urdu Qawaid', total: 100, obtained: 92, grade: 'A*' },
      { name: 'Islamiyat & Nazra', total: 100, obtained: 94, grade: 'A*' },
      { name: 'Computer IT', total: 100, obtained: 86, grade: 'A' },
    ],
    totalMarks: 600,
    obtainedMarks: 547,
    percentage: 91.2,
    overallGrade: 'A*',
    classRank: 2,
    attendanceRate: '98.0%',
    teacherRemarks: 'Exceptional linguistic skills. Diligent, disciplined, and very consistent in class.',
  },
  {
    id: 'rec-003',
    rollNumber: '2026-003',
    studentName: 'Zainab Bibi',
    fatherName: 'Muhammad Rizwan',
    grade: 'Class 5',
    section: 'A',
    subjects: [
      { name: 'Mathematics', total: 100, obtained: 84, grade: 'A' },
      { name: 'General Science', total: 100, obtained: 86, grade: 'A' },
      { name: 'English Literature', total: 100, obtained: 82, grade: 'A' },
      { name: 'Urdu Qawaid', total: 100, obtained: 88, grade: 'A' },
      { name: 'Islamiyat & Nazra', total: 100, obtained: 92, grade: 'A*' },
      { name: 'Computer IT', total: 100, obtained: 85, grade: 'A' },
    ],
    totalMarks: 600,
    obtainedMarks: 517,
    percentage: 86.2,
    overallGrade: 'A',
    classRank: 3,
    attendanceRate: '94.0%',
    teacherRemarks: 'Well-rounded academic progress. Keep revising science practical experiments.',
  },
  {
    id: 'rec-004',
    rollNumber: '2026-004',
    studentName: 'Bilal Hassan',
    fatherName: 'Hassan Raza',
    grade: 'Class 5',
    section: 'A',
    subjects: [
      { name: 'Mathematics', total: 100, obtained: 78, grade: 'B' },
      { name: 'General Science', total: 100, obtained: 80, grade: 'A' },
      { name: 'English Literature', total: 100, obtained: 75, grade: 'B' },
      { name: 'Urdu Qawaid', total: 100, obtained: 79, grade: 'B' },
      { name: 'Islamiyat & Nazra', total: 100, obtained: 88, grade: 'A' },
      { name: 'Computer IT', total: 100, obtained: 82, grade: 'A' },
    ],
    totalMarks: 600,
    obtainedMarks: 482,
    percentage: 80.3,
    overallGrade: 'A',
    classRank: 4,
    attendanceRate: '91.2%',
    teacherRemarks: 'Active participant in sports. Can achieve top 3 with more focus on English grammar.',
  },
]

export default function AdminExamsPage() {
  const [selectedTerm, setSelectedTerm] = useState('Mid-Term Examination 2026')
  const [selectedClass, setSelectedClass] = useState('Class 5-A')
  const [gradingBoard, setGradingBoard] = useState<'bise' | 'cambridge'>('cambridge')
  const [selectedSlip, setSelectedSlip] = useState<ExamRecord | null>(null)

  const handlePrintSlip = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Assessment & Evaluation Engine
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Examinations & Multi-Board Report Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Oversee term exam results, calculate class positions, and print official report card slips supporting Pakistani BISE and Cambridge O/A Levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSlip}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Printer className="size-3.5" /> Print Gazette
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Examination</span>
          <p className="mt-1 text-lg font-black text-slate-900 truncate" title={selectedTerm}>
            {selectedTerm}
          </p>
          <span className="text-[11px] text-blue-600 font-bold">Session 2026–27</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Grading Scale</span>
          <p className="mt-1 text-lg font-black text-purple-600">
            {gradingBoard === 'cambridge' ? 'Cambridge O/A Level (A*–U)' : 'BISE Matric (A+ to E)'}
          </p>
          <span className="text-[11px] text-slate-400">Board-compliant marks</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Class Average</span>
          <p className="mt-1 text-2xl font-black text-emerald-600">87.1%</p>
          <span className="text-[11px] text-slate-400">Overall passing rate: 100%</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Top Position</span>
          <p className="mt-1 text-2xl font-black text-amber-500 flex items-center gap-1.5">
            <Trophy className="size-5 shrink-0" /> 91.2%
          </p>
          <span className="text-[11px] text-slate-400">Fatima Zahra (Position 1)</span>
        </div>
      </div>

      {/* Filter and Settings Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Exam Term:</span>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-bold text-slate-800"
            >
              <option value="Mid-Term Examination 2026">Mid-Term Examination 2026</option>
              <option value="Final Term Board Examination 2026">Final Term Board Examination 2026</option>
              <option value="Monthly Class Assessment (Sep 2026)">Monthly Class Assessment (Sep 2026)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-bold text-slate-800"
            >
              <option value="Class 5-A">Class 5-A</option>
              <option value="Class 6-B">Class 6-B</option>
              <option value="Class 7-A">Class 7-A</option>
              <option value="Class 8-B">Class 8-B</option>
              <option value="Class 9 (Matric)">Class 9 (Matric)</option>
              <option value="Cambridge O-Levels">Cambridge O-Levels</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-slate-600 mr-1">Board:</span>
          <button
            onClick={() => setGradingBoard('cambridge')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              gradingBoard === 'cambridge'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Cambridge Standard
          </button>
          <button
            onClick={() => setGradingBoard('bise')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              gradingBoard === 'bise'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            BISE Matric
          </button>
        </div>
      </div>

      {/* Marks & Class Gazette Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Position</th>
                <th className="py-3.5 px-4">Roll No & Student</th>
                <th className="py-3.5 px-4">Subject Marks Breakdown</th>
                <th className="py-3.5 px-4">Total / 600</th>
                <th className="py-3.5 px-4">Percentage</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4 text-right">Official Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {SAMPLE_EXAM_RECORDS.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center justify-center size-7 rounded-full font-black text-xs ${
                        rec.classRank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : rec.classRank === 2
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : rec.classRank === 3
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rec.classRank}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-500 font-bold block">{rec.rollNumber}</span>
                    <strong className="text-slate-900 font-bold text-sm block">{rec.studentName}</strong>
                    <span className="text-[11px] text-slate-400">S/D/O {rec.fatherName}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {rec.subjects.slice(0, 4).map((s) => (
                        <span key={s.name} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">
                          {s.name.split(' ')[0]}: <strong>{s.obtained}</strong> ({s.grade})
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-400 self-center">+2 more</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 font-bold text-sm">{rec.obtainedMarks}</strong>
                    <span className="text-slate-400 block text-[10px]">out of {rec.totalMarks}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-black text-blue-600 text-sm">{rec.percentage}%</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      Grade {rec.overallGrade}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedSlip(rec)}
                      className="inline-flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                    >
                      <Printer className="size-3" /> Report Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Report Card Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
              <span className="text-xs font-bold text-slate-500">Official Student Transcript Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSlip}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-blue-700 transition shadow-xs"
                >
                  <Printer className="size-3.5" /> Print Official Slip
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Official Academic Report Card Layout */}
            <div className="py-4 space-y-5 print:p-0">
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <div className="flex justify-center mb-2">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
                    <AcademicCrest className="size-9" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  EduFlow Model School & College
                </h2>
                <p className="text-xs text-slate-600">
                  Affiliated with Board of Intermediate & Secondary Education / Cambridge Assessment
                </p>
                <p className="text-xs font-bold text-blue-800 uppercase mt-1 tracking-wider">
                  Official Student Term Academic Report Card — Session 2026–27
                </p>
              </div>

              {/* Student Biodata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Candidate Name:</span>
                  <strong className="text-slate-900 font-bold">{selectedSlip.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Roll Number:</span>
                  <strong className="text-slate-900 font-bold font-mono">{selectedSlip.rollNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Class & Section:</span>
                  <strong className="text-slate-900 font-bold">{selectedSlip.grade}-{selectedSlip.section}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Father / Guardian:</span>
                  <strong className="text-slate-900 font-bold">{selectedSlip.fatherName}</strong>
                </div>
              </div>

              {/* Subject Marks Table */}
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3 border-b">Subject</th>
                    <th className="py-2.5 px-3 border-b text-center">Max Marks</th>
                    <th className="py-2.5 px-3 border-b text-center">Marks Obtained</th>
                    <th className="py-2.5 px-3 border-b text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedSlip.subjects.map((sub) => (
                    <tr key={sub.name}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{sub.name}</td>
                      <td className="py-2 px-3 text-center text-slate-500">{sub.total}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900">{sub.obtained}</td>
                      <td className="py-2 px-3 text-center font-bold text-blue-600">{sub.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="py-2.5 px-3">Total Cumulative Score</td>
                    <td className="py-2.5 px-3 text-center">{selectedSlip.totalMarks}</td>
                    <td className="py-2.5 px-3 text-center text-blue-700">{selectedSlip.obtainedMarks}</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-black">{selectedSlip.overallGrade}</td>
                  </tr>
                </tbody>
              </table>

              {/* Performance Summary Strip */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                <div>
                  <span className="text-slate-500 block">Percentage</span>
                  <strong className="text-base font-black text-blue-900">{selectedSlip.percentage}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Class Position</span>
                  <strong className="text-base font-black text-amber-600">Position {selectedSlip.classRank}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Haziri Attendance</span>
                  <strong className="text-base font-black text-emerald-700">{selectedSlip.attendanceRate}</strong>
                </div>
              </div>

              {/* Remarks */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Class Teacher Remarks:</span>
                <p className="italic text-slate-600">&ldquo;{selectedSlip.teacherRemarks}&rdquo;</p>
              </div>

              {/* Official Stamp & Signatures */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs">
                <div>
                  <div className="w-36 border-b border-slate-900 mx-auto mb-1"></div>
                  <span className="font-semibold text-slate-600">Class Incharge Signature</span>
                </div>
                <div>
                  <div className="w-36 border-b border-slate-900 mx-auto mb-1"></div>
                  <span className="font-semibold text-slate-600">Principal Signature & Stamp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
