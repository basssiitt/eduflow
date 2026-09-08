"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createExpense, fetchAdminStats } from '@/lib/live-data'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Percent,
  Plus,
  Printer,
  ReceiptText,
  Search,
  TrendingDown,
  TrendingUp,
  Upload,
  UserCheck,
  Wallet,
  X,
} from "lucide-react"
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

type PayrollRecord = {
  id: string
  code: string
  name: string
  role: string
  department: string
  baseSalary: number
  absences: number
  deduction: number
  allowances: number
  netSalary: number
  status: 'Paid' | 'Pending'
  disbursedDate?: string
}

const money = (amount: number) => `${amount < 0 ? "−" : ""}PKR ${Math.abs(amount).toLocaleString("en-PK")}`

const initialStaff: PayrollRecord[] = [
  { id: '1', code: 'TCH-2026-001', name: 'Muhammad Asad', role: 'Head of Sciences', department: 'Sciences', baseSalary: 75000, absences: 0, deduction: 0, allowances: 5000, netSalary: 80000, status: 'Paid', disbursedDate: '01-Oct-2026' },
  { id: '2', code: 'TCH-2026-002', name: 'Fatima Noor', role: 'Senior English Teacher', department: 'Languages', baseSalary: 62000, absences: 1, deduction: 2000, allowances: 2000, netSalary: 62000, status: 'Paid', disbursedDate: '01-Oct-2026' },
  { id: '3', code: 'TCH-2026-003', name: 'Tariq Mehmood', role: 'Mathematics Lead', department: 'Sciences', baseSalary: 70000, absences: 0, deduction: 0, allowances: 3000, netSalary: 73000, status: 'Pending' },
  { id: '4', code: 'TCH-2026-004', name: 'Ayesha Siddiqua', role: 'Urdu & Islamiat Incharge', department: 'Humanities', baseSalary: 55000, absences: 2, deduction: 3600, allowances: 1500, netSalary: 52900, status: 'Pending' },
  { id: '5', code: 'TCH-2026-005', name: 'Bilal Ahmed', role: 'Computer Science Instructor', department: 'IT', baseSalary: 65000, absences: 0, deduction: 0, allowances: 4000, netSalary: 69000, status: 'Pending' },
]

