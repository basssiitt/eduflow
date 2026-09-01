"use client"
import { useState, useEffect, useMemo } from "react"
import { Check, Download, FileText, MessageCircle, Plus, Printer, ReceiptText, Search, Upload, X } from "lucide-react"
import { BulkImportModal } from '@/components/bulk-import-modal'
import { fetchAdminStats, fetchFeeInvoices, fetchStudents, createInvoice } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'

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

  const totalRecoverable = useMemo(() => data.reduce((acc, r) => acc + total(r), 0), [data])
  const totalCollected = useMemo(() => data.filter((r) => r.status === 'Paid').reduce((acc, r) => acc + total(r), 0), [data])
  const pendingCount = useMemo(() => data.filter((r) => r.status !== 'Paid').length, [data])

  const generate = async () => {
    setGenerating(true)
    setGenerated(false)

    // Generate real invoice entries for enrolled students
    const { data: studentList } = await fetchStudents()
    if (studentList && studentList.length > 0) {
      await Promise.all(
        studentList.map((s: any) =>
          createInvoice({
            student_id: s.id,
            amount: 15000,
            status: 'Pending',
            month: 'August 2026',
            due_date: '2026-08-10',
          })
        )
      )
    } else {
      await createInvoice({
        amount: 15000,
        status: 'Pending',
        month: 'August 2026',
        due_date: '2026-08-10',
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
    const rows = data.map((r) => [r.challan, r.name, r.cls, r.tuition, r.arrears, total(r), r.due, r.status])
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eduflow-fee-register.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end no-print">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Fee Challans &amp; Accounts</span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Fee Management &amp; Invoices</h1>
          <p className="text-muted-foreground">Track collections, issue 3-copy challans, and record payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="btn-bulk-import" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 size-4" /> Bulk Import CSV
          </Button>
          <Button onClick={generate} disabled={generating}>
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
            <button className="admin-btn admin-btn-outline" onClick={exportCsv} disabled={data.length === 0}>
              <Download /> Export CSV
            </button>
          </div>
        </div>

        <div className="fee-controls">
          <div className="filter-tabs">
            {["All", "Paid", "Pending", "Overdue"].map((f) => (
              <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          <label className="search-box">
            <Search />
            <input placeholder="Search student or challan…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>

        {data.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center shadow-xs">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <ReceiptText className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold">No fee invoices issued yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Generate monthly fee challans for enrolled students or import existing fee records.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Button onClick={generate} disabled={generating}>
                <Plus className="mr-2 size-4" /> Generate Invoices
              </Button>
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload className="mr-2 size-4" /> Bulk Import
              </Button>
            </div>
          </div>
        ) : (
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
                {shown.map((r) => (
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
        )}
        <div className="table-footer"><span>Showing {shown.length} of {data.length} invoices</span></div>
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
