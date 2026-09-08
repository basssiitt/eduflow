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
    Paid: 'bg-[#e8f5e9] text-[#166534] ring-1 ring-[#c8e6c9] dark:bg-emerald-950/40 dark:text-emerald-300',
    Pending: 'bg-[#efebe9] text-[#5D4037] ring-1 ring-[#d7ccc8] dark:bg-amber-950/40 dark:text-amber-300',
    Overdue: 'bg-[#fce4ec] text-[#880e4f] ring-1 ring-[#f8bbd0] dark:bg-rose-950/40 dark:text-rose-300',
  }[status]
  const dot = {
    Paid: 'bg-[#166534]',
    Pending: 'bg-[#5D4037]',
    Overdue: 'bg-[#880e4f]',
  }[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', tone)}>
      <span className={cn('size-1.5 rounded-full', dot)} aria-hidden="true" />
      {status}
    </span>
  )
}

import { ThreeFaceChallanSlip } from "@/components/challan-slip"
import { Building2 } from "lucide-react"

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
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [bankSettings, setBankSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('eduflow-bank-settings')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {
      bankName: 'Meezan Bank Ltd.',
      accountTitle: 'EduFlow School Main Campus',
      iban: 'PK92 MEZN 0001 2345 6789 0101',
      psidPrefix: '1004',
      easypaisa: '03001234567',
      jazzcash: '03121234567',
    }
  })

  const saveBankSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('eduflow-bank-settings', JSON.stringify(bankSettings))
    }
    setBankModalOpen(false)
  }

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
      <nav className="flex items-center justify-between text-xs text-stone-500 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-[#2c1d17] transition flex items-center gap-1 text-stone-600">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-[#2c1d17] font-semibold">Fee Challans</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/students" className="hover:text-[#2c1d17] transition font-medium text-stone-500">
            Student Register →
          </Link>
          <span className="text-stone-300">|</span>
          <Link href="/admin/finance" className="hover:text-[#2c1d17] transition font-medium text-stone-500">
            Finance Ledger →
          </Link>
          <span className="text-stone-300">|</span>
          <Link href="/admin/billing" className="hover:text-[#2c1d17] transition font-medium text-stone-500">
            Campus Billing →
          </Link>
        </div>
      </nav>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">Fee Challans &amp; Accounts</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#2c1d17]">Fee Management &amp; Invoices</h1>
          <p className="text-stone-500">Track collections, issue 3-copy challans, and record payments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setBankModalOpen(true)}
            className="border-[#e7e2da] bg-[#faf9f5] hover:bg-[#f7f5f0] text-[#2c1d17]"
          >
            <Building2 className="mr-2 size-4 text-[#c5a059]" /> Bank &amp; Gateway Setup
          </Button>
          <Button variant="outline" data-testid="btn-bulk-import" onClick={() => setImportOpen(true)} className="border-[#e7e2da] bg-[#faf9f5] hover:bg-[#f7f5f0] text-[#2c1d17]">
            <Upload className="mr-2 size-4 text-stone-500" /> Bulk Import CSV
          </Button>
          <Button
            onClick={generate}
            disabled={generating}
            className="bg-[#2c1d17] hover:bg-[#1e130f] text-white font-semibold shadow-xs"
          >
            <Plus className="mr-2 size-4" /> Generate Invoices
          </Button>
        </div>
      </header>

      {generating && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#c5a059]/40 bg-[#faf9f5] p-4 text-sm font-medium text-[#2c1d17] shadow-xs">
          <div className="size-4 animate-spin rounded-full border-2 border-[#2c1d17] border-t-transparent" />
          <span>Generating invoices for all enrolled students… Please wait.</span>
        </div>
      )}

      {generated && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm font-semibold text-emerald-800 shadow-xs">
          <Check className="size-4 text-emerald-600" aria-hidden="true" />
          <span>Invoices generated successfully for current academic cycle.</span>
        </div>
      )}

      {/* Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#e7e2da] bg-[#faf9f5] p-5 shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-600">Total Recoverable Fee</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#2c1d17]/5 text-[#2c1d17] border border-[#e7e2da]">
              <FileText className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-[#2c1d17]">{money(totalRecoverable)}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span>Across {data.length} active invoices</span>
            <span className="font-medium text-stone-700">Session 2026–27</span>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e7e2da] bg-[#faf9f5] p-5 shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-600">Collected This Month</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-[#2c1d17]">{money(totalCollected)}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              +{totalRecoverable > 0 ? `${Math.round((totalCollected / totalRecoverable) * 100)}%` : '0%'} recovery rate
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e7e2da] bg-[#faf9f5] p-5 shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-600">Pending Invoices</span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#c5a059]/15 text-[#8c6b2d] border border-[#c5a059]/30">
              <ReceiptText className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-[#2c1d17]">{pendingCount}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#efebe9] px-2.5 py-0.5 text-xs font-semibold text-[#5D4037] border border-[#d7ccc8]">
              {data.length > 0 ? `${Math.round((pendingCount / data.length) * 100)}%` : '0%'} uncollected
            </span>
          </div>
        </article>
      </section>

      {/* Table Section */}
      <section className="rounded-2xl border border-[#e7e2da] bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-[#e7e2da] p-5 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">INVOICE REGISTER</span>
            <h2 className="mt-0.5 text-lg font-bold text-[#2c1d17]">Student Fee Records</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={data.length === 0} className="border-[#e7e2da] bg-[#faf9f5] hover:bg-[#f7f5f0] text-[#2c1d17]">
              <Download className="mr-1.5 size-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-[#e7e2da] p-4 sm:flex-row sm:items-center sm:justify-between bg-[#faf9f5]">
          <div className="flex items-center gap-1 rounded-xl bg-[#f7f5f0] p-1 border border-[#e7e2da]">
            {["All", "Paid", "Pending", "Overdue"].map((f) => (
              <button
                key={f}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                  filter === f
                    ? 'bg-[#2c1d17] text-white shadow-xs'
                    : 'text-stone-600 hover:text-[#2c1d17]'
                )}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-stone-400" />
            <input
              placeholder="Search student or challan…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="h-9 w-full rounded-xl border border-[#e7e2da] bg-white pl-9 pr-3 text-xs text-[#2c1d17] placeholder:text-stone-400 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/20 outline-none transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="divide-y divide-[#e7e2da]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-4 flex items-center justify-between animate-pulse">
                  <div className="h-4 w-28 bg-[#f7f5f0] rounded-md" />
                  <div className="h-4 w-36 bg-[#f7f5f0] rounded-md" />
                  <div className="h-4 w-20 bg-[#f7f5f0] rounded-md" />
                  <div className="h-4 w-24 bg-[#f7f5f0] rounded-md" />
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
                <thead className="border-b border-[#e7e2da] bg-[#f7f5f0] text-xs font-bold uppercase tracking-wider text-stone-600">
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
                <tbody className="divide-y divide-[#e7e2da]">
                  {paginated.map((r) => (
                    <tr key={r.challan} className="hover:bg-[#faf9f5] transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-[#2c1d17] bg-[#f7f5f0] border border-[#e7e2da] rounded-md px-2 py-1">
                          {r.challan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2c1d17]/5 border border-[#e7e2da] text-xs font-bold text-[#2c1d17]">
                            {r.name.split(" ").map((x) => x[0]).join("")}
                          </div>
                          <span className="font-semibold text-[#2c1d17]">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-stone-600">{r.cls}</td>
                      <td className="px-5 py-4 text-[#2c1d17] font-medium">{money(r.tuition)}</td>
                      <td className="px-5 py-4">
                        {r.arrears > 0 ? (
                          <span className="font-semibold text-[#880e4f]">{money(r.arrears)}</span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#2c1d17]">{money(total(r))}</td>
                      <td className="px-5 py-4 text-xs font-mono text-stone-600">{r.due}</td>
                      <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-[#e7e2da] bg-[#faf9f5] text-stone-600 hover:border-[#c5a059] hover:text-[#2c1d17] transition"
                            data-testid="btn-print-challan"
                            onClick={() => setSelected(r)}
                            title="Print challan"
                          >
                            <Printer className="size-3.5" />
                          </button>
                          <a
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-[#e7e2da] bg-[#faf9f5] text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition"
                            href={`https://wa.me/?text=${encodeURIComponent(`Fee reminder for ${r.name}: ${money(total(r))} due ${r.due}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp reminder"
                          >
                            <MessageCircle className="size-3.5" />
                          </a>
                          <button
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-[#e7e2da] bg-[#faf9f5] text-stone-600 hover:border-[#c5a059] hover:text-[#2c1d17] transition"
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#e7e2da] p-4 text-xs text-stone-500">
              <span>Showing {paginated.length} of {shown.length} invoices</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="size-8 p-0 border-[#e7e2da] bg-[#faf9f5] hover:bg-[#f7f5f0] text-stone-700"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 font-medium text-[#2c1d17]">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="size-8 p-0 border-[#e7e2da] bg-[#faf9f5] hover:bg-[#f7f5f0] text-stone-700"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {selected && (
        <ThreeFaceChallanSlip
          data={{
            challanNo: selected.challan,
            studentName: selected.name,
            rollNo: selected.id ? `2026-${String(selected.id).padStart(3, '0')}` : '2026-001',
            className: selected.cls,
            tuitionFee: selected.tuition,
            arrears: selected.arrears,
            dueDate: selected.due,
            issueDate: '01 Oct 2026',
            bankName: bankSettings.bankName,
            accountTitle: bankSettings.accountTitle,
            iban: bankSettings.iban,
            schoolName: 'EduFlow Academy & College',
            schoolBranch: 'Main Campus',
          }}
          onClose={() => setSelected(null)}
        />
      )}

      {bankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#e7e2da]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2da]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">Payment Gateway &amp; Banking</span>
                <h3 className="text-lg font-black text-[#2c1d17]">School Bank Account Setup</h3>
              </div>
              <button onClick={() => setBankModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={saveBankSettings} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Bank Name</label>
                <Input
                  value={bankSettings.bankName}
                  onChange={(e) => setBankSettings({ ...bankSettings, bankName: e.target.value })}
                  placeholder="e.g. Meezan Bank Ltd."
                  required
                  className="rounded-xl border-[#e7e2da] bg-white text-[#2c1d17] focus:border-[#c5a059] text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Account Title</label>
                <Input
                  value={bankSettings.accountTitle}
                  onChange={(e) => setBankSettings({ ...bankSettings, accountTitle: e.target.value })}
                  placeholder="e.g. EduFlow School Accounts"
                  required
                  className="rounded-xl border-[#e7e2da] bg-white text-[#2c1d17] focus:border-[#c5a059] text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">IBAN (24 Characters)</label>
                <Input
                  value={bankSettings.iban}
                  onChange={(e) => setBankSettings({ ...bankSettings, iban: e.target.value })}
                  placeholder="PK92 MEZN 0001 2345 6789 0101"
                  required
                  className="font-mono rounded-xl border-[#e7e2da] bg-white text-[#2c1d17] focus:border-[#c5a059] text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">1Link PSID Prefix</label>
                  <Input
                    value={bankSettings.psidPrefix}
                    onChange={(e) => setBankSettings({ ...bankSettings, psidPrefix: e.target.value })}
                    placeholder="1004"
                    className="font-mono rounded-xl border-[#e7e2da] bg-white text-[#2c1d17] focus:border-[#c5a059] text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">EasyPaisa / JazzCash</label>
                  <Input
                    value={bankSettings.easypaisa}
                    onChange={(e) => setBankSettings({ ...bankSettings, easypaisa: e.target.value })}
                    placeholder="03XXXXXXXXX"
                    className="rounded-xl border-[#e7e2da] bg-white text-[#2c1d17] focus:border-[#c5a059] text-xs"
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                These credentials will appear on all 3-Face Challans and power online Parent Portal fee payments.
              </p>
              <div className="pt-3 flex gap-2">
                <Button type="button" variant="outline" onClick={() => setBankModalOpen(false)} className="flex-1 rounded-xl border-[#e7e2da] bg-[#faf9f5] hover:bg-[#f7f5f0] text-[#2c1d17]">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#2c1d17] hover:bg-[#1e130f] text-white rounded-xl">
                  Save Bank Details
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
