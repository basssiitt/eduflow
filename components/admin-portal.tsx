"use client"
import { useState, useEffect, useMemo } from "react"
import { Check, Download, FileText, MessageCircle, Plus, Printer, Search, Upload, X } from "lucide-react"
import { BulkImportModal } from '@/components/bulk-import-modal'
import { ArrearsLedger } from '@/components/arrears-ledger'
import { TimetableScheduler } from '@/components/timetable-scheduler'
import { fetchAdminStats, fetchFeeInvoices, fetchStudents, createInvoice } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'

type Status = "Paid" | "Pending" | "Overdue"
type FeeRecord = { id?: string | number; challan: string; name: string; cls: string; tuition: number; arrears: number; due: string; status: Status }

const initialRows: FeeRecord[] = [
  { id: 1, challan: "CH-2026-089", name: "Ayesha Khan", cls: "Grade 8 · A", tuition: 18000, arrears: 0, due: "10-Aug-2026", status: "Paid" },
  { id: 2, challan: "CH-2026-090", name: "Hamza Siddiqui", cls: "Grade 8 · A", tuition: 18000, arrears: 3500, due: "10-Aug-2026", status: "Pending" },
  { id: 3, challan: "CH-2026-091", name: "Maham Ali", cls: "Grade 7 · B", tuition: 16500, arrears: 0, due: "05-Aug-2026", status: "Overdue" },
  { id: 4, challan: "CH-2026-092", name: "Usman Tariq", cls: "Grade 9 · A", tuition: 19500, arrears: 0, due: "10-Aug-2026", status: "Pending" },
  { id: 5, challan: "CH-2026-093", name: "Sara Ahmed", cls: "Grade 6 · C", tuition: 15000, arrears: 0, due: "10-Aug-2026", status: "Paid" },
]

const money = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`
const total = (r: FeeRecord) => r.tuition + r.arrears + 2000

function StatusBadge({ status }: { status: Status }) {
  return <span className={`admin-status admin-status-${status.toLowerCase()}`}><span />{status}</span>
}

function Challan({ r, label }: { r: FeeRecord; label: string }) {
  return (
    <article className="challan-copy">
      <b className="challan-copy-label">{label}</b>
      <div className="challan-heading">
        <div className="school-mark">SS</div>
        <div>
          <strong>The Smart Scholars Campus</strong>
          <span>Knowledge Avenue, Lahore · Branch 01</span>
        </div>
        <div className="challan-session">
          <small>SESSION</small>
          <b>2026-2027</b>
        </div>
      </div>
      <div className="challan-meta">
        <div><small>Student Name</small><b>{r.name}</b></div>
        <div><small>Roll No.</small><b>SS-1042</b></div>
        <div><small>Class</small><b>{r.cls}</b></div>
        <div><small>Month</small><b>August 2026</b></div>
        <div><small>Due Date</small><b>{r.due}</b></div>
      </div>
      <table className="challan-table">
        <tbody>
          <tr><td>Tuition Fee</td><td>{money(r.tuition)}</td></tr>
          <tr><td>Exam Fee</td><td>{money(1500)}</td></tr>
          <tr><td>Generator / Lab Fund</td><td>{money(500)}</td></tr>
          <tr><td>Late Surcharge / Arrears</td><td>{money(r.arrears)}</td></tr>
        </tbody>
        <tfoot>
          <tr><th>Total Amount Payable</th><th>{money(total(r))}</th></tr>
        </tfoot>
      </table>
      <div className="challan-footer">
        <div>
          <b>Bank Account &amp; 1Link</b>
          <span>HBL DHA Branch · A/C: 0102-0100-123456-01<br />1Link ID: 123456</span>
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
  const [data, setData] = useState<FeeRecord[]>(initialRows)
  const [filter, setFilter] = useState("All")
  const [liveStats, setLiveStats] = useState<{ students: number; attendance: any[]; invoices: any[]; expenses: any[] } | null>(null)
  const [selected, setSelected] = useState<FeeRecord | null>(null)
  const [query, setQuery] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    fetchAdminStats().then(({ data }) => {
      if (data) setLiveStats(data)
    })

    fetchFeeInvoices().then(({ data }) => {
      if (data && data.length > 0) {
        setData(
          data.map((inv: any, idx: number) => {
            const student = inv.students || {}
            return {
              id: inv.id,
              challan: `CH-2026-${String(idx + 100).padStart(3, '0')}`,
              name: student.name || `Student #${inv.student_id}`,
              cls: `${student.class || 'Class 5'} · ${student.section || 'A'}`,
              tuition: Number(inv.amount) || 15000,
              arrears: 0,
              due: inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB') : "10-Aug-2026",
              status: (inv.status || "Pending") as Status,
            }
          })
        )
      }
    })
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

    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
    }, 900)
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
    link.download = `eduflow-fee-register-august-2026.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="admin-page">
      <TimetableScheduler />
      <ArrearsLedger />
      <header className="admin-header no-print">
        <div>
          <span className="eyebrow">FINANCE · AUGUST 2026</span>
          <h1>Fee Management</h1>
          <p>Track collections, issue 3-copy challans, and keep families informed.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-primary" onClick={generate}>
            <Plus /> Generate August 2026 Invoices
          </button>
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
          <Check /> August invoices generated successfully for {data.length} students.
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
            <em className="trend-positive">+{Math.round((totalCollected / Math.max(totalRecoverable, 1)) * 100)}%</em>
          </div>
          <strong>{money(totalCollected)}</strong>
          <small className="positive-copy">↑ Live collection status</small>
        </article>
        <article className="summary-card">
          <div className="summary-top">
            <span>Pending / Overdue Fee</span>
            <em className="trend-warning">{pendingCount} invoices</em>
          </div>
          <strong>{Math.round((pendingCount / Math.max(data.length, 1)) * 100)}%</strong>
          <small>{pendingCount} invoices require attention</small>
        </article>
      </section>

      <section className="fee-section">
        <div className="fee-section-header">
          <div><span className="eyebrow">INVOICE REGISTER</span><h2>Student Fee Records</h2></div>
          <div className="admin-header-actions">
            <button data-testid="btn-bulk-import" className="admin-btn admin-btn-outline" onClick={() => setImportOpen(true)}>
              <Upload /> Bulk Import via Excel/CSV
            </button>
            <button className="admin-btn admin-btn-outline" onClick={exportCsv}>
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
        <div className="table-footer"><span>Showing {shown.length} of {data.length} invoices</span></div>
      </section>

      {selected && <Modal r={selected} close={() => setSelected(null)} />}
      {importOpen && <BulkImportModal onClose={() => setImportOpen(false)} />}
    </main>
  )
}

