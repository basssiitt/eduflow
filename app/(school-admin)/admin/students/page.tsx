'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { BulkImportModal } from '@/components/bulk-import-modal'
import { fetchStudents } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Plus, Search, Trash2, Upload, UserPlus, Users, X } from 'lucide-react'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { cn } from '@/lib/utils'

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
      <div className="w-full max-w-lg rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus className="size-5 text-[#2c1d17]" />
              <h2 id="add-student-title" className="text-xl font-bold text-slate-900">Admit New Student</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">Enter student details to add them to the active academic register.</p>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        {error && <p className="mt-4 text-xs font-semibold text-rose-600">{error}</p>}

        <form onSubmit={handleSave} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 sm:col-span-2">
            Student Full Name *
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Muhammad Ali"
              required
              className="text-sm rounded-xl border-[#e7e2da] focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 sm:col-span-2">
            Father / Guardian Name *
            <Input
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="e.g. Tariq Mehmood"
              required
              className="text-sm rounded-xl border-[#e7e2da] focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
            Class
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="h-10 rounded-xl border border-[#e7e2da] bg-background px-3 text-sm font-medium text-[#2c1d17]"
            >
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
            Section
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-10 rounded-xl border border-[#e7e2da] bg-background px-3 text-sm font-medium text-[#2c1d17]"
            >
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
            WhatsApp Phone No.
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 3XX XXXXXXX"
              className="text-sm rounded-xl border-[#e7e2da] focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
            Monthly Tuition Fee (PKR)
            <Input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="15000"
              className="text-sm rounded-xl border-[#e7e2da] focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20"
            />
          </label>

          <div className="mt-2 flex items-center justify-end gap-2 sm:col-span-2">
            <Button variant="outline" type="button" onClick={onClose} className="rounded-xl border-[#e7e2da] text-[#2c1d17] hover:bg-[#faf9f5]">Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-[#2c1d17] hover:bg-[#1e130f] text-white font-semibold rounded-xl shadow-xs">
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
    // ubs:ignore - user explicit confirmation prompt
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
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-[#2c1d17] transition flex items-center gap-1 text-slate-600">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Student Register</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/attendance" className="hover:text-[#2c1d17] transition font-medium text-slate-500">
            Attendance Register →
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/admin/fees" className="hover:text-[#2c1d17] transition font-medium text-slate-500">
            Fee Challans →
          </Link>
        </div>
      </nav>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#faf9f5] text-[#2c1d17] border-[#e7e2da] font-semibold">
              Academic Directory
            </Badge>
            <span className="text-sm text-slate-500">Session 2026–2027</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Student Register &amp; Enrollment</h1>
          <p className="text-slate-500">Manage enrolled students, parent contact details, and classroom assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="border-[#e7e2da] hover:border-[#c5a059] hover:bg-[#faf9f5] hover:text-[#2c1d17]"
          >
            <Upload className="mr-2 size-4 text-[#c5a059]" />
            Bulk CSV Import
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-[#2c1d17] hover:bg-[#1e130f] text-white shadow-xs font-semibold"
          >
            <Plus className="mr-2 size-4" />
            Admit Student
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
              <button
                key={cls}
                onClick={() => handleClassFilter(cls)}
                className={cn(
                  'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all',
                  classFilter === cls
                    ? 'bg-[#2c1d17] text-white shadow-xs'
                    : 'bg-[#faf9f5] text-[#5c4a3e] border border-[#e7e2da] hover:bg-[#f7f5f0]'
                )}
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
              className="pl-9 text-xs rounded-xl border-[#e7e2da] bg-white focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-5 divide-y divide-[#e7e2da]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-4 flex items-center justify-between animate-pulse">
                <div className="h-4 w-20 bg-slate-200 rounded-md" />
                <div className="h-4 w-36 bg-slate-200 rounded-md" />
                <div className="h-4 w-24 bg-slate-200 rounded-md" />
                <div className="h-4 w-16 bg-slate-200 rounded-md" />
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
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
            <div className="mt-5 overflow-hidden rounded-xl border border-[#e7e2da]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#e7e2da] bg-[#faf9f5] text-xs font-bold uppercase tracking-wider text-[#5c4a3e]">
                    <tr>
                      <th className="px-5 py-3.5">Roll No</th>
                      <th className="px-5 py-3.5">Student Name</th>
                      <th className="px-5 py-3.5">Father / Guardian</th>
                      <th className="px-5 py-3.5">Class &amp; Section</th>
                      <th className="px-5 py-3.5">Contact Phone</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e2da]">
                    {paginated.map((s) => (
                      <tr key={s.id} className="transition-colors hover:bg-[#faf9f5]">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-bold text-[#2c1d17] bg-[#faf9f5] border border-[#e7e2da] rounded px-2 py-0.5">
                            {s.roll_no}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f7f5f0] border border-[#e7e2da] text-xs font-bold text-[#2c1d17]">
                              {s.name.split(" ").map((x) => x[0]).join("")}
                            </div>
                            <span className="font-semibold text-slate-900">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{s.father_name || '—'}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-[#f7f5f0] border border-[#e7e2da] px-2.5 py-1 text-xs font-semibold text-[#2c1d17]">
                            {s.class} · Section {s.section}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-500">{s.guardian_phone || '—'}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            Enrolled
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
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

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
              <span>Showing {paginated.length} of {filtered.length} students</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="size-8 p-0 border-[#e7e2da] hover:border-[#c5a059]"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 font-medium">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="size-8 p-0 border-[#e7e2da] hover:border-[#c5a059]"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={exportCsv} disabled={students.length === 0} className="ml-2 hover:text-[#2c1d17]">
                  <Download className="mr-1.5 size-3.5" /> Export CSV
                </Button>
                <Button variant="ghost" size="sm" onClick={() => window.print()} disabled={students.length === 0} className="hover:text-[#2c1d17]">
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
