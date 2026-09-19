"use client"

import { useMemo, useState } from "react"
import { Check, Download, FileText, Printer, ReceiptText, Search, Send, X } from "lucide-react"

type Row = { id: number; name: string; roll: string; grade: string; guardian: string; phone: string; due: string; paid: number; total: number; months: number; last: string }
const money = (n: number) => `PKR ${n.toLocaleString()}`

export function ArrearsLedger() {
  const [rows, setRows] = useState<Row[]>([])
  const [filter, setFilter] = useState("All Arrears")
  const [query, setQuery] = useState("")
  const [pay, setPay] = useState<Row | null>(null)
  const [notice, setNotice] = useState<Row | null>(null)
  const [broadcast, setBroadcast] = useState(false)
  const [sent, setSent] = useState(false)
  const [paid, setPaid] = useState("")

  const filtered = useMemo(
    () => rows.filter(r => (filter === "All Arrears" ? r.paid < r.total : filter === "Overdue 60+" ? r.months >= 2 : r.paid === 0) && (`${r.name} ${r.roll} ${r.guardian}`).toLowerCase().includes(query.toLowerCase())),
    [rows, filter, query]
  )

  const outstanding = rows.reduce((a, r) => a + r.total - r.paid, 0)
  const collected = rows.reduce((a, r) => a + r.paid, 0)
  const overdue = rows.filter(r => r.paid < r.total).length

  const savePayment = () => {
    const amount = Math.max(0, Number(paid) || 0)
    if (!pay) return
    setRows(rs => rs.map(r => r.id === pay.id ? { ...r, paid: Math.min(r.total, r.paid + amount), last: "Today" } : r))
    setPay(null)
    setPaid("")
  }

  return (
    <section className="arrears-workspace">
      <div className="arrears-heading">
        <div>
          <div className="eyebrow">Fees / Arrears Recovery</div>
          <h2>Fee Arrears &amp; Broadcast Ledger</h2>
          <p>Track outstanding balances and send payment reminders.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setBroadcast(true)} disabled={overdue === 0}>
          <Send /> Broadcast to {overdue} defaulters
        </button>
      </div>

      <div className="arrears-kpis">
        <div>
          <span>Total outstanding</span>
          <strong>{money(outstanding)}</strong>
          <small>Across {overdue} active arrears</small>
        </div>
        <div>
          <span>Collected this month</span>
          <strong className="green-copy">{money(collected)}</strong>
          <small>Live recoveries</small>
        </div>
        <div>
          <span>Overdue Accounts</span>
          <strong>{overdue}</strong>
          <small>Pending action</small>
        </div>
      </div>

      <div className="arrears-controls">
        <div className="filter-tabs">
          {["All Arrears", "Overdue 60+", "No Payment"].map(f => (
            <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search />
          <input aria-label="Search arrears" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student or guardian..." />
        </label>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center shadow-xs">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ReceiptText className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold">No arrears recorded</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            All student fee payments are up to date. No overdue arrears detected.
          </p>
        </div>
      ) : (
        <div className="arrears-table-wrap">
          <table className="arrears-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Guardian</th>
                <th>Fee due</th>
                <th>Months</th>
                <th>Last payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="ledger-student">
                      <span>{r.name.split(" ").map(x => x[0]).join("")}</span>
                      <div><b>{r.name}</b><small>{r.roll} · {r.grade}</small></div>
                    </div>
                  </td>
                  <td>{r.guardian}<small className="phone">{r.phone}</small></td>
                  <td><b className="due-amount">{money(r.total - r.paid)}</b><small>of {money(r.total)}</small></td>
                  <td><span className="month-pill">{r.months || "—"}</span></td>
                  <td className={r.last === "Never" ? "muted-cell" : ""}>{r.last}</td>
                  <td><span className={`admin-status ${r.paid === 0 ? "admin-status-overdue" : "admin-status-pending"}`}><i />{r.paid === 0 ? "No payment" : "Partial"}</span></td>
                  <td>
                    <div className="ledger-actions">
                      <button className="row-action" onClick={() => setPay(r)} aria-label={`Record payment for ${r.name}`}><Check /></button>
                      <button className="row-action" onClick={() => setNotice(r)} aria-label={`Print notice for ${r.name}`}><Printer /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="ledger-footer">
        <span>Showing {filtered.length} of {overdue} active arrears</span>
        <div>
          <button className="admin-btn admin-btn-outline" onClick={() => window.print()} disabled={rows.length === 0}><Download /> Export ledger PDF</button>
        </div>
      </div>

      {pay && (
        <div className="admin-modal-backdrop">
          <div className="small-modal">
            <button className="modal-close" onClick={() => setPay(null)}><X /></button>
            <div className="eyebrow">Payment entry</div>
            <h2>Record partial payment</h2>
            <p>Update the balance for <b>{pay.name}</b>.</p>
            <label>Amount received
              <input autoFocus value={paid} onChange={e => setPaid(e.target.value)} placeholder="e.g. 10000" inputMode="numeric" />
            </label>
            <div className="modal-actions">
              <button className="admin-btn admin-btn-outline" onClick={() => setPay(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={savePayment}>Save payment</button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="admin-modal-backdrop">
          <div className="notice-modal">
            <div className="notice-actions">
              <button className="admin-btn admin-btn-outline" onClick={() => window.print()}><Printer /> Print notice</button>
              <button className="modal-close" onClick={() => setNotice(null)}><X /></button>
            </div>
            <div className="eyebrow">Confidential fee notice</div>
            <h2>Payment reminder</h2>
            <p>Dear {notice.guardian},</p>
            <p>This is a reminder that <b>{notice.name}</b> ({notice.roll}) has an outstanding school fee balance of <b>{money(notice.total - notice.paid)}</b>.</p>
            <p>Please contact the accounts office to arrange payment.</p>
            <div className="notice-sign">EduFlow Campus Accounts Office</div>
          </div>
        </div>
      )}

      {broadcast && (
        <div className="admin-modal-backdrop">
          <div className="broadcast-modal">
            <button className="modal-close" onClick={() => { setBroadcast(false); setSent(false) }}><X /></button>
            {sent ? (
              <div className="broadcast-success">
                <div className="success-icon"><Check /></div>
                <h2>Broadcast queued</h2>
                <p>{overdue} reminders queued for SMS notification delivery.</p>
                <button className="admin-btn admin-btn-primary" onClick={() => { setBroadcast(false); setSent(false) }}>Done</button>
              </div>
            ) : (
              <>
                <div className="eyebrow">SMS Broadcast</div>
                <h2>Send Reminders</h2>
                <p>Queue payment reminders for {overdue} accounts.</p>
                <div className="modal-actions">
                  <button className="admin-btn admin-btn-outline" onClick={() => setBroadcast(false)}>Cancel</button>
                  <button className="admin-btn admin-btn-primary" onClick={() => setSent(true)}><Send /> Queue {overdue} reminders</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
