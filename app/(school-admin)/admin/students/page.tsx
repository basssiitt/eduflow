'use client'

import { useEffect, useState, useMemo } from 'react'
import { BulkImportModal } from '@/components/bulk-import-modal'
import { fetchStudents } from '@/lib/live-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Plus, Search, Upload, Users } from 'lucide-react'

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Academic Directory</Badge>
            <span className="text-sm text-muted-foreground">Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Student Register &amp; Enrollment</h1>
          <p className="text-muted-foreground">Manage enrolled students, parent contact details, and classroom assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 size-4" />
            Bulk CSV Import
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
              <button
                key={cls}
                onClick={() => setClassFilter(cls)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  classFilter === cls ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, roll no, or father..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        {students.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Users className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold">No students registered yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your campus roster is currently empty. Use Bulk CSV Import to enroll students into classes.
            </p>
            <Button className="mt-5" onClick={() => setImportOpen(true)}>
              <Upload className="mr-2 size-4" /> Bulk Import Students
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Roll No</th>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Father / Guardian</th>
                      <th className="px-4 py-3 font-medium">Class &amp; Section</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((s) => (
                      <tr key={s.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.roll_no}</td>
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.father_name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                            {s.class} · Section {s.section}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            Enrolled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {filtered.length} of {students.length} students</span>
              <Button variant="ghost" size="sm" onClick={() => window.print()} disabled={students.length === 0}>
                <Download className="mr-1 size-3" /> Print Roster
              </Button>
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
