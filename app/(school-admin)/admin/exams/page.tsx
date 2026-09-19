'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  GraduationCap,
  Printer,
  Search,
  Trophy,
  Users,
  X,
  Plus,
  Edit3,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AcademicCrest } from '@/components/academic-crest'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { fetchStudents } from '@/lib/live-data'

export interface SubjectScore {
  name: string
  total: number
  obtained: number
  grade: string
}

export interface StudentExamRecord {
  id: string
  studentId: string
  rollNumber: string
  studentName: string
  fatherName: string
  grade: string
  section: string
  subjects: SubjectScore[]
  totalMarks: number
  obtainedMarks: number
  percentage: number
  overallGrade: string
  classRank: number
  attendanceRate: string
  teacherRemarks: string
}

function calculateGrade(percentage: number, board: 'cambridge' | 'bise'): string {
  if (board === 'cambridge') {
    if (percentage >= 90) return 'A*'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'U'
  } else {
    if (percentage >= 80) return 'A+'
    if (percentage >= 70) return 'A'
    if (percentage >= 60) return 'B'
    if (percentage >= 50) return 'C'
    if (percentage >= 40) return 'D'
    return 'E'
  }
}

const DEFAULT_SUBJECTS = ['English', 'Mathematics', 'General Science', 'Urdu', 'Islamiyat']

