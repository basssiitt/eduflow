"use client"

import { useEffect, useMemo, useState } from "react"
import { createExpense, fetchAdminStats } from '@/lib/live-data'
import { ArrowDownLeft, ArrowUpRight, Banknote, Calculator, Check, ChevronDown, FileText, Image as ImageIcon, MessageCircle, Plus, Printer, ReceiptText, Search, Upload, Wallet, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Transaction = {
  id: string
  date: string
  category: string
  description: string
  vendor: string
  amount: number
  status: string
  receipt: boolean
}

const money = (amount: number) => `${amount < 0 ? "−" : ""}PKR ${Math.abs(amount).toLocaleString("en-PK")}`

export function FinanceWorkspace() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tab, setTab] = useState<"ledger" | "payroll" | "cash">("ledger")
  const [modal, setModal] = useState<"expense" | "payroll" | "cash" | null>(null)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All categories")
  const [toast, setToast] = useState("")
  const [expense, setExpense] = useState({ description: "", vendor: "", amount: "", category: "Utilities" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats().then(({ data }) => {
      if (data && data.expenses && data.expenses.length > 0) {
        setTransactions(
          data.expenses.map((exp: any, idx: number) => ({
            id: exp.id ? `EXP-${exp.id}` : `EXP-${idx + 1}`,
            date: exp.date ? new Date(exp.date).toLocaleDateString('en-GB') : "Today",
            category: exp.category || "General",
            description: exp.description || "Expense voucher",
            vendor: exp.vendor || "Campus Vendor",
            amount: -Math.abs(Number(exp.amount) || 0),
            status: "Cleared",
            receipt: true,
          }))
        )
      } else {
        setTransactions([])
      }
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => transactions.filter((row) => `${row.description} ${row.vendor} ${row.category}`.toLowerCase().includes(query.toLowerCase()) && (category === "All categories" || row.category === category)), [transactions, query, category])
  const totalIncome = transactions.filter((x) => x.amount > 0).reduce((a, x) => a + x.amount, 0)
  const totalExpense = Math.abs(transactions.filter((x) => x.amount < 0).reduce((a, x) => a + x.amount, 0))
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2800) }

  const addExpense = async () => {
    if (!expense.description || !expense.vendor || !expense.amount) return
    const amount = Number(expense.amount)
    const result = await createExpense({ description: expense.description, vendor: expense.vendor, category: expense.category, amount })
    setTransactions((rows) => [{ id: `EXP-${Date.now().toString().slice(-4)}`, date: "Today", category: expense.category, description: expense.description, vendor: expense.vendor, amount: -amount, status: result.error ? "Pending" : "Cleared", receipt: true }, ...rows])
    setModal(null)
    setExpense({ description: "", vendor: "", amount: "", category: "Utilities" })
    notify("Expense voucher saved to the ledger")
  }

  return (
    <main className="finance-page">
      <header className="finance-page-header">
        <div>
          <span className="finance-eyebrow">FINANCE CONTROL CENTER</span>
          <h1>School Finance &amp; Operations</h1>
          <p>Track cashflow, expenses, payroll, and vouchers in one unified ledger.</p>
        </div>
        <div className="finance-header-actions">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 size-4" /> Print report</Button>
          <Button onClick={() => setModal("expense")}><Plus className="mr-2 size-4" /> Add expense voucher</Button>
        </div>
      </header>

      {toast && <div className="finance-toast" role="status"><Check /> {toast}</div>}

      <section className="finance-kpis">
        <div>
          <span>Total Income</span>
          <strong className="income">{money(totalIncome)}</strong>
          <small>{transactions.filter(x => x.amount > 0).length} deposits recorded</small>
        </div>
        <div>
          <span>Total Expenses</span>
          <strong className="expense">{money(totalExpense)}</strong>
          <small>{transactions.filter(x => x.amount < 0).length} vouchers recorded</small>
        </div>
        <div>
          <span>Net Cashflow</span>
          <strong className={totalIncome - totalExpense >= 0 ? "income" : "expense"}>
            {money(totalIncome - totalExpense)}
          </strong>
          <small>Current Session</small>
        </div>
      </section>

      <nav className="finance-tabs" aria-label="Finance sections">
        <button className={tab === "ledger" ? "active" : ""} onClick={() => setTab("ledger")}><ReceiptText /> Transaction ledger</button>
        <button className={tab === "payroll" ? "active" : ""} onClick={() => setTab("payroll")}><Banknote /> Salary sheet</button>
        <button className={tab === "cash" ? "active" : ""} onClick={() => setTab("cash")}><Wallet /> Petty cash closing</button>
      </nav>

      {tab === "ledger" && (
        <section className="finance-card">
          <div className="finance-card-heading">
            <div>
              <span className="finance-eyebrow">ACADEMIC SESSION</span>
              <h2>Income &amp; Expense Ledger</h2>
            </div>
            <button className="finance-btn secondary" onClick={() => notify("CSV export prepared")} disabled={transactions.length === 0}>
              Export CSV
            </button>
          </div>
          <div className="finance-filters">
            <label>
              <Search />
              <input placeholder="Search transactions..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All categories</option>
              <option>Utilities</option>
              <option>Stationery</option>
              <option>Maintenance</option>
              <option>Payroll</option>
              <option>Fee collection</option>
            </select>
            <span>{filtered.length} entries</span>
          </div>

          {transactions.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Wallet className="size-7" />
              </div>
              <h3 className="mt-4 text-base font-semibold">No financial transactions recorded</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Record vouchers and track school expenses to keep your campus audit-ready.
              </p>
              <Button className="mt-5" onClick={() => setModal("expense")}>
                <Plus className="mr-2 size-4" /> Add Expense Voucher
              </Button>
            </div>
          ) : (
            <div className="finance-table-wrap">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date}<small>{row.id}</small></td>
                      <td><b>{row.description}</b><small>{row.vendor} {row.receipt && "· Receipt attached"}</small></td>
                      <td><span className="category-pill">{row.category}</span></td>
                      <td className={row.amount < 0 ? "amount-expense" : "amount-income"}>{money(row.amount)}</td>
                      <td><span className={`finance-status ${row.status.toLowerCase()}`}>{row.status}</span></td>
                      <td>
                        <button className="table-action" onClick={() => notify(`Details opened for ${row.id}`)}>
                          {row.receipt ? <ImageIcon /> : <FileText />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <footer className="finance-card-footer">
            <span>Showing {filtered.length} of {transactions.length} transactions</span>
            <span><Calculator /> Verified</span>
          </footer>
        </section>
      )}

      {tab === "payroll" && (
        <section className="finance-card payroll-sheet">
          <div className="finance-card-heading">
            <div>
              <span className="finance-eyebrow">CAMPUS STAFF</span>
              <h2>Staff Payroll &amp; Disbursal</h2>
              <p>Manage employee salary disbursements and pay-slips.</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Banknote className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold">No payroll batch created</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Staff salary sheets and automated attendance-adjusted pay-slips will appear here.
            </p>
          </div>
        </section>
      )}

      {tab === "cash" && (
        <section className="finance-card cash-closing">
          <div className="finance-card-heading">
            <div>
              <span className="finance-eyebrow">DAILY RECONCILIATION</span>
              <h2>Petty Cash Balance</h2>
              <p>Count, reconcile, and sign off petty cash for today.</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Wallet className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold">No petty cash closing entries</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Daily petty cash reconciliation entries will appear here upon submission.
            </p>
          </div>
        </section>
      )}

      {modal === "expense" && (
        <div className="finance-modal-backdrop">
          <div className="finance-modal">
            <button className="modal-close" onClick={() => setModal(null)} aria-label="Close"><X /></button>
            <span className="finance-eyebrow">NEW VOUCHER</span>
            <h2>Add Expense Voucher</h2>
            <p>Record a campus operational expense for audit readiness.</p>
            <label>Description
              <input value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} placeholder="e.g. Science lab equipment" required />
            </label>
            <label>Vendor
              <input value={expense.vendor} onChange={(e) => setExpense({ ...expense, vendor: e.target.value })} placeholder="e.g. Science Lab Supplies" required />
            </label>
            <div className="finance-form-row">
              <label>Category
                <select value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })}>
                  <option>Utilities</option>
                  <option>Stationery</option>
                  <option>Maintenance</option>
                  <option>Transport</option>
                  <option>General</option>
                </select>
              </label>
              <label>Amount (PKR)
                <input type="number" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} placeholder="0" required />
              </label>
            </div>
            <div className="modal-actions">
              <button className="finance-btn secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="finance-btn primary" onClick={addExpense}>Save voucher</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
