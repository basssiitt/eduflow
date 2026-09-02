'use client'

import { useEffect, useState, useMemo } from 'react'
import { BulkImportModal } from '@/components/bulk-import-modal'
import { fetchStudents } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Download, Plus, Search, Trash2, Upload, UserPlus, Users, X } from 'lucide-react'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'

type StudentRecord = {
  id: string | number
  name: string
  father_name: string
  roll_no: string
  class: string
  section: string
  guardian_phone?: string
  tuition_fee?: number
}

function AddStudentModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: () => void
}) {
  const [name, setName] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [className, setClassName] = useState('Class 5')
  const [section, setSection] = useState('A')
  const [phone, setPhone] = useState('')
  const [fee, setFee] = useState('15000')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !fatherName.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setSaving(true)
    setError('')

    const rollNo = `2026-${String(Math.floor(100 + Math.random() * 900))}`

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error: insertError } = await supabaseClient.from('students').insert([
          {
            name: name.trim(),
            father_name: fatherName.trim(),
            class: className,
            section: section,
            guardian_phone: phone.trim(),
            tuition_fee: Number(fee) || 15000,
            roll_no: rollNo,
          },
        ])

        if (insertError) {
          setError(insertError.message)
          setSaving(false)
          return
        }
      } catch (err: any) {
        setError(err.message || 'Failed to save student')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="add-student-title">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus className="size-5 text-emerald-600" />
              <h2 id="add-student-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">Admit New Student</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">Enter student details to add them to the active academic register.</p>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="size-4" />
          </button>
        </div>

        {error && <p className="mt-4 text-xs font-semibold text-rose-600">{error}</p>}

        <form onSubmit={handleSave} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
            Student Full Name *
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Muhammad Ali"
              required
              className="text-sm rounded-xl"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
            Father / Guardian Name *
            <Input
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="e.g. Tariq Mehmood"
              required
              className="text-sm rounded-xl"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Class
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 text-sm"
            >
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Section
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 text-sm"
            >
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            WhatsApp Phone No.
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 3XX XXXXXXX"
              className="text-sm rounded-xl"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Monthly Tuition Fee (PKR)
            <Input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="15000"
              className="text-sm rounded-xl"
            />
          </label>

          <div className="mt-2 flex items-center justify-end gap-2 sm:col-span-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              {saving ? 'Admitting…' : 'Admit Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [importOpen, setImportOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
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
          guardian_phone: s.guardian_phone ?? '',
          tuition_fee: Number(s.tuition_fee) || 15000,
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

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to remove this student from the active register?')) return
    if (isSupabaseConfigured && supabaseClient) {
      try {
        await supabaseClient.from('students').delete().eq('id', id)
      } catch {}
    }
    setStudents((curr) => curr.filter((s) => s.id !== id))
  }

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

  const exportCsv = () => {
    const headers = ['Roll No', 'Student Name', 'Father Name', 'Class', 'Section', 'Contact Phone', 'Tuition Fee']
    const rows = students.map((s) =>
      [s.roll_no, s.name, s.father_name, s.class, s.section, s.guardian_phone, s.tuition_fee]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const headerRow = headers.map((h) => `"${h}"`).join(',')
    const csvContent = [headerRow, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eduflow-students-roster.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

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
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="border-slate-300 dark:border-slate-700"
          >
            <Upload className="mr-2 size-4" />
            Bulk CSV Import
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
          >
            <Plus className="mr-2 size-4" />
            Admit Student
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
              <button
                key={cls}
                onClick={() => handleClassFilter(cls)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
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
              description="Your campus roster is currently empty. Admit your first student or use Bulk CSV Import."
              actionLabel="Admit Student"
              onAction={() => setAddOpen(true)}
              secondaryActionLabel="Bulk CSV Import"
              onSecondaryAction={() => setImportOpen(true)}
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
                      <th className="px-4 py-3.5">Contact Phone</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
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
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{s.guardian_phone || '—'}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                            Enrolled
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(s.id)}
                            className="size-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete student"
                          >
                            <Trash2 className="size-4" />
                          </Button>
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
                <Button variant="ghost" size="sm" onClick={exportCsv} disabled={students.length === 0} className="ml-2">
                  <Download className="mr-1.5 size-3.5" /> Export CSV
                </Button>
                <Button variant="ghost" size="sm" onClick={() => window.print()} disabled={students.length === 0}>
                  <Download className="mr-1.5 size-3.5" /> Print Roster
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {addOpen && (
        <AddStudentModal
          onClose={() => setAddOpen(false)}
          onAdded={() => loadStudents()}
        />
      )}

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
