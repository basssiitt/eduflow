"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createExpense, fetchAdminStats } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Banknote, Calculator, Check, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, Image as ImageIcon, MessageCircle, Plus, Printer, ReceiptText, Search, Upload, Wallet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ZeroDataEmptyState } from "@/components/zero-data-empty-state"

type Transaction = {
  id: string
  date: string
  category: string
  description: string
  vendor: string
  amount: number
  status: string
  type: 'income' | 'expense'
}

const money = (amount: number) => `${amount < 0 ? "−" : ""}PKR ${Math.abs(amount).toLocaleString("en-PK")}`

export function FinanceWorkspace() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tab, setTab] = useState<"ledger" | "payroll" | "cash">("ledger")
  const [modal, setModal] = useState<"voucher" | null>(null)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All categories")
  const [toast, setToast] = useState("")
  const [voucherType, setVoucherType] = useState<'expense' | 'income'>('expense')
  const [voucher, setVoucher] = useState({ description: "", party: "", amount: "", category: "Utilities" })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const loadTransactions = async () => {
    setLoading(true)
    const { data } = await fetchAdminStats()
    if (data && data.expenses && data.expenses.length > 0) {
      setTransactions(
        data.expenses.map((exp: any, idx: number) => {
          const amt = Number(exp.amount) || 0
          const isIncome = exp.type === 'income' || amt > 0
          return {
            id: exp.id ? `VOU-${exp.id}` : `VOU-${idx + 1}`,
            date: exp.date ? new Date(exp.date).toLocaleDateString('en-GB') : "Today",
            category: exp.category || (isIncome ? "Fee collection" : "General"),
            description: exp.description || (isIncome ? "Income credit" : "Expense voucher"),
            vendor: exp.vendor || (isIncome ? "Payer / Student" : "Campus Vendor"),
            amount: isIncome ? Math.abs(amt) : -Math.abs(amt),
            status: "Cleared",
            type: isIncome ? 'income' : 'expense',
          }
        })
      )
    } else {
      setTransactions([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const filtered = useMemo(() =>
    transactions.filter((row) =>
      `${row.description} ${row.vendor} ${row.category}`.toLowerCase().includes(query.toLowerCase()) &&
      (category === "All categories" || row.category === category)
    ),
    [transactions, query, category]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const totalIncome = transactions.filter((x) => x.amount > 0).reduce((a, x) => a + x.amount, 0)
  const totalExpense = Math.abs(transactions.filter((x) => x.amount < 0).reduce((a, x) => a + x.amount, 0))
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2800) }

  const saveVoucher = async () => {
    if (!voucher.description || !voucher.party || !voucher.amount) return
    const rawAmt = Number(voucher.amount) || 0
    const finalAmount = voucherType === 'expense' ? rawAmt : rawAmt

    if (isSupabaseConfigured && supabaseClient) {
      try {
        await supabaseClient.from('expenses').insert([
          {
            description: voucher.description,
            vendor: voucher.party,
            category: voucher.category,
            amount: voucherType === 'expense' ? -Math.abs(finalAmount) : Math.abs(finalAmount),
            date: new Date().toISOString().split('T')[0],
          }
        ])
      } catch {}
    }

    setTransactions((rows) => [
      {
        id: `VOU-${Date.now().toString().slice(-4)}`,
        date: "Today",
        category: voucher.category,
        description: voucher.description,
        vendor: voucher.party,
        amount: voucherType === 'expense' ? -Math.abs(finalAmount) : Math.abs(finalAmount),
        status: "Cleared",
        type: voucherType,
      },
      ...rows,
    ])

    setModal(null)
    setVoucher({ description: "", party: "", amount: "", category: "Utilities" })
    notify(`${voucherType === 'income' ? 'Income credit' : 'Expense voucher'} logged successfully`)
  }

  const exportCsv = () => {
    const headers = ['Voucher ID', 'Date', 'Type', 'Category', 'Description', 'Party/Vendor', 'Amount']
    const rows = transactions.map((r) =>
      [r.id, r.date, r.type, r.category, r.description, r.vendor, r.amount]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const headerRow = headers.map((h) => `"${h}"`).join(',')
    const csvContent = [headerRow, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eduflow-finance-ledger.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="finance-page">
      <nav className="flex items-center justify-between text-xs text-slate-500 mb-6 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-emerald-600 transition flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Finance Ledger</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/fees" className="hover:text-emerald-600 transition font-medium text-slate-500">
            Fee Challans →
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/admin/billing" className="hover:text-emerald-600 transition font-medium text-slate-500">
            Campus Billing →
          </Link>
        </div>
      </nav>

      <header className="finance-page-header">
        <div>
          <span className="finance-eyebrow">FINANCE CONTROL CENTER</span>
          <h1>School Finance &amp; Operations</h1>
          <p>Track cashflow, income, expenses, and vouchers in one unified audit-ready ledger.</p>
        </div>
        <div className="finance-header-actions">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 size-4" /> Print report</Button>
          <Button onClick={() => setModal("voucher")} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="mr-2 size-4" /> Add Voucher</Button>
        </div>
      </header>

      {toast && <div className="finance-toast" role="status"><Check /> {toast}</div>}

      <section className="finance-kpis">
        <div>
          <span>Total Income</span>
          <strong className="income">{money(totalIncome)}</strong>
          <small>{transactions.filter(x => x.amount > 0).length} credits recorded</small>
        </div>
        <div>
          <span>Total Expenses</span>
          <strong className="expense">{money(totalExpense)}</strong>
          <small>{transactions.filter(x => x.amount < 0).length} debits recorded</small>
        </div>
        <div>
          <span>Net Cashflow</span>
          <strong className={totalIncome - totalExpense >= 0 ? "income" : "expense"}>
            {money(totalIncome - totalExpense)}
          </strong>
          <small>Academic Session 2026–27</small>
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
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={transactions.length === 0}>
              <Download className="mr-1.5 size-3.5" /> Export CSV
            </Button>
          </div>

          <div className="finance-filters">
            <label>
              <Search />
              <input placeholder="Search transactions..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
            </label>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option>All categories</option>
              <option>Fee collection</option>
              <option>Utilities</option>
              <option>Stationery</option>
              <option>Maintenance</option>
              <option>Transport</option>
              <option>Payroll</option>
              <option>General</option>
            </select>
            <span>{filtered.length} entries</span>
          </div>

          {transactions.length === 0 && !loading ? (
            <div className="p-6">
              <ZeroDataEmptyState
                icon={Wallet}
                title="No financial vouchers recorded"
                description="Record income credits or expense debits to keep your campus accounts audit-ready."
                actionLabel="Log Voucher"
                onAction={() => setModal("voucher")}
              />
            </div>
          ) : (
            <>
              <div className="finance-table-wrap">
                <table className="finance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transaction</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}<small>{row.id}</small></td>
                        <td><b>{row.description}</b><small>{row.vendor}</small></td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            row.amount >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                          }`}>
                            {row.amount >= 0 ? 'Credit / Income' : 'Debit / Expense'}
                          </span>
                        </td>
                        <td><span className="category-pill">{row.category}</span></td>
                        <td className={row.amount < 0 ? "amount-expense font-bold" : "amount-income font-bold"}>{money(row.amount)}</td>
                        <td><span className={`finance-status ${row.status.toLowerCase()}`}>{row.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="finance-card-footer flex items-center justify-between">
                <span>Showing {paginated.length} of {filtered.length} transactions</span>
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
          <div className="p-6">
            <ZeroDataEmptyState
              icon={Banknote}
              title="No payroll batch created"
              description="Staff salary sheets and automated attendance-adjusted pay-slips will appear here."
            />
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
          <div className="p-6">
            <ZeroDataEmptyState
              icon={Wallet}
              title="No petty cash closing entries"
              description="Daily petty cash reconciliation entries will appear here upon submission."
            />
          </div>
        </section>
      )}

      {modal === "voucher" && (
        <div className="finance-modal-backdrop">
          <div className="finance-modal">
            <button className="modal-close" onClick={() => setModal(null)} aria-label="Close"><X /></button>
            <span className="finance-eyebrow">ACCOUNTS VOUCHER</span>
            <h2>Log Voucher</h2>
            <p>Record a campus credit or debit voucher for accounts audit.</p>

            <div className="flex gap-2 my-3">
              <button
                type="button"
                onClick={() => setVoucherType('expense')}
                className={`flex-1 rounded-xl py-2 text-xs font-bold border transition-colors ${
                  voucherType === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500' : 'border-slate-200 text-slate-600'
                }`}
              >
                Expense (Debit)
              </button>
              <button
                type="button"
                onClick={() => setVoucherType('income')}
                className={`flex-1 rounded-xl py-2 text-xs font-bold border transition-colors ${
                  voucherType === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'border-slate-200 text-slate-600'
                }`}
              >
                Income (Credit)
              </button>
            </div>

            <label>Description *
              <input value={voucher.description} onChange={(e) => setVoucher({ ...voucher, description: e.target.value })} placeholder="e.g. Science lab equipment or Uniform fees" required />
            </label>

            <label>{voucherType === 'expense' ? 'Vendor / Payee *' : 'Received From *'}
              <input value={voucher.party} onChange={(e) => setVoucher({ ...voucher, party: e.target.value })} placeholder="e.g. Lab Equipment Supplier or Parent Name" required />
            </label>

            <div className="finance-form-row">
              <label>Category
                <select value={voucher.category} onChange={(e) => setVoucher({ ...voucher, category: e.target.value })}>
                  <option>Fee collection</option>
                  <option>Utilities</option>
                  <option>Stationery</option>
                  <option>Maintenance</option>
                  <option>Transport</option>
                  <option>Payroll</option>
                  <option>General</option>
                </select>
              </label>

              <label>Amount (PKR) *
                <input type="number" value={voucher.amount} onChange={(e) => setVoucher({ ...voucher, amount: e.target.value })} placeholder="15000" required />
              </label>
            </div>

            <div className="modal-actions">
              <button className="finance-btn secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="finance-btn primary" onClick={saveVoucher}>Save voucher</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
