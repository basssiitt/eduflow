"use client"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Download, FileText, MessageCircle, MoreHorizontal, Plus, Printer, ReceiptText, Search, TrendingUp, Upload, X } from "lucide-react"
import { BulkImportModal } from '@/components/bulk-import-modal'
import { fetchFeeInvoices, fetchStudents, createInvoice } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { TableCardSkeleton, MetricCardSkeleton } from '@/components/skeleton-cards'
import { cn } from '@/lib/utils'

type Status = "Paid" | "Pending" | "Overdue"
type FeeRecord = { id?: string | number; challan: string; name: string; cls: string; tuition: number; arrears: number; due: string; status: Status }

const money = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`
const total = (r: FeeRecord) => r.tuition + r.arrears

function StatusBadge({ status }: { status: Status }) {
  const tone = {
    Paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300',
    Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300',
    Overdue: 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300',
  }[status]
  const dot = {
    Paid: 'bg-emerald-500',
    Pending: 'bg-amber-500',
    Overdue: 'bg-rose-500',
  }[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', tone)}>
      <span className={cn('size-1.5 rounded-full', dot)} aria-hidden="true" />
      {status}
    </span>
  )
}

function Challan({ r, label }: { r: FeeRecord; label: string }) {
  return (
    <article className="challan-copy">
      <b className="challan-copy-label">{label}</b>
      <div className="challan-heading">
        <div className="school-mark">EF</div>
        <div>
          <strong>EduFlow OS Campus</strong>
          <span>Academic Node · Fee Challan</span>
        </div>
        <div className="challan-session">
          <small>SESSION</small>
          <b>2026-2027</b>
        </div>
      </div>
      <div className="challan-meta">
        <div><small>Student Name</small><b>{r.name}</b></div>
        <div><small>Challan No.</small><b>{r.challan}</b></div>
        <div><small>Class</small><b>{r.cls}</b></div>
        <div><small>Billing Month</small><b>Current Session</b></div>
        <div><small>Due Date</small><b>{r.due}</b></div>
      </div>
      <table className="challan-table">
        <tbody>
          <tr><td>Tuition Fee</td><td>{money(r.tuition)}</td></tr>
          {r.arrears > 0 && <tr><td>Arrears / Surcharge</td><td>{money(r.arrears)}</td></tr>}
        </tbody>
        <tfoot>
          <tr><th>Total Amount Payable</th><th>{money(total(r))}</th></tr>
        </tfoot>
      </table>
      <div className="challan-footer">
        <div>
          <b>Bank Account &amp; 1Link</b>
          <span>Designated Campus Account<br />1Link Bill Payment</span>
        </div>
        <div className="signature">
          <span>Cashier Signature</span>
          <span>Parent Signature</span>
        </div>
      </div>
    </article>
  )
}

function Modal({ r, close }: { r: FeeRecord; close: () => void }) {
  return (
    <div className="admin-modal-backdrop">
      <div className="challan-modal" role="dialog" aria-modal="true">
        <div className="modal-toolbar">
          <div><span className="eyebrow">PAYMENT DOCUMENT</span><h2>3-Copy Fee Challan</h2></div>
          <div className="modal-actions">
            <Button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs" onClick={() => window.print()}><Printer className="size-4 mr-2" /> Print 3-Copy Slip</Button>
            <button className="icon-btn" onClick={close} aria-label="Close"><X className="size-4" /></button>
          </div>
        </div>
        <div className="challan-stack">
          <Challan r={r} label="Bank Copy" />
          <Challan r={r} label="School Copy" />
          <Challan r={r} label="Parent Copy" />
        </div>
      </div>
    </div>
  )
}

export function AdminPortal() {
  const [data, setData] = useState<FeeRecord[]>([])
  const [filter, setFilter] = useState("All")
  const [selected, setSelected] = useState<FeeRecord | null>(null)
  const [query, setQuery] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const loadInvoices = async () => {
    setLoading(true)
    const { data: invoices } = await fetchFeeInvoices()
    if (invoices && invoices.length > 0) {
      setData(
        invoices.map((inv: any, idx: number) => {
          const student = inv.students || {}
          return {
            id: inv.id,
            challan: `CH-2026-${String(idx + 100).padStart(3, '0')}`,
            name: student.name || `Student #${inv.student_id}`,
            cls: student.class ? `${student.class} · ${student.section || 'A'}` : 'Enrolled',
            tuition: Number(inv.amount) || 0,
            arrears: 0,
            due: inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB') : "10-Aug-2026",
            status: (inv.status || "Pending") as Status,
          }
        })
      )
    } else {
      setData([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  const shown = useMemo(() => {
    return data.filter(
      (r) => (filter === "All" || r.status === filter) && `${r.name}${r.challan}`.toLowerCase().includes(query.toLowerCase())
    )
  }, [data, filter, query])

  const totalPages = Math.max(1, Math.ceil(shown.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return shown.slice(start, start + pageSize)
  }, [shown, page])

  const totalRecoverable = useMemo(() => data.reduce((acc, r) => acc + total(r), 0), [data])
  const totalCollected = useMemo(() => data.filter((r) => r.status === 'Paid').reduce((acc, r) => acc + total(r), 0), [data])
  const pendingCount = useMemo(() => data.filter((r) => r.status !== 'Paid').length, [data])

  const generate = async () => {
    setGenerating(true)
    setGenerated(false)

    const now = new Date()
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const year = now.getFullYear()
    const monthIndex = String(now.getMonth() + 1).padStart(2, '0')
    const dueDate = `${year}-${monthIndex}-10`

    // Generate real invoice entries for enrolled students
    const { data: studentList } = await fetchStudents()
    if (studentList && studentList.length > 0) {
      await Promise.all(
        studentList.map((s: any) =>
          createInvoice({
            student_id: s.id,
            amount: Number(s.tuition_fee) || 15000,
            status: 'Pending',
            month: currentMonth,
            due_date: dueDate,
          })
        )
      )
    } else {
      await createInvoice({
        amount: 15000,
        status: 'Pending',
        month: currentMonth,
        due_date: dueDate,
      })
    }

    await loadInvoices()
    setGenerating(false)
    setGenerated(true)
  }

  const toggleStatus = async (r: FeeRecord) => {
    const nextStatus: Status = r.status === "Paid" ? "Pending" : "Paid"
    setData((current) => current.map((x) => (x.challan === r.challan ? { ...x, status: nextStatus } : x)))
    if (isSupabaseConfigured && supabaseClient && r.id) {
      try {
        await supabaseClient.from('fee_invoices').update({ status: nextStatus }).eq('id', r.id)
      } catch {}
    }
  }

  const exportCsv = () => {
    const headers = ['Challan No', 'Student Name', 'Class', 'Monthly Tuition', 'Arrears', 'Total Payable', 'Due Date', 'Status']
    const rows = data.map((r) =>
      [r.challan, r.name, r.cls, r.tuition, r.arrears, total(r), r.due, r.status]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const headerRow = headers.map((h) => `"${h}"`).join(',')
    const csvContent = [headerRow, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eduflow-fee-register.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between text-xs text-slate-500 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-sky-600 transition flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Fee Challans</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/students" className="hover:text-sky-600 transition font-medium text-slate-500">
            Student Register →
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/admin/finance" className="hover:text-sky-600 transition font-medium text-slate-500">
            Finance Ledger →
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/admin/billing" className="hover:text-sky-600 transition font-medium text-slate-500">
            Campus Billing →
          </Link>
        </div>
      </nav>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Fee Challans &amp; Accounts</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Fee Management &amp; Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400">Track collections, issue 3-copy challans, and record payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="btn-bulk-import" onClick={() => setImportOpen(true)} className="border-slate-200 hover:border-sky-300 hover:text-sky-700 dark:border-slate-700">
            <Upload className="mr-2 size-4" /> Bulk Import CSV
          </Button>
          <Button
            onClick={generate}
            disabled={generating}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm shadow-sky-200"
          >
            <Plus className="mr-2 size-4" /> Generate Invoices
          </Button>
        </div>
      </header>

      {generating && (
        <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-medium text-sky-800 shadow-xs">
          <div className="size-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          <span>Generating invoices for all enrolled students… Please wait.</span>
        </div>
      )}

      {generated && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-xs">
          <Check className="size-4 text-emerald-600" aria-hidden="true" />
          <span>Invoices generated successfully for current academic cycle.</span>
        </div>
      )}

      {/* Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Recoverable Fee</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <FileText className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{money(totalRecoverable)}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Across {data.length} active invoices</span>
            <span className="font-medium text-slate-600 dark:text-slate-400">Session 2026–27</span>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Collected This Month</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{money(totalCollected)}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              +{totalRecoverable > 0 ? `${Math.round((totalCollected / totalRecoverable) * 100)}%` : '0%'} recovery rate
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Invoices</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <ReceiptText className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{pendingCount}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              {data.length > 0 ? `${Math.round((pendingCount / data.length) * 100)}%` : '0%'} uncollected
            </span>
          </div>
        </article>
      </section>

      {/* Table Section */}
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 dark:border-slate-800 p-5 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">INVOICE REGISTER</span>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-slate-100">Student Fee Records</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={data.length === 0} className="border-slate-200 hover:border-sky-300 hover:text-sky-700 dark:border-slate-700">
              <Download className="mr-1.5 size-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
            {["All", "Paid", "Pending", "Overdue"].map((f) => (
              <button
                key={f}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                  filter === f
                    ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              placeholder="Search student or challan…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-4 flex items-center justify-between animate-pulse">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="p-6">
            <ZeroDataEmptyState
              icon={ReceiptText}
              title="No fee invoices issued yet"
              description="Generate monthly fee challans for enrolled students or import existing fee records."
              actionLabel="Generate Invoices"
              onAction={generate}
              secondaryActionLabel="Bulk Import"
              onSecondaryAction={() => setImportOpen(true)}
              disabled={generating}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto" data-testid="fee-table">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Challan No.</th>
                    <th className="px-5 py-3.5">Student Name</th>
                    <th className="px-5 py-3.5">Class &amp; Section</th>
                    <th className="px-5 py-3.5">Monthly Tuition</th>
                    <th className="px-5 py-3.5">Arrears</th>
                    <th className="px-5 py-3.5">Total Payable</th>
                    <th className="px-5 py-3.5">Due Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginated.map((r) => (
                    <tr key={r.challan} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 rounded-md px-2 py-1">
                          {r.challan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                            {r.name.split(" ").map((x) => x[0]).join("")}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{r.cls}</td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">{money(r.tuition)}</td>
                      <td className="px-5 py-4">
                        {r.arrears > 0 ? (
                          <span className="font-semibold text-rose-600">{money(r.arrears)}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">{money(total(r))}</td>
                      <td className="px-5 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{r.due}</td>
                      <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-300 hover:text-sky-600 transition"
                            data-testid="btn-print-challan"
                            onClick={() => setSelected(r)}
                            title="Print challan"
                          >
                            <Printer className="size-3.5" />
                          </button>
                          <a
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:text-emerald-600 transition"
                            href={`https://wa.me/?text=${encodeURIComponent(`Fee reminder for ${r.name}: ${money(total(r))} due ${r.due}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp reminder"
                          >
                            <MessageCircle className="size-3.5" />
                          </a>
                          <button
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:text-emerald-600 transition"
                            onClick={() => toggleStatus(r)}
                            title="Mark as paid / pending"
                          >
                            <Check className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 dark:border-slate-800 p-4 text-xs text-slate-500">
              <span>Showing {paginated.length} of {shown.length} invoices</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="size-8 p-0 border-slate-200 dark:border-slate-700"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 font-medium">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="size-8 p-0 border-slate-200 dark:border-slate-700"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {selected && <Modal r={selected} close={() => setSelected(null)} />}
      {importOpen && (
        <BulkImportModal
          onClose={() => {
            setImportOpen(false)
            loadInvoices()
          }}
        />
      )}
    </div>
  )
}
