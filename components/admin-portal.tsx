"use client"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Download, FileText, MessageCircle, Plus, Printer, ReceiptText, Search, Upload, X } from "lucide-react"
import { BulkImportModal } from '@/components/bulk-import-modal'
import { fetchFeeInvoices, fetchStudents, createInvoice } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'

type Status = "Paid" | "Pending" | "Overdue"
type FeeRecord = { id?: string | number; challan: string; name: string; cls: string; tuition: number; arrears: number; due: string; status: Status }

const money = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`
const total = (r: FeeRecord) => r.tuition + r.arrears

function StatusBadge({ status }: { status: Status }) {
  return <span className={`admin-status admin-status-${status.toLowerCase()}`}><span />{status}</span>
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
            <button className="admin-btn admin-btn-primary" onClick={() => window.print()}><Printer /> Print 3-Copy Slip</button>
            <button className="icon-btn" onClick={close} aria-label="Close"><X /></button>
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
          <Link href="/admin" className="hover:text-emerald-600 transition flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Fee Challans</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/students" className="hover:text-emerald-600 transition font-medium text-slate-500">
            Student Register →
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/admin/finance" className="hover:text-emerald-600 transition font-medium text-slate-500">
            Finance Ledger →
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/admin/billing" className="hover:text-emerald-600 transition font-medium text-slate-500">
            Campus Billing →
          </Link>
        </div>
      </nav>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end no-print">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Fee Challans &amp; Accounts</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Fee Management &amp; Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400">Track collections, issue 3-copy challans, and record payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="btn-bulk-import" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 size-4" /> Bulk Import CSV
          </Button>
          <Button
            onClick={generate}
            disabled={generating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
          >
            <Plus className="mr-2 size-4" /> Generate Invoices
          </Button>
        </div>
      </header>

      {generating && (
        <div className="generation-bar">
          <div>Generating invoices for all enrolled students… <b>Working</b></div>
          <div className="progress-track"><span /></div>
        </div>
      )}

      {generated && (
        <div className="success-banner">
          <Check /> Invoices generated successfully.
        </div>
      )}

      <section className="summary-grid">
        <article className="summary-card summary-primary">
          <div className="summary-icon"><FileText /></div>
          <span>Total Recoverable Fee</span>
          <strong>{money(totalRecoverable)}</strong>
          <small>Across {data.length} active invoices</small>
        </article>
        <article className="summary-card">
          <div className="summary-top">
            <span>Collected This Month</span>
            <em className="trend-positive">
              {totalRecoverable > 0 ? `${Math.round((totalCollected / totalRecoverable) * 100)}%` : '0%'}
            </em>
          </div>
          <strong>{money(totalCollected)}</strong>
          <small className="positive-copy">Live collection status</small>
        </article>
        <article className="summary-card">
          <div className="summary-top">
            <span>Pending Invoices</span>
            <em className="trend-warning">{pendingCount} invoices</em>
          </div>
          <strong>{data.length > 0 ? `${Math.round((pendingCount / data.length) * 100)}%` : '0%'}</strong>
          <small>{pendingCount} invoices outstanding</small>
        </article>
      </section>

      <section className="fee-section">
        <div className="fee-section-header">
          <div><span className="eyebrow">INVOICE REGISTER</span><h2>Student Fee Records</h2></div>
          <div className="admin-header-actions">
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={data.length === 0}>
              <Download className="mr-1.5 size-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="fee-controls">
          <div className="filter-tabs">
            {["All", "Paid", "Pending", "Overdue"].map((f) => (
              <button key={f} className={filter === f ? "active" : ""} onClick={() => { setFilter(f); setPage(1); }}>
                {f}
              </button>
            ))}
          </div>
          <label className="search-box">
            <Search />
            <input placeholder="Search student or challan…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          </label>
        </div>

        {data.length === 0 && !loading ? (
          <div className="mt-4">
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
            <div className="table-wrap" data-testid="fee-table">
              <table className="fee-table">
                <thead>
                  <tr>
                    <th>Challan No.</th>
                    <th>Student Name</th>
                    <th>Class &amp; Section</th>
                    <th>Monthly Tuition</th>
                    <th>Arrears</th>
                    <th>Total Payable</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r) => (
                    <tr key={r.challan}>
                      <td><b className="challan-number">{r.challan}</b></td>
                      <td>
                        <div className="student-cell">
                          <span>{r.name.split(" ").map((x) => x[0]).join("")}</span>
                          <b>{r.name}</b>
                        </div>
                      </td>
                      <td>{r.cls}</td>
                      <td>{money(r.tuition)}</td>
                      <td className={r.arrears ? "arrears" : "muted-cell"}>{r.arrears ? money(r.arrears) : "—"}</td>
                      <td><b>{money(total(r))}</b></td>
                      <td>{r.due}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        <div className="row-actions">
                          <button className="row-action" data-testid="btn-print-challan" onClick={() => setSelected(r)} title="Print challan">
                            <Printer />
                          </button>
                          <a className="row-action whatsapp" href={`https://wa.me/?text=${encodeURIComponent(`Fee reminder for ${r.name}: ${money(total(r))} due ${r.due}`)}`} target="_blank" rel="noreferrer" title="WhatsApp reminder">
                            <MessageCircle />
                          </a>
                          <button className="row-action" onClick={() => toggleStatus(r)} title="Mark as paid / pending">
                            <Check />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
              <span>Showing {paginated.length} of {shown.length} invoices</span>
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