export default function AdminExamsPage() {
  const router = useRouter()
  const [selectedTerm, setSelectedTerm] = useState('Mid-Term Examination 2026')
  const [selectedClass, setSelectedClass] = useState('All Classes')
  const [gradingBoard, setGradingBoard] = useState<'bise' | 'cambridge'>('cambridge')
  const [selectedSlip, setSelectedSlip] = useState<StudentExamRecord | null>(null)
  
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [marksMap, setMarksMap] = useState<Record<string, SubjectScore[]>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState('')

  // Mark entry modal state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any | null>(null)
  const [entryScores, setEntryScores] = useState<Array<{ name: string; obtained: number; total: number }>>([])
  const [entryRemarks, setEntryRemarks] = useState('')

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Load students and saved marks
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetchStudents()
        const fetched = res.data || []
        setStudents(fetched)

        // Load persisted exam marks for this term
        if (typeof window !== 'undefined') {
          const storageKey = `eduflow_exam_marks_${selectedTerm}`
          const stored = localStorage.getItem(storageKey)
          if (stored) {
            try {
              setMarksMap(JSON.parse(stored))
            } catch {}
          } else {
            setMarksMap({})
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedTerm])

  // Save marks to local storage
  const saveMarksMap = (updated: Record<string, SubjectScore[]>) => {
    setMarksMap(updated)
    if (typeof window !== 'undefined') {
      const storageKey = `eduflow_exam_marks_${selectedTerm}`
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch {}
    }
  }

  // Filter students by class and query
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClass === 'All Classes' || s.class === selectedClass
      const matchQuery = !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())
      return matchClass && matchQuery
    })
  }, [students, selectedClass, searchQuery])

  // Extract available classes
  const availableClasses = useMemo(() => {
    const set = new Set<string>(['All Classes'])
    students.forEach(s => {
      if (s.class) set.add(s.class)
    })
    return Array.from(set)
  }, [students])

  // Compile full exam records with ranking
  const compiledRecords: StudentExamRecord[] = useMemo(() => {
    const records = filteredStudents.map((st) => {
      const idStr = String(st.id)
      const userScores = marksMap[idStr]

      let subjects: SubjectScore[] = []
      if (userScores && userScores.length > 0) {
        subjects = userScores.map(s => ({
          ...s,
          grade: calculateGrade((s.obtained / (s.total || 100)) * 100, gradingBoard)
        }))
      }

      const totalMarks = subjects.reduce((sum, s) => sum + (s.total || 100), 0)
      const obtainedMarks = subjects.reduce((sum, s) => sum + (s.obtained || 0), 0)
      const percentage = totalMarks > 0 ? Number(((obtainedMarks / totalMarks) * 100).toFixed(1)) : 0
      const overallGrade = totalMarks > 0 ? calculateGrade(percentage, gradingBoard) : '—'

      return {
        id: `rec-${st.id}`,
        studentId: idStr,
        rollNumber: st.roll_no || `ROLL-${st.id}`,
        studentName: st.name,
        fatherName: st.father_name || 'Guardian',
        grade: st.class || 'Unassigned',
        section: st.section || 'A',
        subjects,
        totalMarks,
        obtainedMarks,
        percentage,
        overallGrade,
        classRank: 0,
        attendanceRate: '95.0%',
        teacherRemarks: subjects.length > 0 ? 'Satisfactory academic performance and steady progress.' : 'Marks pending entry.',
      }
    })

    // Sort by percentage descending for rank
    const sorted = [...records].sort((a, b) => b.percentage - a.percentage)
    sorted.forEach((rec, idx) => {
      rec.classRank = rec.totalMarks > 0 ? idx + 1 : 0
    })

    return sorted
  }, [filteredStudents, marksMap, gradingBoard])

  // Aggregate statistics
  const { classAverage, topRecord, testedCount } = useMemo(() => {
    const tested = compiledRecords.filter(r => r.totalMarks > 0)
    if (tested.length === 0) {
      return { classAverage: 0, topRecord: null, testedCount: 0 }
    }
    const sum = tested.reduce((acc, r) => acc + r.percentage, 0)
    const avg = Number((sum / tested.length).toFixed(1))
    return {
      classAverage: avg,
      topRecord: tested[0] || null,
      testedCount: tested.length,
    }
  }, [compiledRecords])

  // Open Mark Entry Modal
  const handleOpenEntry = (st: any) => {
    setEditingStudent(st)
    const idStr = String(st.id)
    const existing = marksMap[idStr]

    if (existing && existing.length > 0) {
      setEntryScores(existing.map(s => ({ name: s.name, obtained: s.obtained, total: s.total })))
    } else {
      setEntryScores(DEFAULT_SUBJECTS.map(name => ({ name, obtained: 0, total: 100 })))
    }
    setIsEntryModalOpen(true)
  }

  // Save entered marks
  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return

    const idStr = String(editingStudent.id)
    const formattedScores: SubjectScore[] = entryScores.map(s => ({
      name: s.name,
      total: Number(s.total) || 100,
      obtained: Number(s.obtained) || 0,
      grade: calculateGrade(((Number(s.obtained) || 0) / (Number(s.total) || 100)) * 100, gradingBoard)
    }))

    const updated = { ...marksMap, [idStr]: formattedScores }
    saveMarksMap(updated)
    setIsEntryModalOpen(false)
    setEditingStudent(null)
    notify(`Saved examination marks for ${editingStudent.name}`)
  }

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

        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            onClick={handlePrintSlip}
            className="rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Printer className="mr-1.5 size-3.5" /> Print Gazette
          </Button>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Examination</span>
          <p className="mt-1 text-sm sm:text-base font-black text-slate-900 truncate" title={selectedTerm}>
            {selectedTerm}
          </p>
          <span className="text-[11px] text-blue-600 font-bold">Session 2026–27</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Grading Scale</span>
          <p className="mt-1 text-sm sm:text-base font-black text-purple-600">
            {gradingBoard === 'cambridge' ? 'Cambridge O/A (A*–U)' : 'BISE Matric (A+–E)'}
          </p>
          <span className="text-[11px] text-slate-400">Board-compliant marks</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Class Average</span>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {classAverage > 0 ? `${classAverage}%` : '0%'}
          </p>
          <span className="text-[11px] text-slate-400">
            {testedCount > 0 ? `${testedCount} students tested` : 'No test scores entered'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Top Position</span>
          <p className="mt-1 text-2xl font-black text-amber-500 flex items-center gap-1.5">
            <Trophy className="size-5 shrink-0" />
            {topRecord ? `${topRecord.percentage}%` : '—'}
          </p>
          <span className="text-[11px] text-slate-400 truncate block">
            {topRecord ? `${topRecord.studentName} (Pos 1)` : 'No exam records'}
          </span>
        </div>
      </div>

      {/* Filter and Settings Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs print:hidden">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Term:</span>
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
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
            <Input
              placeholder="Search candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs rounded-xl border-slate-200"
            />
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

      {/* Marks & Class Gazette Table or Zero State */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="size-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs font-medium text-slate-500">Loading student examination registry...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <ZeroDataEmptyState
            icon={GraduationCap}
            title="No Examination Records Found"
            description="Your school does not have any enrolled students yet. Register students in the Student Directory to generate exam marks and report cards."
            actionLabel="Go to Student Directory"
            onAction={() => router.push('/admin/students')}
          />
        </div>
      ) : compiledRecords.length === 0 ? (
        <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
          No students found matching current filters.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Roll No & Student</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Subject Marks Breakdown</th>
                  <th className="py-3.5 px-4">Total Marks</th>
                  <th className="py-3.5 px-4">Percentage</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {compiledRecords.map((rec) => {
                  const matchedStudent = students.find((s) => String(s.id) === rec.studentId)
                  return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      {rec.classRank > 0 ? (
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
                      ) : (
                        <span className="text-slate-400 font-bold text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-500 font-bold block">{rec.rollNumber}</span>
                      <strong className="text-slate-900 font-bold text-sm block">{rec.studentName}</strong>
                      <span className="text-[11px] text-slate-400">S/D/O {rec.fatherName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {rec.grade}-{rec.section}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {rec.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {rec.subjects.slice(0, 3).map((s) => (
                            <span key={s.name} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">
                              {s.name}: <strong>{s.obtained}</strong>/{s.total} ({s.grade})
                            </span>
                          ))}
                          {rec.subjects.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{rec.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Marks pending</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {rec.totalMarks > 0 ? (
                        <>
                          <strong className="text-slate-900 font-bold text-sm">{rec.obtainedMarks}</strong>
                          <span className="text-slate-400 block text-[10px]">out of {rec.totalMarks}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {rec.totalMarks > 0 ? (
                        <span className="font-black text-blue-600 text-sm">{rec.percentage}%</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {rec.totalMarks > 0 ? (
                        <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          Grade {rec.overallGrade}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEntry(matchedStudent)}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition shadow-2xs"
                          title="Enter Marks"
                        >
                          <Edit3 className="size-3" /> Marks
                        </button>

                        {rec.totalMarks > 0 && (
                          <button
                            onClick={() => setSelectedSlip(rec)}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                          >
                            <Printer className="size-3" /> Report Slip
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Entry Modal */}
      {isEntryModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Examination Scores</h3>
                <p className="text-xs text-slate-500">
                  {editingStudent.name} ({editingStudent.roll_no || 'No Roll No'}) — {selectedTerm}
                </p>
              </div>
              <button
                onClick={() => setIsEntryModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-4 text-xs">
              <div className="space-y-3">
                {entryScores.map((score, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={score.name}
                      onChange={(e) => {
                        const updated = [...entryScores]
                        updated[index].name = e.target.value
                        setEntryScores(updated)
                      }}
                      placeholder="Subject Name"
                      className="w-1/2 text-xs rounded-xl border-slate-200"
                    />
                    <div className="flex items-center gap-1 w-1/2">
                      <Input
                        type="number"
                        min="0"
                        max={score.total}
                        value={score.obtained}
                        onChange={(e) => {
                          const updated = [...entryScores]
                          updated[index].obtained = Number(e.target.value)
                          setEntryScores(updated)
                        }}
                        placeholder="Obtained"
                        className="text-xs rounded-xl border-slate-200"
                      />
                      <span className="text-slate-400">/</span>
                      <Input
                        type="number"
                        min="1"
                        value={score.total}
                        onChange={(e) => {
                          const updated = [...entryScores]
                          updated[index].total = Number(e.target.value)
                          setEntryScores(updated)
                        }}
                        placeholder="Total"
                        className="text-xs rounded-xl border-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEntryScores([...entryScores, { name: '', obtained: 0, total: 100 }])}
                  className="rounded-xl text-xs"
                >
                  <Plus className="mr-1 size-3" /> Add Subject
                </Button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  Save Marks
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  EduFlow Unified Academic System
                </h2>
                <p className="text-xs text-slate-600">
                  Affiliated with Board of Intermediate & Secondary Education / Cambridge Assessment
                </p>
                <p className="text-xs font-bold text-blue-800 uppercase mt-1 tracking-wider">
                  Official Student Term Academic Report Card — {selectedTerm}
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
                  <strong className="text-base font-black text-amber-600">
                    {selectedSlip.classRank > 0 ? `Position ${selectedSlip.classRank}` : '—'}
                  </strong>
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
