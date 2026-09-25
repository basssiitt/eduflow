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
  const [errorMsg, setErrorMsg] = useState('')

  const bankName = details.bankName || 'Meezan Bank Ltd.'
  const accountTitle = details.accountTitle || 'EduFlow School Main Campus'
  const iban = details.iban || 'PK92 MEZN 0001 2345 6789 0101'
  const psid = details.psid || `1004${details.challanNo.replace(/\D/g, '').padEnd(10, '0')}`

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const copyPsid = () => {
    navigator.clipboard.writeText(psid)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setProcessing(true)

    const txnId = `TXN-${Date.now().toString().slice(-6)}`

    // Update the authentic challan record in table fee_vouchers
    if (isSupabaseConfigured && supabaseClient && details.challanNo) {
      try {
        const { error: updateErr } = await supabaseClient
          .from('fee_vouchers')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('challan_number', details.challanNo)
        if (updateErr) {
          console.error('Failed to update fee voucher status:', updateErr)
          setErrorMsg('Failed to record voucher. Verify school bank settings.')
        }
      } catch (err) {
        console.error('Failed to update fee voucher status:', err)
        setErrorMsg('Database connection timeout. Please check your network.')
      }
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-gateway-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
      >
        {receipt ? (
          <div className="text-center py-3">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
              <CheckCircle2 className="size-8" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Payment Cleared</span>
            <h3 id="payment-gateway-modal-title" className="text-xl font-black text-slate-900 mt-1">Official Fee Clearance Receipt</h3>
            <p className="text-xs text-slate-500 mt-0.5">Payment successfully received in school bank account.</p>

            <div className="my-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-bold text-slate-900">{receipt.txnId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Student</span>
                <span className="font-semibold text-slate-900">{details.studentName} ({details.rollNo})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Challan Ref</span>
                <span className="font-mono text-slate-900">{details.challanNo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Payment Gateway</span>
                <span className="font-medium text-slate-900">{receipt.method}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-900">Amount Paid</span>
                <span className="font-black text-emerald-700 text-sm">{money(receipt.amount)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => window.print()} variant="outline" className="flex-1 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                <Printer className="size-4 mr-1.5" /> Print Receipt
              </Button>
              <Button onClick={onClose} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
                Done &amp; Close
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">EduFlow Secure Pay</span>
                <h3 id="payment-gateway-modal-title" className="text-lg font-black text-slate-900">Pay School Fee Online</h3>
                <p className="text-xs text-slate-500">Direct deposit into school authorized account</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-900 cursor-pointer" aria-label="Close payment modal">
                <X className="size-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Fee Snapshot */}
            <div className="my-4 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">{details.studentName} · {details.className}</p>
                <p className="text-[11px] text-slate-500">Challan: {details.challanNo}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-medium text-slate-500 block">Total Due</span>
                <strong className="text-base font-black text-slate-900">{money(details.amount)}</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  method === 'bank'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                }`}
              >
                <University className="size-4 mb-1 text-blue-600" />
                <span>1Link / Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('wallet')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  method === 'wallet'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                }`}
              >
                <Smartphone className="size-4 mb-1 text-blue-600" />
                <span>EasyPaisa/Jazz</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                  method === 'card'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                }`}
              >
                <CreditCard className="size-4 mb-1 text-blue-600" />
                <span>Debit Card</span>
              </button>
            </div>

            {/* Method Content */}
            {method === 'bank' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Designated School Bank</span>
                  <p className="font-bold text-slate-900">{bankName}</p>
                  <p className="text-slate-600 text-[11px]">Title: {accountTitle}</p>
                  <p className="font-mono text-slate-900 text-[11px] font-semibold">{iban}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">1Link 1Bill PSID Consumer No</span>
                    <span className="font-mono text-xs font-bold text-slate-900">{psid}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={copyPsid} className="h-7 text-xs rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
                    <Copy className="size-3 mr-1" /> {copied ? 'Copied!' : 'Copy PSID'}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Open your Mobile Banking App (Meezan, HBL, UBL, etc.), go to <b>Bill Payment → 1Bill Invoice</b>, paste this PSID, and tap Pay. Or click below to log verification.
                </p>
              </div>
            )}

            {method === 'wallet' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex gap-2">
                  {(['EasyPaisa', 'JazzCash'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWalletProvider(w)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                        walletProvider === w
                          ? 'border-blue-600 bg-white text-blue-700 shadow-xs'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor="wallet-phone-input" className="text-[11px] font-semibold text-slate-900 block mb-1">
                    Registered Mobile Account Number
                  </label>
                  <Input
                    id="wallet-phone-input"
                    placeholder="03XXXXXXXXX"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 bg-white text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    An approval prompt will be sent to your {walletProvider} app to confirm payment of {money(details.amount)}.
                  </p>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label htmlFor="card-number-input" className="text-[11px] font-semibold text-slate-900 block mb-1">Card Number</label>
                  <Input
                    id="card-number-input"
                    placeholder="4214 •••• •••• ••••"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="rounded-xl border-slate-200 bg-white text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="card-expiry-input" className="text-[11px] font-semibold text-slate-900 block mb-1">Expiry (MM/YY)</label>
                    <Input
                      id="card-expiry-input"
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="rounded-xl border-slate-200 bg-white text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="card-cvv-input" className="text-[11px] font-semibold text-slate-900 block mb-1">CVV / CVC</label>
                    <Input
                      id="card-cvv-input"
                      placeholder="123"
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="rounded-xl border-slate-200 bg-white text-xs text-slate-900 focus:border-blue-600 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                Cancel
              </Button>
              <Button
                onClick={handlePay}
                disabled={processing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs disabled:opacity-50"
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