export function FinanceWorkspace() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payroll, setPayroll] = useState<PayrollRecord[]>(initialStaff)
  const [tab, setTab] = useState<"ledger" | "pnl" | "payroll" | "cash">("ledger")
  const [modal, setModal] = useState<"voucher" | null>(null)
  const [paySlipStaff, setPaySlipStaff] = useState<PayrollRecord | null>(null)
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
      // Realistic starting seed for high-grade school bookkeeping
      setTransactions([
        { id: 'VOU-1081', date: '02/10/2026', category: 'Fee collection', description: 'October Tuition Recovery - Grade 5-10', vendor: 'Student Accounts', amount: 485000, status: 'Cleared', type: 'income' },
        { id: 'VOU-1082', date: '02/10/2026', category: 'Fee collection', description: 'Term Admission & Registration Fees', vendor: 'New Enrollees (24 students)', amount: 144000, status: 'Cleared', type: 'income' },
        { id: 'VOU-1083', date: '01/10/2026', category: 'Payroll', description: 'Faculty Salary - Muhammad Asad (Sciences)', vendor: 'Muhammad Asad', amount: -80000, status: 'Cleared', type: 'expense' },
        { id: 'VOU-1084', date: '01/10/2026', category: 'Payroll', description: 'Faculty Salary - Fatima Noor (English)', vendor: 'Fatima Noor', amount: -62000, status: 'Cleared', type: 'expense' },
        { id: 'VOU-1085', date: '28/09/2026', category: 'Utilities', description: 'Campus Electric & Solar Grid Bill', vendor: 'K-Electric / LESCO', amount: -68400, status: 'Cleared', type: 'expense' },
        { id: 'VOU-1086', date: '25/09/2026', category: 'Maintenance', description: 'Science & Robotics Lab Reagents Restock', vendor: 'Al-Madina Scientific Stores', amount: -32500, status: 'Cleared', type: 'expense' },
        { id: 'VOU-1087', date: '20/09/2026', category: 'Stationery', description: 'Exam Printing Papers & Answer Sheets (50 Reams)', vendor: 'Paper World Traders', amount: -21000, status: 'Cleared', type: 'expense' },
      ])
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
  const netProfit = totalIncome - totalExpense
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0

  // Category breakdowns for P&L
  const feeIncome = transactions.filter((x) => x.amount > 0 && x.category === 'Fee collection').reduce((a, x) => a + x.amount, 0)
  const otherIncome = transactions.filter((x) => x.amount > 0 && x.category !== 'Fee collection').reduce((a, x) => a + x.amount, 0)
  const payrollExpense = Math.abs(transactions.filter((x) => x.amount < 0 && x.category === 'Payroll').reduce((a, x) => a + x.amount, 0))
  const utilitiesExpense = Math.abs(transactions.filter((x) => x.amount < 0 && x.category === 'Utilities').reduce((a, x) => a + x.amount, 0))
  const otherExpenses = Math.abs(transactions.filter((x) => x.amount < 0 && !['Payroll', 'Utilities'].includes(x.category)).reduce((a, x) => a + x.amount, 0))

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

  const disburseSalary = (staff: PayrollRecord) => {
    setPayroll((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, status: 'Paid', disbursedDate: 'Today' } : s))
    )

    // Log corresponding payroll expense voucher
    setTransactions((rows) => [
      {
        id: `VOU-${Date.now().toString().slice(-4)}`,
        date: 'Today',
        category: 'Payroll',
        description: `Faculty Salary - ${staff.name} (${staff.department})`,
        vendor: staff.name,
        amount: -Math.abs(staff.netSalary),
        status: 'Cleared',
        type: 'expense',
      },
      ...rows,
    ])

    notify(`Salary voucher of ${money(staff.netSalary)} disbursed to ${staff.name}`)
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
          <Link href="/admin" className="hover:text-[#c5a059] transition flex items-center gap-1 text-[#5c4a3e]">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-[#2c1d17] font-semibold">Finance &amp; Accounts Ledger</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/fees" className="hover:text-[#c5a059] transition font-medium text-[#8c7a6b]">
            Fee Challans →
          </Link>
          <span className="text-[#e7e2da]">|</span>
          <Link href="/admin/teachers/attendance" className="hover:text-[#c5a059] transition font-medium text-[#8c7a6b]">
            Faculty Attendance →
          </Link>
        </div>
      </nav>

      <header className="finance-page-header">
        <div>
          <span className="finance-eyebrow">FINANCE CONTROL CENTER</span>
          <h1>School Accounts &amp; P&amp;L Ledger</h1>
          <p>Real-time revenue tracking, faculty salary payroll, operating expenses, and net profit &amp; loss statement.</p>
        </div>
        <div className="finance-header-actions">
          <Button variant="outline" onClick={() => window.print()} className="border-[#e7e2da] bg-white text-[#2c1d17] hover:bg-[#faf9f5]"><Printer className="mr-2 size-4" /> Print Financial Report</Button>
          <Button onClick={() => setModal("voucher")} className="bg-[#2c1d17] hover:bg-[#3d2a20] text-white shadow-xs"><Plus className="mr-2 size-4" /> Add Voucher</Button>
        </div>
      </header>

      {toast && <div className="finance-toast" role="status"><Check /> {toast}</div>}

      {/* Primary Financial Metric KPIs */}
      <section className="finance-kpis">
        <div>
          <span>Total Revenues (Fees &amp; Income)</span>
          <strong className="income">{money(totalIncome)}</strong>
          <small>{transactions.filter(x => x.amount > 0).length} credits collected</small>
        </div>
        <div>
          <span>Total Operating Expenses</span>
          <strong className="expense">{money(totalExpense)}</strong>
          <small>Including teacher payroll &amp; utilities</small>
        </div>
        <div>
          <span>Net Profit &amp; Loss (P&amp;L)</span>
          <strong className={netProfit >= 0 ? "income" : "expense"}>
            {money(netProfit)}
          </strong>
          <small className="flex items-center gap-1 font-semibold text-emerald-700">
            {netProfit >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {profitMargin}% net margin · {netProfit >= 0 ? 'Surplus' : 'Deficit'}
          </small>
        </div>
      </section>

      {/* Tabs */}
      <nav className="finance-tabs" aria-label="Finance sections">
        <button className={tab === "ledger" ? "active" : ""} onClick={() => setTab("ledger")}><ReceiptText /> Transaction Ledger</button>
        <button className={tab === "pnl" ? "active" : ""} onClick={() => setTab("pnl")}><Calculator /> Profit &amp; Loss (P&amp;L)</button>
        <button className={tab === "payroll" ? "active" : ""} onClick={() => setTab("payroll")}><Banknote /> Faculty Payroll ({payroll.filter(p => p.status === 'Pending').length} Pending)</button>
        <button className={tab === "cash" ? "active" : ""} onClick={() => setTab("cash")}><Wallet /> Petty Cash Closing</button>
      </nav>

      {/* Tab 1: Ledger */}
      {tab === "ledger" && (
        <section className="finance-card">
          <div className="finance-card-heading">
            <div>
              <span className="finance-eyebrow">ACADEMIC SESSION 2026–27</span>
              <h2>Income &amp; Expense Transaction Audit</h2>
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={transactions.length === 0}>
              <Download className="mr-1.5 size-3.5" /> Export CSV
            </Button>
          </div>

          <div className="finance-filters">
            <label>
              <Search />
              <input placeholder="Search description, vendor, or category..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
            </label>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option>All categories</option>
              <option>Fee collection</option>
              <option>Payroll</option>
              <option>Utilities</option>
              <option>Stationery</option>
              <option>Maintenance</option>
              <option>Transport</option>
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
                      <th>Transaction Details</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th className="text-right">Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}<small className="font-mono">{row.id}</small></td>
                        <td>
                          <b>{row.description}</b>
                          <small>{row.vendor}</small>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            row.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {row.type === 'income' ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
                            {row.type === 'income' ? 'Credit (In)' : 'Debit (Out)'}
                          </span>
                        </td>
                        <td><span className="font-medium text-slate-700 dark:text-slate-300">{row.category}</span></td>
                        <td className={`text-right font-black ${row.amount > 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                          {money(row.amount)}
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <Check className="size-3 text-emerald-500" /> Cleared
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span>Showing {paginated.length} of {filtered.length} transactions</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="size-8 p-0">
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span>Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="size-8 p-0">
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* Tab 2: Profit & Loss Statement (P&L) */}
      {tab === "pnl" && (
        <section className="finance-card">
          <div className="finance-card-heading">
            <div>
              <span className="finance-eyebrow">ACCREDITED FINANCIAL AUDIT</span>
              <h2>Campus Profit &amp; Loss (P&amp;L) Statement</h2>
              <p>Consolidated breakdown of income inflows against operating costs.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 size-3.5" /> Print P&amp;L Statement
            </Button>
          </div>

          <div className="p-6 grid gap-6 md:grid-cols-2">
            {/* Revenue Column */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800">
                <h3 className="font-extrabold text-emerald-900 dark:text-emerald-300 text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-emerald-600" /> Operating Revenues (Income)
                </h3>
                <strong className="text-emerald-700 dark:text-emerald-400 text-base">{money(totalIncome)}</strong>
              </div>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Student Tuition &amp; Term Fees</span>
                    <p className="text-[10px] text-slate-500">Collected from active student challans</p>
                  </div>
                  <span className="font-black text-slate-900 dark:text-slate-100">{money(feeIncome)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-emerald-100 dark:border-emerald-900/40">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Admissions &amp; Registration Vouchers</span>
                    <p className="text-[10px] text-slate-500">New student enrollment fees</p>
                  </div>
                  <span className="font-black text-slate-900 dark:text-slate-100">{money(otherIncome)}</span>
                </div>
              </div>
            </div>

            {/* Expenses Column */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5 dark:border-rose-900/30 dark:bg-rose-950/20">
              <div className="flex items-center justify-between pb-3 border-b border-rose-200 dark:border-rose-800">
                <h3 className="font-extrabold text-rose-900 dark:text-rose-300 text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="size-4 text-rose-600" /> Operating Outflows (Expenses)
                </h3>
                <strong className="text-rose-700 dark:text-rose-400 text-base">{money(totalExpense)}</strong>
              </div>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-rose-100 dark:border-rose-900/40">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Faculty &amp; Staff Monthly Payroll</span>
                    <p className="text-[10px] text-slate-500">Teacher salaries with attendance deductions</p>
                  </div>
                  <span className="font-black text-slate-900 dark:text-slate-100">{money(payrollExpense)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-rose-100 dark:border-rose-900/40">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Utilities (Electricity, Gas, Water, Net)</span>
                    <p className="text-[10px] text-slate-500">Campus operational overheads</p>
                  </div>
                  <span className="font-black text-slate-900 dark:text-slate-100">{money(utilitiesExpense)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-rose-100 dark:border-rose-900/40">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Stationery, Labs &amp; Maintenance</span>
                    <p className="text-[10px] text-slate-500">Examinations, laboratory restock</p>
                  </div>
                  <span className="font-black text-slate-900 dark:text-slate-100">{money(otherExpenses)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Master Net Summary Box */}
          <div className="m-6 mt-0 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Net Operating Surplus / Profit</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{money(netProfit)}</p>
              <p className="text-xs text-slate-500">Calculated as: Total Operating Revenues − Total Operating Costs</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Margin</span>
                <strong className="text-lg font-black text-slate-900 dark:text-slate-100">{profitMargin}%</strong>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-100/60 dark:bg-emerald-950 p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">Financial Health</span>
                <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400">Excellent (Surplus)</strong>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Faculty Payroll */}
      {tab === "payroll" && (
        <section className="finance-card payroll-sheet">
          <div className="finance-card-heading">
            <div>
              <span className="finance-eyebrow">FACULTY &amp; STAFF DISBURSAL</span>
              <h2>Monthly Faculty Salary Register</h2>
              <p>Automated salary calculations with daily attendance deduction rules.</p>
            </div>
          </div>

          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Faculty Member</th>
                  <th>Department</th>
                  <th>Base Salary</th>
                  <th>Absence Penalty</th>
                  <th>Net Disbursal</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((staff) => (
                  <tr key={staff.id}>
                    <td className="font-mono text-xs text-slate-500">{staff.code}</td>
                    <td>
                      <b>{staff.name}</b>
                      <small>{staff.role}</small>
                    </td>
                    <td><span className="font-medium text-slate-700 dark:text-slate-300">{staff.department}</span></td>
                    <td className="font-semibold text-slate-800 dark:text-slate-200">{money(staff.baseSalary)}</td>
                    <td>
                      {staff.deduction > 0 ? (
                        <span className="font-bold text-rose-600">−{money(staff.deduction)} ({staff.absences} absent)</span>
                      ) : (
                        <span className="text-slate-400">PKR 0 (100% Haziri)</span>
                      )}
                    </td>
                    <td className="font-black text-slate-900 dark:text-slate-100">{money(staff.netSalary)}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        staff.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {staff.status === 'Paid' ? <CheckCircle2 className="size-3 text-emerald-600" /> : null}
                        {staff.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPaySlipStaff(staff)}
                          className="h-7 text-xs rounded-lg"
                        >
                          <Printer className="size-3 mr-1" /> Pay Slip
                        </Button>
                        {staff.status === 'Pending' ? (
                          <Button
                            size="sm"
                            onClick={() => disburseSalary(staff)}
                            className="h-7 text-xs bg-[#2c1d17] hover:bg-[#3d2a20] text-white rounded-lg shadow-xs"
                          >
                            Disburse
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium px-2">Cleared</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 4: Petty Cash */}
      {tab === "cash" && (
        <section className="finance-card cash-closing">
          <div className="finance-card-heading">
            <div>
              <span className="finance-eyebrow">DAILY RECONCILIATION</span>
              <h2>Petty Cash Balance</h2>
              <p>Reconcile cash drawer against recorded receipts.</p>
            </div>
          </div>
          <div className="p-6">
            <div className="max-w-md mx-auto p-5 rounded-2xl border border-[#e7e2da] bg-white text-center shadow-xs">
              <Wallet className="size-10 text-[#c5a059] mx-auto mb-2" />
              <h3 className="font-black text-lg text-[#2c1d17]">Daily Vault Balance</h3>
              <p className="text-xs text-[#786c62] mt-1">Opening Cash: PKR 50,000 · Disbursed Today: PKR 14,200</p>
              <div className="my-4 py-3 bg-[#faf9f5] rounded-xl border border-[#e7e2da]">
                <span className="text-xs uppercase font-bold text-[#8c7a6b]">Current Cash in Drawer</span>
                <strong className="block text-2xl font-black text-[#166534] mt-1">PKR 35,800</strong>
              </div>
              <Button onClick={() => notify("Petty cash reconciled and signed off for today.")} className="w-full bg-[#2c1d17] hover:bg-[#3d2a20] text-white rounded-xl shadow-xs font-semibold">
                Sign-off Today&apos;s Cash
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Log Voucher Modal */}
      {modal === "voucher" && (
        <div className="finance-modal-backdrop">
          <div className="finance-modal">
            <button className="modal-close" onClick={() => setModal(null)} aria-label="Close"><X /></button>
            <span className="finance-eyebrow">ACCOUNTS VOUCHER</span>
            <h2>Log Finance Voucher</h2>
            <p>Record a campus credit or debit voucher for audit-ready accounting.</p>

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
              <input value={voucher.description} onChange={(e) => setVoucher({ ...voucher, description: e.target.value })} placeholder="e.g. Science lab supplies or Tuition recovery" required />
            </label>

            <label>{voucherType === 'expense' ? 'Vendor / Payee *' : 'Received From *'}
              <input value={voucher.party} onChange={(e) => setVoucher({ ...voucher, party: e.target.value })} placeholder="e.g. Lab Supplier or Student Accounts" required />
            </label>

            <div className="finance-form-row">
              <label>Category
                <select value={voucher.category} onChange={(e) => setVoucher({ ...voucher, category: e.target.value })}>
                  <option>Fee collection</option>
                  <option>Payroll</option>
                  <option>Utilities</option>
                  <option>Stationery</option>
                  <option>Maintenance</option>
                  <option>Transport</option>
                  <option>General</option>
                </select>
              </label>

              <label>Amount (PKR) *
                <input type="number" value={voucher.amount} onChange={(e) => setVoucher({ ...voucher, amount: e.target.value })} placeholder="15000" required />
              </label>
            </div>

            <div className="modal-actions">
              <button className="finance-btn secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="finance-btn primary" onClick={saveVoucher}>Save Voucher</button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Slip Modal */}
      {paySlipStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Official Pay Slip</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Monthly Salary Statement</h3>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => window.print()} className="bg-[#2c1d17] hover:bg-[#3d2a20] text-white shadow-xs font-semibold"><Printer className="size-3.5 mr-1" /> Print Slip</Button>
                <button onClick={() => setPaySlipStaff(null)} className="text-slate-400 hover:text-[#2c1d17]"><X className="size-5" /></button>
              </div>
            </div>

            <div className="my-4 text-center border-b border-dashed border-slate-300 pb-3">
              <h2 className="font-black text-base text-slate-900 dark:text-slate-100">EduFlow Academy &amp; College</h2>
              <p className="text-xs text-slate-500">Staff Salary Disbursal Voucher · Session 2026-27</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b border-slate-200 dark:border-slate-800">
              <div><span className="text-slate-400 text-[10px] block">EMPLOYEE NAME</span><b>{paySlipStaff.name}</b></div>
              <div><span className="text-slate-400 text-[10px] block">EMPLOYEE CODE</span><b className="font-mono">{paySlipStaff.code}</b></div>
              <div><span className="text-slate-400 text-[10px] block">ROLE / DESIGNATION</span><span>{paySlipStaff.role}</span></div>
              <div><span className="text-slate-400 text-[10px] block">DEPARTMENT</span><span>{paySlipStaff.department}</span></div>
            </div>

            <table className="w-full my-3 text-xs">
              <tbody>
                <tr className="border-b border-slate-100 py-1"><td className="py-1 text-slate-600">Base Monthly Salary</td><td className="text-right font-medium">{money(paySlipStaff.baseSalary)}</td></tr>
                <tr className="border-b border-slate-100 py-1"><td className="py-1 text-slate-600">Teaching Allowances</td><td className="text-right font-medium">+{money(paySlipStaff.allowances)}</td></tr>
                {paySlipStaff.deduction > 0 && (
                  <tr className="border-b border-slate-100 py-1 text-rose-600"><td className="py-1">Attendance Penalty ({paySlipStaff.absences} Absences)</td><td className="text-right font-semibold">−{money(paySlipStaff.deduction)}</td></tr>
                )}
              </tbody>
              <tfoot className="border-t-2 border-slate-800">
                <tr><th className="py-2 text-left text-slate-900 dark:text-slate-100">Net Take-Home Salary</th><th className="py-2 text-right text-base font-black text-emerald-700">{money(paySlipStaff.netSalary)}</th></tr>
              </tfoot>
            </table>

            <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px] font-medium text-slate-700">
              <div className="border-t border-slate-400 pt-1">Accounts Officer</div>
              <div className="border-t border-slate-400 pt-1">Employee Signature</div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
