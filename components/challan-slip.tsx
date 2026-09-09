'use client'

import React from 'react'
import { Printer, X, Download, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AcademicCrest } from '@/components/academic-crest'

export type ChallanData = {
  challanNo: string
  psid?: string
  studentName: string
  fatherName?: string
  rollNo: string
  className: string
  section?: string
  billingMonth?: string
  issueDate: string
  dueDate: string
  validityDate?: string
  tuitionFee: number
  examFee?: number
  labFee?: number
  arrears: number
  lateSurcharge?: number
  bankName?: string
  accountTitle?: string
  iban?: string
  schoolName?: string
  schoolBranch?: string
}

const money = (n: number) => `PKR ${n.toLocaleString('en-PK')}`

function BarcodeDisplay({ value }: { value: string }) {
  // SVG barcode visualizer for 1Link / PSID
  return (
    <div className="flex flex-col items-center justify-center my-1.5">
      <svg className="w-full h-7" viewBox="0 0 200 28" preserveAspectRatio="none">
        {Array.from({ length: 42 }).map((_, i) => {
          const width = (i * 7) % 3 === 0 ? 3 : (i * 5) % 2 === 0 ? 2 : 1
          const x = i * 4.7
          return <rect key={i} x={x} y="0" width={width} height="28" fill="#0f172a" />
        })}
      </svg>
      <span className="font-mono text-[8px] tracking-widest text-slate-600 font-bold">{value}</span>
    </div>
  )
}

