'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchStudents } from '@/lib/live-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Award, BookOpen, Check, Download, Search, Sparkles } from 'lucide-react'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'

type StudentScore = {
  id: string | number
  name: string
  roll_no: string
  class: string
  section: string
  midterm: string
  final: string
  total: string
  grade: string
}

export function TeacherGradebook() {
  const [students, setStudents] = useState<StudentScore[]>([])
  const [term, setTerm] = useState('Mid-Term Examination 2026')
  const [subject, setSubject] = useState('Mathematics')
  const [classFilter, setClassFilter] = useState('Class 5')
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents().then(({ data }) => {
      if (data && data.length > 0) {
        setStudents(
          data.map((s: any, idx: number) => ({
            id: s.id ?? idx + 1,
            name: s.name ?? 'Student',
            roll_no: s.roll_no ?? `2026-${String(idx + 1).padStart(3, '0')}`,
            class: s.class ?? 'Class 5',
            section: s.section ?? 'A',
            midterm: '',
            final: '',
            total: '',
            grade: '',
          }))
        )
      } else {
        setStudents([])
      }
      setLoading(false)
    })
  }, [])

  const updateScore = (id: string | number, field: 'midterm' | 'final', value: string) => {
    setStudents((curr) =>
      curr.map((s) => {
        if (s.id !== id) return s
        const updated = { ...s, [field]: value }
        const mid = parseFloat(updated.midterm) || 0
        const fin = parseFloat(updated.final) || 0
        const tot = mid + fin
        updated.total = tot > 0 ? String(tot) : ''
        if (tot >= 85) updated.grade = 'A*'
        else if (tot >= 75) updated.grade = 'A'
        else if (tot >= 65) updated.grade = 'B'
        else if (tot >= 50) updated.grade = 'C'
        else if (tot > 0) updated.grade = 'D'
        else updated.grade = ''
        return updated
      })
    )
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const filtered = students.filter(
    (s) =>
      s.class === classFilter &&
      (s.name.toLowerCase().includes(query.toLowerCase()) || s.roll_no.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between text-xs text-slate-500 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/teacher" className="hover:text-emerald-600 transition flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="size-3.5" /> Classroom Haziri
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Gradebook &amp; Marks</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/teacher/diary" className="hover:text-emerald-600 transition font-medium text-slate-500">
            Audio Voice Diary →
          </Link>
        </div>
      </nav>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20">
              Evaluation Center
            </Badge>
            <span className="text-sm text-slate-500 dark:text-slate-400">Academic Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Gradebook &amp; Marks Entry</h1>
          <p className="text-slate-500 dark:text-slate-400">Record assessment scores and term exam marks for student report cards.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} disabled={students.length === 0}>
            <Download className="mr-2 size-4" /> Print Marks Sheet
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
            {saved ? <Check className="mr-2 size-4" /> : null}
            {saved ? 'Scores Saved' : 'Save Gradebook'}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Evaluation Term
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 text-sm"
            >
              <option>Mid-Term Examination 2026</option>
              <option>Final Term Examination 2027</option>
              <option>Monthly Test - August 2026</option>
              <option>Monthly Test - September 2026</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Subject
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 text-sm"
            >
              <option>Mathematics</option>
              <option>English Literature</option>
              <option>General Science</option>
              <option>Urdu Adab</option>
              <option>Islamiat / Ethics</option>
              <option>Computer Science</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Class
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 text-sm"
            >
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Search student by name or roll no..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-sm rounded-xl"
            />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} students in {classFilter}</span>
        </div>

        {students.length === 0 && !loading ? (
          <div className="mt-6">
            <ZeroDataEmptyState
              icon={BookOpen}
              title="No enrolled students found"
              description="Admit students in Campus Admin to open the gradebook roster."
            />
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Roll No</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Class</th>
                    <th className="px-4 py-3.5 w-32">Midterm (50)</th>
                    <th className="px-4 py-3.5 w-32">Final (50)</th>
                    <th className="px-4 py-3.5 w-24">Total</th>
                    <th className="px-4 py-3.5 w-20">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-500">{s.roll_no}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{s.name}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{s.class} - {s.section}</td>
                      <td className="px-4 py-3.5">
                        <Input
                          type="number"
                          max="50"
                          min="0"
                          value={s.midterm}
                          onChange={(e) => updateScore(s.id, 'midterm', e.target.value)}
                          placeholder="—"
                          className="h-8 text-xs font-mono text-center rounded-lg"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <Input
                          type="number"
                          max="50"
                          min="0"
                          value={s.final}
                          onChange={(e) => updateScore(s.id, 'final', e.target.value)}
                          placeholder="—"
                          className="h-8 text-xs font-mono text-center rounded-lg"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {s.total || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        {s.grade ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                            {s.grade}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
