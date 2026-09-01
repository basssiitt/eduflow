'use client'

import { useEffect, useState, useMemo } from 'react'
import { BulkImportModal } from '@/components/bulk-import-modal'
import { fetchStudents } from '@/lib/live-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Download, Search, Upload, Users } from 'lucide-react'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'

type StudentRecord = {
  id: string | number
  name: string
  father_name: string
  roll_no: string
  class: string
  section: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [importOpen, setImportOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const loadStudents = async () => {
    setLoading(true)
    const { data } = await fetchStudents()
    if (data && data.length > 0) {
      setStudents(
        data.map((s: any, idx: number) => ({
          id: s.id ?? idx + 1,
          name: s.name ?? 'Student',
          father_name: s.father_name ?? '',
          roll_no: s.roll_no ?? `2026-${String(idx + 1).padStart(3, '0')}`,
          class: s.class ?? 'Class 5',
          section: s.section ?? 'A',
        }))
      )
    } else {
      setStudents([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesClass = classFilter === 'All' || s.class.includes(classFilter)
      const matchesQuery =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.father_name.toLowerCase().includes(query.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(query.toLowerCase())
      return matchesClass && matchesQuery
    })
  }, [students, query, classFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const handleClassFilter = (cls: string) => {
    setClassFilter(cls)
    setPage(1)
  }

  const handleQueryChange = (val: string) => {
    setQuery(val)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20">
              Academic Directory
            </Badge>
            <span className="text-sm text-slate-500 dark:text-slate-400">Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Student Register &amp; Enrollment</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage enrolled students, parent contact details, and classroom assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setImportOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
          >
            <Upload className="mr-2 size-4" />
            Bulk CSV Import
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
              <button
                key={cls}
                onClick={() => handleClassFilter(cls)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  classFilter === cls
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Search by name, roll no..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-9 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950"
            />
          </div>
        </div>

        {students.length === 0 && !loading ? (
          <div className="mt-6">
            <ZeroDataEmptyState
              icon={Users}
              title="No students registered yet"
              description="Your campus roster is currently empty. Use Bulk CSV Import to enroll students into classes."
              actionLabel="Bulk Import Students"
              onAction={() => setImportOpen(true)}
            />
          </div>
        ) : (
          <>
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5">Roll No</th>
                      <th className="px-4 py-3.5">Student Name</th>
                      <th className="px-4 py-3.5">Father / Guardian</th>
                      <th className="px-4 py-3.5">Class &amp; Section</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginated.map((s) => (
                      <tr key={s.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-500">{s.roll_no}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{s.name}</td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{s.father_name || '—'}</td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {s.class} · Section {s.section}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                            Enrolled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Showing {paginated.length} of {filtered.length} students</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="size-8 p-0"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 font-medium">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="size-8 p-0"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => window.print()} disabled={students.length === 0} className="ml-2">
                  <Download className="mr-1.5 size-3.5" /> Print Roster
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {importOpen && (
        <BulkImportModal
          onClose={() => {
            setImportOpen(false)
            loadStudents()
          }}
        />
      )}
    </div>
  )
}
