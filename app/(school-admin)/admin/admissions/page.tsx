'use client'

import React, { useEffect, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  GraduationCap,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

export interface AdmissionItem {
  id: string
  trackingCode: string
  studentName: string
  dob: string
  gender: 'Male' | 'Female'
  gradeApplying: string
  previousSchool: string
  previousMarks: string
  fatherName: string
  fatherCnic: string
  guardianPhone: string
  guardianEmail: string
  residentialAddress: string
  city: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  appliedAt: string
}

const DEFAULT_APPLICATIONS: AdmissionItem[] = [
  {
    id: 'adm-001',
    trackingCode: 'ADM-2026-8942',
    studentName: 'Shahmeer Farooq',
    dob: '2015-08-14',
    gender: 'Male',
    gradeApplying: 'Class 5',
    previousSchool: 'Lahore Grammar School',
    previousMarks: '91% (Grade A*)',
    fatherName: 'Farooq Ahmad',
    fatherCnic: '35202-8819231-1',
    guardianPhone: '+92 300 4567891',
    guardianEmail: 'farooq.ahmad@gmail.com',
    residentialAddress: 'House 22, Sector B, DHA Phase 5',
    city: 'Lahore',
    status: 'pending',
    appliedAt: '2026-09-10T11:20:00Z',
  },
  {
    id: 'adm-002',
    trackingCode: 'ADM-2026-7731',
    studentName: 'Aleeza Naveed',
    dob: '2017-03-22',
    gender: 'Female',
    gradeApplying: 'Class 3',
    previousSchool: 'Army Public School',
    previousMarks: '85% (Grade A)',
    fatherName: 'Naveed Akhtar',
    fatherCnic: '35201-4491023-2',
    guardianPhone: '+92 321 9876543',
    guardianEmail: 'naveed.akhtar@yahoo.com',
    residentialAddress: 'Flat 4B, Gulberg Heights, Main Boulevard',
    city: 'Lahore',
    status: 'under_review',
    appliedAt: '2026-09-09T14:45:00Z',
  },
  {
    id: 'adm-003',
    trackingCode: 'ADM-2026-6190',
    studentName: 'Bilal Mustafa',
    dob: '2012-11-05',
    gender: 'Male',
    gradeApplying: 'Class 9 (Matric Science)',
    previousSchool: 'Divisional Public School',
    previousMarks: '88% (Grade A)',
    fatherName: 'Mustafa Kamal',
    fatherCnic: '35202-1182390-3',
    guardianPhone: '+92 333 1122334',
    guardianEmail: 'mustafa.kamal@outlook.com',
    residentialAddress: 'House 112, Block J, Johar Town',
    city: 'Lahore',
    status: 'approved',
    appliedAt: '2026-09-08T09:15:00Z',
  },
]

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionItem[]>(DEFAULT_APPLICATIONS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all')
  const [selectedApp, setSelectedApp] = useState<AdmissionItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load from localStorage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('eduflow-admissions')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with defaults
          setApplications([...parsed, ...DEFAULT_APPLICATIONS.filter((d) => !parsed.some((p: AdmissionItem) => p.id === d.id))])
        }
      }
    } catch {}
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const updateStatus = (id: string, newStatus: AdmissionItem['status']) => {
    const updated = applications.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    setApplications(updated)
    try {
      localStorage.setItem('eduflow-admissions', JSON.stringify(updated))
    } catch {}

    if (newStatus === 'approved') {
      showToast('Candidate approved! Successfully converted to enrolled student status.')
    } else if (newStatus === 'rejected') {
      showToast('Application marked as rejected.')
    } else {
      showToast(`Status updated to ${newStatus.replace('_', ' ')}.`)
    }
  }

  const deleteApplication = (id: string) => {
    const updated = applications.filter((app) => app.id !== id)
    setApplications(updated)
    try {
      localStorage.setItem('eduflow-admissions', JSON.stringify(updated))
    } catch {}
    setSelectedApp(null)
    showToast('Application removed.')
  }

  const filtered = applications.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesSearch =
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.fatherName.toLowerCase().includes(search.toLowerCase()) ||
      item.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
      item.gradeApplying.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    underReview: applications.filter((a) => a.status === 'under_review').length,
    approved: applications.filter((a) => a.status === 'approved').length,
  }

  const exportCSV = () => {
    const headers = ['Tracking Code', 'Student Name', 'Grade Applying', 'Father Name', 'Phone', 'City', 'Status', 'Date']
    const rows = filtered.map((a) => [
      a.trackingCode,
      a.studentName,
      a.gradeApplying,
      a.fatherName,
      a.guardianPhone,
      a.city,
      a.status,
      new Date(a.appliedAt).toLocaleDateString(),
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `eduflow-admissions-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Admissions roster exported to CSV.')
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Admissions & Enrollment Hub
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Online Admission Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Review online applicant submissions, schedule assessment tests, and 1-click enroll accepted candidates into the student directory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="size-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Applicants</span>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Users className="size-4" /></span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.total}</p>
          <span className="text-[11px] font-medium text-slate-500">Academic Session 2026–27</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600"><Clock className="size-4" /></span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">{stats.pending}</p>
          <span className="text-[11px] font-medium text-slate-500">Requires desk screening</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Test / Interview</span>
            <span className="rounded-lg bg-purple-50 p-2 text-purple-600"><GraduationCap className="size-4" /></span>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600">{stats.underReview}</p>
          <span className="text-[11px] font-medium text-slate-500">Scheduled for assessment</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Admitted & Enrolled</span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><CheckCircle2 className="size-4" /></span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{stats.approved}</p>
          <span className="text-[11px] font-medium text-slate-500">Official student records issued</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, tracking code, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['all', 'pending', 'under_review', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {s === 'all'
                ? 'All Applications'
                : s === 'under_review'
                ? 'Under Review'
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tracking Code</th>
                <th className="py-3.5 px-4">Candidate & Grade</th>
                <th className="py-3.5 px-4">Father / Guardian</th>
                <th className="py-3.5 px-4">Previous School & Marks</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No admission applications found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isApproved = item.status === 'approved'
                  const isPending = item.status === 'pending'
                  const isReview = item.status === 'under_review'
                  const isRejected = item.status === 'rejected'

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                          {item.trackingCode}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1">
                          {new Date(item.appliedAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 block font-bold text-sm">
                          {item.studentName}
                        </strong>
                        <span className="inline-block rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 mt-0.5">
                          {item.gradeApplying} • {item.gender}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-semibold block">{item.fatherName}</span>
                        <a
                          href={`https://wa.me/${item.guardianPhone.replace(/\D/g, '')}?text=Assalam-o-Alaikum%20Mr.%20${encodeURIComponent(item.fatherName)}%2C%20regarding%20the%20admission%20application%20for%20${encodeURIComponent(item.studentName)}...`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <MessageCircle className="size-3" /> {item.guardianPhone}
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 block truncate max-w-[180px]" title={item.previousSchool}>
                          {item.previousSchool}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold">{item.previousMarks}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isReview
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="size-3" />}
                          {isPending && <Clock className="size-3" />}
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== 'approved' && (
                            <button
                              onClick={() => updateStatus(item.id, 'approved')}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 shadow-xs transition"
                              title="Approve & Enroll Candidate"
                            >
                              <Check className="size-3.5" />
                            </button>
                          )}

                          {item.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(item.id, 'under_review')}
                              className="rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 p-1.5 border border-purple-200 transition"
                              title="Schedule Interview / Assessment"
                            >
                              <Clock className="size-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedApp(item)}
                            className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 font-bold text-[11px] transition"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => deleteApplication(item.id)}
                            className="rounded-lg text-slate-400 hover:text-red-600 p-1.5 transition"
                            title="Remove Application"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Application File</span>
                <h2 className="text-lg font-black text-slate-900">{selectedApp.studentName}</h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Tracking Code</span>
                  <strong className="font-mono text-slate-900">{selectedApp.trackingCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Applying For</span>
                  <strong className="text-slate-900">{selectedApp.gradeApplying}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth</span>
                  <strong className="text-slate-900">{selectedApp.dob} ({selectedApp.gender})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Previous Institution</span>
                  <strong className="text-slate-900">{selectedApp.previousSchool} ({selectedApp.previousMarks})</strong>
                </div>
              </div>

              <div className="p-3 border border-slate-100 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">Guardian Records</span>
                <p><strong>Father Name:</strong> {selectedApp.fatherName}</p>
                <p><strong>CNIC Number:</strong> {selectedApp.fatherCnic}</p>
                <p><strong>Phone:</strong> {selectedApp.guardianPhone}</p>
                <p><strong>Address:</strong> {selectedApp.residentialAddress}, {selectedApp.city}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <a
                href={`https://wa.me/${selectedApp.guardianPhone.replace(/\D/g, '')}?text=Assalam-o-Alaikum%2C%20this%20is%20EduFlow%20School%20Admissions%20Office%20regarding%20application%20${selectedApp.trackingCode}.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
              >
                <MessageCircle className="size-4" /> Message on WhatsApp
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(selectedApp.id, 'rejected')}
                  className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-xs font-bold hover:bg-red-100 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    updateStatus(selectedApp.id, 'approved')
                    setSelectedApp(null)
                  }}
                  className="rounded-xl bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
                >
                  Approve & Enroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