function SingleCoupon({
  data,
  copyType,
}: {
  data: ChallanData
  copyType: 'BANK COPY' | 'SCHOOL COPY' | 'STUDENT COPY'
}) {
  const tuition = data.tuitionFee || 0
  const exam = data.examFee || 0
  const lab = data.labFee || 0
  const arrears = data.arrears || 0
  const lateFee = data.lateSurcharge ?? 300
  const totalWithinDue = tuition + exam + lab + arrears
  const totalAfterDue = totalWithinDue + lateFee

  const bankName = data.bankName || 'Meezan Bank Ltd.'
  const accountTitle = data.accountTitle || 'EduFlow School Main Campus'
  const iban = data.iban || 'PK92 MEZN 0001 2345 6789 0101'
  const schoolName = data.schoolName || 'EduFlow Academy & College'
  const schoolBranch = data.schoolBranch || 'Main Campus'
  const psid = data.psid || `1004${data.challanNo.replace(/\D/g, '').padEnd(10, '0')}`

  return (
    <div className="relative flex flex-col justify-between border border-slate-300 bg-white p-3 text-slate-800 shadow-xs rounded-sm text-[10px] leading-tight print:p-2">
      {/* Copy Type Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-900 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-xs">
          {copyType}
        </span>
        <span className="text-[8px] font-semibold text-slate-500">SESSION 2026-27</span>
      </div>

      {/* School Header */}
      <div className="text-center pb-1.5 border-b border-dashed border-slate-200">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <AcademicCrest size={16} className="shrink-0" />
          <h3 className="font-black text-[11px] text-slate-900 tracking-tight">{schoolName}</h3>
        </div>
        <p className="text-[8px] text-slate-500 font-medium">{schoolBranch} · Affiliation # PK-88219</p>
      </div>

      {/* Bank & 1Link PSID Details */}
      <div className="my-1.5 bg-slate-50 p-1.5 rounded-sm border border-slate-200">
        <div className="flex justify-between items-center text-[9px]">
          <span className="font-bold text-slate-900">{bankName}</span>
          <span className="text-[8px] font-mono text-blue-600 font-bold">1LINK 1BILL</span>
        </div>
        <p className="text-[8px] text-slate-600 truncate">Title: {accountTitle}</p>
        <p className="text-[8px] font-mono font-semibold text-slate-900 truncate">IBAN: {iban}</p>
        <BarcodeDisplay value={psid} />
      </div>

      {/* Student Meta Details */}
      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 py-1 border-y border-slate-200 text-[9px]">
        <div>
          <span className="text-[7px] uppercase tracking-wider text-slate-500 block">Challan No</span>
          <strong className="font-mono text-slate-900 tabular-nums">{data.challanNo}</strong>
        </div>
        <div>
          <span className="text-[7px] uppercase tracking-wider text-slate-500 block">Due Date</span>
          <strong className="text-rose-600 font-bold tabular-nums">{data.dueDate}</strong>
        </div>
        <div className="col-span-2">
          <span className="text-[7px] uppercase tracking-wider text-slate-500 block">Student Name</span>
          <strong className="text-slate-900 truncate block">{data.studentName}</strong>
        </div>
        <div>
          <span className="text-[7px] uppercase tracking-wider text-slate-500 block">Father Name</span>
          <span className="text-slate-700 truncate block">{data.fatherName || 'Parent / Guardian'}</span>
        </div>
        <div>
          <span className="text-[7px] uppercase tracking-wider text-slate-500 block">Roll / Class</span>
          <span className="text-slate-900 font-semibold">{data.rollNo} ({data.className})</span>
        </div>
      </div>

      {/* Fee Breakdown Table */}
      <table className="w-full my-1 text-[9px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-[8px]">
            <th className="text-left py-0.5 font-semibold">Fee Particulars</th>
            <th className="text-right py-0.5 font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          <tr>
            <td className="py-0.5 text-slate-700">Monthly Tuition Fee</td>
            <td className="py-0.5 text-right font-medium text-slate-900 tabular-nums">{money(tuition)}</td>
          </tr>
          {exam > 0 && (
            <tr>
              <td className="py-0.5 text-slate-700">Exam Assessment Fee</td>
              <td className="py-0.5 text-right font-medium text-slate-900 tabular-nums">{money(exam)}</td>
            </tr>
          )}
          {lab > 0 && (
            <tr>
              <td className="py-0.5 text-slate-700">Science / Computer Lab</td>
              <td className="py-0.5 text-right font-medium text-slate-900 tabular-nums">{money(lab)}</td>
            </tr>
          )}
          {arrears > 0 && (
            <tr className="text-rose-700 bg-rose-50">
              <td className="py-0.5 font-medium">Previous Arrears</td>
              <td className="py-0.5 text-right font-semibold tabular-nums">{money(arrears)}</td>
            </tr>
          )}
        </tbody>
        <tfoot className="border-t-2 border-slate-900">
          <tr>
            <th className="py-0.5 text-left font-black text-slate-900">Payable By Due Date</th>
            <th className="py-0.5 text-right font-black text-slate-900 tabular-nums">{money(totalWithinDue)}</th>
          </tr>
          <tr className="text-rose-600 text-[8px]">
            <td className="py-0.5 font-medium">Late Fee Surcharge</td>
            <td className="py-0.5 text-right font-semibold tabular-nums">+{money(lateFee)}</td>
          </tr>
          <tr className="border-t border-dashed border-slate-200">
            <th className="py-0.5 text-left font-black text-rose-700">Payable After Due Date</th>
            <th className="py-0.5 text-right font-black text-rose-700 tabular-nums">{money(totalAfterDue)}</th>
          </tr>
        </tfoot>
      </table>

      {/* Instructions & Signatures */}
      <div className="pt-1.5 border-t border-dashed border-slate-200 text-[7px] text-slate-500 space-y-1">
        <p className="leading-tight">
          • Payment accepted at bank branches &amp; 1Link Bill Pay apps (JazzCash, EasyPaisa).
        </p>
        <div className="pt-4 grid grid-cols-2 gap-3 text-center text-[8px] font-medium text-slate-700">
          <div className="border-t border-slate-400 pt-0.5">Cashier / Bank Stamp</div>
          <div className="border-t border-slate-400 pt-0.5">Authorized Signature</div>
        </div>
      </div>
    </div>
  )
}

export function ThreeFaceChallanSlip({
  data,
  onClose,
}: {
  data: ChallanData
  onClose?: () => void
}) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs print:p-0 print:bg-white overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl bg-slate-50 p-4 sm:p-6 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full">
        {/* Modal Toolbar (hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Official Payment Document</span>
            <h2 className="text-lg font-black text-slate-900">3-Face Bank Fee Challan</h2>
            <p className="text-xs text-slate-500">Perforated 3-Coupon A4 Layout (Bank, School, Parent Copy)</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs">
              <Printer className="size-4 mr-1.5" /> Print 3-Copy Slip (A4)
            </Button>
            {onClose && (
              <Button variant="outline" size="icon" onClick={onClose} className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 3-Coupon Perforated A4 Landscape Sheet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 print:grid-cols-3 print:gap-1.5 print:m-0 bg-white p-3 rounded-xl border border-slate-200 print:border-none print:p-0">
          <SingleCoupon data={data} copyType="BANK COPY" />
          <SingleCoupon data={data} copyType="SCHOOL COPY" />
          <SingleCoupon data={data} copyType="STUDENT COPY" />
        </div>
      </div>
    </div>
  )
}
