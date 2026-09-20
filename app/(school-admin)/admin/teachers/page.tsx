'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  fetchTeachers,
  createTeacher,
  deleteTeacher,
  TeacherRecord,
} from '@/lib/live-data'
import { addTeacher } from '@/app/actions/teachers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Wallet,
  X,
} from 'lucide-react'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { MetricCardSkeleton, TableRowSkeleton } from '@/components/skeleton-cards'
import { cn } from '@/lib/utils'

function AddTeacherModal({
  onClose,
  onAdded,
  existingCount = 0,
}: {
  onClose: () => void
  onAdded: () => void
  existingCount?: number
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tempPassword, setTempPassword] = useState('Teach#2026!')
  const [showTempPassword, setShowTempPassword] = useState(false)
  const autoEmployeeCode = `TCH-2026-${String(existingCount + 1).padStart(3, '0')}`
  const [qualification, setQualification] = useState('M.Sc / M.A Master Degree')
  const [department, setDepartment] = useState('Science & Math')
  const [subject, setSubject] = useState('Mathematics')
  const [classesInput, setClassesInput] = useState('Class 9-A, Class 10-A')
  const [salary, setSalary] = useState('75000')
  const [joiningDate, setJoiningDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Inactive'>('Active')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const departments = [
    'Science & Math',
    'Languages',
    'Humanities',
    'Arts & Sports',
    'IT & Computer Science',
  ]

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide teacher full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }
    if (!phone.trim()) {
      setError('Please provide a contact phone number.')
      return
    }
    if (!tempPassword.trim() || tempPassword.trim().length < 6) {
      setError('Please provide a temporary login password of at least 6 characters.')
      return
    }

    setSaving(true)
    setError('')

    const classesArray = classesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      tempPassword: tempPassword.trim(),
      employee_code: autoEmployeeCode,
      qualification: qualification.trim(),
      department,
      subject: subject.trim(),
      classes: classesArray.length > 0 ? classesArray : ['Class 5'],
      salary: Number(salary) || 65000,
      joining_date: joiningDate,
      status,
    }

    try {
      await addTeacher({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        tempPassword: tempPassword.trim(),
        qualification: qualification.trim(),
        department,
        subject: subject.trim(),
        classes: classesArray.length > 0 ? classesArray : ['Class 5'],
        salary: Number(salary) || 65000,
        joining_date: joiningDate,
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to onboard teacher')
      setSaving(false)
      return
    }

    setSaving(false)
    onAdded()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-teacher-title"
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <UserPlus className="size-4" />
              </div>
              <h2
                id="add-teacher-title"
                className="text-xl font-bold text-slate-900"
              >
                Onboard New Faculty Member
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Register teacher details, assign classes and subjects to campus roster.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Teacher Full Name *
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Tariq Mahmood"
              required
              className="mt-1 border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Email Address *
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tariq@school.edu.pk"
              required
              className="mt-1 border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Phone Number *
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
              required
              className="mt-1 border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Employee Code
                </span>
                <p className="font-mono text-xs font-bold text-slate-900">{autoEmployeeCode}</p>
              </div>
              <Badge className="bg-blue-600 text-white text-[10px]">Auto-Assigned</Badge>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              System auto-generates unique faculty codes.
            </p>
          </div>

          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Temporary Login Password *
            <div className="relative mt-1">
              <Input
                type={showTempPassword ? 'text' : 'password'}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Initial password for teacher login"
                required
                className="border-slate-200 pr-24 font-mono text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowTempPassword(!showTempPassword)}
                  className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                  {showTempPassword ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => setTempPassword(`Tch#${Math.floor(1000 + Math.random() * 9000)}!`)}
                  className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600 hover:bg-blue-100"
                >
                  Generate
                </button>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-normal">
              The teacher will use their email ({email || 'email address'}) and this password to sign in directly to the Teacher Portal.
            </span>
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Academic Qualification
            <Input
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g. M.Phil Mathematics (QAU)"
              className="mt-1 border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Department
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:border-blue-600 focus:outline-hidden text-slate-900"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Primary Subject
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics & Calculus"
              className="mt-1 border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Assigned Classes (comma-separated)
            <Input
              value={classesInput}
              onChange={(e) => setClassesInput(e.target.value)}
              placeholder="Class 9-A, Class 10-A, FSc-I"
              className="mt-1 border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-[11px] text-slate-400 font-normal">
              Separate each class section with a comma (e.g. Class 5-A, Class 6-B)
            </span>
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Monthly Base Salary (PKR)
            <Input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="75000"
              className="mt-1 font-mono border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Joining Date
            <Input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="mt-1 border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
            Status
            <div className="mt-2 flex gap-4">
              {(['Active', 'On Leave', 'Inactive'] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="teacher-status"
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-blue-600"
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </label>

          <div className="mt-4 flex items-center justify-end gap-2 sm:col-span-2 border-t border-slate-200 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
            >
              {saving ? 'Onboarding…' : 'Confirm & Onboard Teacher'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteTeacherModal({
  teacher,
  onClose,
  onConfirm,
}: {
  teacher: TeacherRecord | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!teacher) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-teacher-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <Trash2 className="size-5" />
          </div>
          <div>
            <h3
              id="delete-teacher-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Offboard Faculty Member
            </h3>
            <p className="text-xs text-slate-500">Confirm permanent removal from roster</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {teacher.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {teacher.employee_code} · {teacher.subject} ({teacher.department})
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {teacher.classes.map((cls) => (
              <span
                key={cls}
                className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              >
                {cls}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500 leading-relaxed">
          Are you sure you want to offboard this teacher? This will unassign them from their active
          classes and remove their employee profile from the campus register.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs"
          >
            Yes, Offboard Teacher
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 8

  const loadTeachers = async () => {
    setLoading(true)
    const { data } = await fetchTeachers()
    setTeachers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  const handleDelete = async () => {
    if (!teacherToDelete) return
    const id = teacherToDelete.id
    await deleteTeacher(id)
    setTeachers((curr) => curr.filter((t) => String(t.id) !== String(id)))
    setTeacherToDelete(null)
  }

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter
      const q = query.toLowerCase().trim()
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q) ||
        t.employee_code.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.qualification.toLowerCase().includes(q) ||
        t.classes.some((c) => c.toLowerCase().includes(q))
      return matchesStatus && matchesQuery
    })
  }, [teachers, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  // Metric stats
  const totalFaculty = teachers.length
  const activeToday = teachers.filter((t) => t.status === 'Active').length
  const totalMonthlyPayroll = teachers.reduce((acc, t) => acc + (t.salary || 0), 0)
  const avgClassLoad =
    teachers.length > 0
      ? (teachers.reduce((acc, t) => acc + t.classes.length, 0) / teachers.length).toFixed(1)
      : '0'

  const exportCsv = () => {
    const headers = [
      'Employee Code',
      'Name',
      'Email',
      'Phone',
      'Department',
      'Subject',
      'Qualification',
      'Assigned Classes',
      'Salary (PKR)',
      'Joining Date',
      'Status',
    ]
    const rows = filtered.map((t) => [
      t.employee_code,
      `"${t.name}"`,
      t.email,
      `"${t.phone}"`,
      `"${t.department}"`,
      `"${t.subject}"`,
      `"${t.qualification}"`,
      `"${t.classes.join(', ')}"`,
      t.salary,
      t.joining_date,
      t.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encoded = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encoded)
    link.setAttribute('download', `eduflow-faculty-register-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs text-slate-500 hover:text-blue-600 transition flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="size-3.5" /> Campus Admin
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 font-medium">
              Session 2026–2027
            </Badge>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Faculty &amp; Teachers
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Onboard new teachers, assign classes &amp; subjects, monitor workloads, and manage payroll.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={teachers.length === 0}
            className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs"
          >
            <Download className="mr-1.5 size-3.5 text-blue-600" /> Export Faculty CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs text-xs"
          >
            <UserPlus className="mr-1.5 size-4" /> Onboard Teacher
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Total Faculty Members</p>
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <GraduationCap className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                {totalFaculty}
              </p>
              <p className="mt-1 text-xs text-slate-500">Registered academic educators</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Active in Classroom</p>
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <UserCheck className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                {activeToday}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {totalFaculty > 0 ? `${Math.round((activeToday / totalFaculty) * 100)}%` : '0%'} on duty
                </span>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Avg Subject Load</p>
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <BookOpen className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                {avgClassLoad}
              </p>
              <p className="mt-1 text-xs text-slate-500">Classes per faculty member</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Monthly Faculty Payroll</p>
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Wallet className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                Rs. {totalMonthlyPayroll.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">Base salary commitment</p>
            </article>
          </>
        )}
      </section>

      {/* Main Faculty Table Section */}
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        {/* Table Filter and Search Header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              FACULTY DIRECTORY
            </span>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-slate-100">
              Campus Teaching Staff
            </h2>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {/* Status pills */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {['All', 'Active', 'On Leave', 'Inactive'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s)
                    setPage(1)
                  }}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                    statusFilter === s
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                placeholder="Search name, code, subject…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                className="h-9 w-full sm:w-64 pl-9 text-xs rounded-xl bg-white border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-4 divide-y divide-slate-100">
            <table className="w-full">
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRowSkeleton key={i} columns={6} />
                ))}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <ZeroDataEmptyState
              icon={GraduationCap}
              title="No faculty members found"
              description={
                query || statusFilter !== 'All'
                  ? 'Try clearing your search query or status filter.'
                  : 'Start by onboarding teachers to assign them to classes and record attendance.'
              }
              actionLabel="Onboard New Teacher"
              onAction={() => setAddOpen(true)}
              secondaryActionLabel={query || statusFilter !== 'All' ? 'Reset Filters' : undefined}
              onSecondaryAction={() => {
                setQuery('')
                setStatusFilter('All')
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Teacher Name</th>
                  <th className="px-5 py-3.5">Contact Number</th>
                  <th className="px-5 py-3.5">Assigned Class(es)</th>
                  <th className="px-5 py-3.5">Assigned Subject(s)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((teacher) => {
                  const statusTone = {
                    Active:
                      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20',
                    'On Leave':
                      'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20',
                    Inactive:
                      'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20',
                  }[teacher.status]

                  const dotColor = {
                    Active: 'bg-emerald-500',
                    'On Leave': 'bg-amber-500',
                    Inactive: 'bg-slate-400',
                  }[teacher.status]

                  return (
                    <tr
                      key={teacher.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Teacher Profile */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700">
                            {teacher.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {teacher.name}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              {teacher.employee_code} · {teacher.qualification}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Number */}
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-semibold text-slate-800">
                          {teacher.phone || '—'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {teacher.email}
                        </div>
                      </td>

                      {/* Assigned Classes */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {teacher.classes.map((cls) => (
                            <span
                              key={cls}
                              className="rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Assigned Subject(s) */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {teacher.subject}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${dotColor} ${teacher.status === 'Active' ? 'animate-pulse' : ''}`}
                            aria-hidden="true"
                          />
                          {teacher.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct phone call */}
                          {teacher.phone && (
                            <a
                              href={`tel:${teacher.phone}`}
                              title="Call teacher"
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition"
                            >
                              <Phone className="size-3.5" />
                            </a>
                          )}

                          {/* Email contact */}
                          {teacher.email && (
                            <a
                              href={`mailto:${teacher.email}?subject=EduFlow Campus Notification`}
                              title="Email teacher"
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 transition"
                            >
                              <Mail className="size-3.5" />
                            </a>
                          )}

                          {/* Delete / Offboard */}
                          <button
                            onClick={() => setTeacherToDelete(teacher)}
                            title="Offboard / Remove teacher"
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          <span>
            Showing {paginated.length} of {filtered.length} faculty members
          </span>
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
            <span className="px-2 font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="size-8 p-0"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      {addOpen && (
        <AddTeacherModal
          onClose={() => setAddOpen(false)}
          onAdded={loadTeachers}
          existingCount={teachers.length}
        />
      )}

      {teacherToDelete && (
        <DeleteTeacherModal
          teacher={teacherToDelete}
          onClose={() => setTeacherToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
