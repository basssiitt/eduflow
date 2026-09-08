'use client'

import React, { useState } from 'react'
import { CheckCircle2, Copy, CreditCard, Download, ExternalLink, Lock, Printer, QrCode, ShieldCheck, Smartphone, University, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'

export type PaymentDetails = {
  challanNo: string
  studentName: string
  rollNo: string
  className: string
  amount: number
  dueDate: string
  bankName?: string
  accountTitle?: string
  iban?: string
  psid?: string
}

const money = (n: number) => `PKR ${n.toLocaleString('en-PK')}`

export function PaymentGatewayModal({
  details,
  onClose,
  onSuccess,
}: {
  details: PaymentDetails
  onClose: () => void
  onSuccess?: (txnId: string) => void
}) {
  const [method, setMethod] = useState<'bank' | 'wallet' | 'card'>('bank')
  const [walletPhone, setWalletPhone] = useState('')
  const [walletProvider, setWalletProvider] = useState<'EasyPaisa' | 'JazzCash'>('EasyPaisa')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [processing, setProcessing] = useState(false)
  const [receipt, setReceipt] = useState<{
    txnId: string
    date: string
    amount: number
    method: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const bankName = details.bankName || 'Meezan Bank Ltd.'
  const accountTitle = details.accountTitle || 'EduFlow School Main Campus'
  const iban = details.iban || 'PK92 MEZN 0001 2345 6789 0101'
  const psid = details.psid || `1004${details.challanNo.replace(/\D/g, '').padEnd(10, '0')}`

  const copyPsid = () => {
    navigator.clipboard.writeText(psid)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    const txnId = `TXN-${Date.now().toString().slice(-6)}`

    // Attempt to log income to Supabase if configured
    if (isSupabaseConfigured && supabaseClient) {
      try {
        await supabaseClient.from('expenses').insert([
          {
            description: `Fee Payment - ${details.studentName} (${details.challanNo})`,
            vendor: details.studentName,
            category: 'Fee collection',
            amount: Math.abs(details.amount),
            date: new Date().toISOString().split('T')[0],
          },
        ])
      } catch {}
    }

    // Simulate gateway roundtrip
    setTimeout(() => {
      setProcessing(false)
      const receiptData = {
        txnId,
        date: new Date().toLocaleString('en-GB'),
        amount: details.amount,
        method: method === 'bank' ? '1Link 1Bill Transfer' : method === 'wallet' ? `${walletProvider} Wallet` : 'Visa / Debit Card',
      }
      setReceipt(receiptData)
      if (onSuccess) {
        onSuccess(txnId)
      }
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#e7e2da] dark:border-[#3d2e24] dark:bg-[#1f1612]">
        {receipt ? (
          <div className="text-center py-3">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-[#166534] border border-emerald-200 mb-3">
              <CheckCircle2 className="size-8" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534]">Payment Cleared</span>
            <h3 className="text-xl font-black text-[#2c1d17] dark:text-[#f7f5f0] mt-1">Official Fee Clearance Receipt</h3>
            <p className="text-xs text-[#786c62] mt-0.5">Payment successfully received in school bank account.</p>

            <div className="my-5 rounded-xl border border-[#e7e2da] dark:border-[#3d2e24] bg-[#faf9f5] dark:bg-[#261c16] p-4 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-[#e7e2da] dark:border-[#3d2e24] pb-1.5">
                <span className="text-[#786c62]">Transaction ID</span>
                <span className="font-mono font-bold text-[#2c1d17] dark:text-[#f7f5f0]">{receipt.txnId}</span>
              </div>
              <div className="flex justify-between border-b border-[#e7e2da] dark:border-[#3d2e24] pb-1.5">
                <span className="text-[#786c62]">Student</span>
                <span className="font-semibold text-[#2c1d17] dark:text-[#f7f5f0]">{details.studentName} ({details.rollNo})</span>
              </div>
              <div className="flex justify-between border-b border-[#e7e2da] dark:border-[#3d2e24] pb-1.5">
                <span className="text-[#786c62]">Challan Ref</span>
                <span className="font-mono text-[#2c1d17] dark:text-[#f7f5f0]">{details.challanNo}</span>
              </div>
              <div className="flex justify-between border-b border-[#e7e2da] dark:border-[#3d2e24] pb-1.5">
                <span className="text-[#786c62]">Payment Gateway</span>
                <span className="font-medium text-[#2c1d17] dark:text-[#f7f5f0]">{receipt.method}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-[#2c1d17] dark:text-[#f7f5f0]">Amount Paid</span>
                <span className="font-black text-[#166534] text-sm">{money(receipt.amount)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => window.print()} variant="outline" className="flex-1 rounded-xl border-[#e7e2da] bg-white text-[#2c1d17] hover:bg-[#faf9f5]">
                <Printer className="size-4 mr-1.5" /> Print Receipt
              </Button>
              <Button onClick={onClose} className="flex-1 bg-[#2c1d17] hover:bg-[#3d2a20] text-white rounded-xl shadow-xs">
                Done &amp; Close
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between border-b border-[#e7e2da] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">EduFlow Secure Pay</span>
                <h3 className="text-lg font-black text-[#2c1d17] dark:text-[#f7f5f0]">Pay School Fee Online</h3>
                <p className="text-xs text-[#786c62]">Direct deposit into school authorized account</p>
              </div>
              <button onClick={onClose} className="text-[#786c62] hover:text-[#2c1d17]">
                <X className="size-5" />
              </button>
            </div>

            {/* Fee Snapshot */}
            <div className="my-4 flex items-center justify-between p-3.5 bg-[#faf9f5] rounded-xl border border-[#e7e2da]">
              <div>
                <p className="text-xs font-bold text-[#2c1d17]">{details.studentName} · {details.className}</p>
                <p className="text-[11px] text-[#786c62]">Challan: {details.challanNo}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-medium text-[#786c62] block">Total Due</span>
                <strong className="text-base font-black text-[#2c1d17]">{money(details.amount)}</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  method === 'bank'
                    ? 'border-[#c5a059] bg-[#faf9f5] text-[#2c1d17] ring-1 ring-[#c5a059]'
                    : 'border-[#e7e2da] text-[#786c62] hover:bg-[#faf9f5]'
                }`}
              >
                <University className="size-4 mb-1 text-[#c5a059]" />
                <span>1Link / Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('wallet')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  method === 'wallet'
                    ? 'border-[#c5a059] bg-[#faf9f5] text-[#2c1d17] ring-1 ring-[#c5a059]'
                    : 'border-[#e7e2da] text-[#786c62] hover:bg-[#faf9f5]'
                }`}
              >
                <Smartphone className="size-4 mb-1 text-[#c5a059]" />
                <span>EasyPaisa/Jazz</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  method === 'card'
                    ? 'border-[#c5a059] bg-[#faf9f5] text-[#2c1d17] ring-1 ring-[#c5a059]'
                    : 'border-[#e7e2da] text-[#786c62] hover:bg-[#faf9f5]'
                }`}
              >
                <CreditCard className="size-4 mb-1 text-[#c5a059]" />
                <span>Debit Card</span>
              </button>
            </div>

            {/* Method Content */}
            {method === 'bank' && (
              <div className="space-y-3 bg-[#faf9f5] p-3.5 rounded-xl border border-[#e7e2da] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8c7a6b] block">Designated School Bank</span>
                  <p className="font-bold text-[#2c1d17]">{bankName}</p>
                  <p className="text-[#5c4a3e] text-[11px]">Title: {accountTitle}</p>
                  <p className="font-mono text-[#2c1d17] text-[11px] font-semibold">{iban}</p>
                </div>

                <div className="pt-2 border-t border-[#e7e2da] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#c5a059] block">1Link 1Bill PSID Consumer No</span>
                    <span className="font-mono text-xs font-bold text-[#2c1d17]">{psid}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={copyPsid} className="h-7 text-xs rounded-lg border-[#e7e2da] bg-white text-[#2c1d17] hover:bg-[#faf9f5]">
                    <Copy className="size-3 mr-1" /> {copied ? 'Copied!' : 'Copy PSID'}
                  </Button>
                </div>
                <p className="text-[10px] text-[#786c62]">
                  Open your Mobile Banking App (Meezan, HBL, UBL, etc.), go to <b>Bill Payment → 1Bill Invoice</b>, paste this PSID, and tap Pay. Or click below to log verification.
                </p>
              </div>
            )}

            {method === 'wallet' && (
              <div className="space-y-3 bg-[#faf9f5] p-3.5 rounded-xl border border-[#e7e2da] text-xs">
                <div className="flex gap-2">
                  {(['EasyPaisa', 'JazzCash'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWalletProvider(w)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                        walletProvider === w
                          ? 'border-[#c5a059] bg-white text-[#2c1d17] shadow-xs'
                          : 'border-[#e7e2da] text-[#786c62]'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#2c1d17] block mb-1">
                    Registered Mobile Account Number
                  </label>
                  <Input
                    placeholder="03XXXXXXXXX"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    required
                    className="rounded-xl border-[#e7e2da] bg-white text-xs text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
                  />
                  <p className="text-[10px] text-[#786c62] mt-1">
                    An approval prompt will be sent to your {walletProvider} app to confirm payment of {money(details.amount)}.
                  </p>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-2.5 bg-[#faf9f5] p-3.5 rounded-xl border border-[#e7e2da] text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#2c1d17] block mb-1">Card Number</label>
                  <Input
                    placeholder="4214 •••• •••• ••••"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="rounded-xl border-[#e7e2da] bg-white text-xs text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2c1d17] block mb-1">Expiry (MM/YY)</label>
                    <Input
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="rounded-xl border-[#e7e2da] bg-white text-xs text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2c1d17] block mb-1">CVV / CVC</label>
                    <Input
                      placeholder="123"
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="rounded-xl border-[#e7e2da] bg-white text-xs text-[#2c1d17] focus:border-[#c5a059] focus:ring-[#c5a059]/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-[#e7e2da] bg-white text-[#2c1d17] hover:bg-[#faf9f5]">
                Cancel
              </Button>
              <Button
                onClick={handlePay}
                disabled={processing}
                className="flex-1 bg-[#2c1d17] hover:bg-[#3d2a20] text-white font-semibold rounded-xl shadow-xs disabled:opacity-50"
              >
                {processing ? 'Processing Payment…' : `Pay ${money(details.amount)}`}
              </Button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <Lock className="size-3" />
              <span>256-Bit SSL Encrypted Banking Switch · EduFlow OS Pay</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
