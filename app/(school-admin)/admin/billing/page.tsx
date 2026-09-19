'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { supabaseClient } from '@/lib/supabaseClient'
import {
  ArrowLeft,
  Check,
  CreditCard,
  Download,
  ExternalLink,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

interface InvoiceRecord {
  id: string
  date: string
  plan: string
  amount: string
  status: string
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [renewalDate, setRenewalDate] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const whatsappConcierge = 'https://wa.me/923127803616?text=Hello%20EduFlow%2C%20I%20want%20to%20inquire%20about%20our%20campus%20subscription%20billing.'

  useEffect(() => {
    async function initBilling() {
      setLoading(true)
      let registrationTimestamp = Date.now()

      // 1. Try to get created_at from Supabase Auth
      if (supabaseClient) {
        try {
          const { data } = await supabaseClient.auth.getUser()
          if (data?.user?.created_at) {
            registrationTimestamp = new Date(data.user.created_at).getTime()
          }
        } catch {}
      }

      // 2. Check local storage if not available from Supabase
      if (typeof window !== 'undefined') {
        try {
          const cachedReg = localStorage.getItem('eduflow_school_reg_date')
          if (cachedReg) {
            registrationTimestamp = Number(cachedReg)
          } else {
            localStorage.setItem('eduflow_school_reg_date', String(registrationTimestamp))
          }

          // Check stored invoices
          const storedInvoices = localStorage.getItem('eduflow_subscription_invoices')
          if (storedInvoices) {
            const parsed = JSON.parse(storedInvoices)
            if (Array.isArray(parsed)) setInvoices(parsed)
          }
        } catch {}
      }

      // Compute trial auto-renewal date: registration + 30 days
      const renew = new Date(registrationTimestamp + 30 * 24 * 60 * 60 * 1000)
      const formatted = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(renew)
      setRenewalDate(formatted)
      setLoading(false)
    }

    initBilling()
  }, [])

  const currentPlan = {
    name: 'Pro Campus Suite (Trial Active)',
    price: 'PKR 5,000 / month',
    status: 'Active Trial',
    nextBillingDate: renewalDate || 'In 30 days',
    studentsEnrolled: 'Up to 2,500 Students',
    features: [
      '1-Click Digital Haziri Attendance',
      '3-Copy Bank Fee Challans & PDF Generator',
      'WhatsApp Absent & Fee Notification Alerts',
      'Urdu & English Audio Voice Diaries',
      'Full Student Roster & Academic Register',
    ],
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition flex items-center gap-1 text-slate-600">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Billing &amp; Subscription</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/finance" className="hover:text-blue-600 transition font-medium text-slate-500">
            Finance Ledger →
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/admin/settings" className="hover:text-blue-600 transition font-medium text-slate-500">
            Campus Settings →
          </Link>
        </div>
      </nav>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              30-Day Free Trial
            </Badge>
            <span className="text-sm text-slate-500">Campus Account</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Billing &amp; Subscription</h1>
          <p className="text-slate-500">Manage your EduFlow OS subscription tier, invoices, and payment receipts.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsappConcierge}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-xs"
          >
            <MessageCircle className="mr-2 size-4 text-white" />
            Contact Billing Concierge
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Plan Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Zap className="size-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{currentPlan.name}</h2>
                  <p className="text-xs text-slate-500">{currentPlan.studentsEnrolled}</p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-black text-slate-900">{currentPlan.price}</span>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">● Auto-renews on {currentPlan.nextBillingDate}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Included in Your Campus License</h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {currentPlan.features.map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-xs text-slate-600">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-blue-600" />
              <div className="text-xs">
                <p className="font-bold text-slate-900">99.9% SLA &amp; Automated Backups</p>
                <p className="text-slate-500">Dedicated campus database partition in Supabase PostgreSQL.</p>
              </div>
            </div>
            <a
              href={whatsappConcierge}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Upgrade to Enterprise <Sparkles className="ml-1.5 size-3.5 text-blue-600" />
            </a>
          </div>
        </div>

        {/* Payment Method / Support Info */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <CreditCard className="size-4 text-blue-600" />
              <span>Payment Details</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Official school subscription fees are settled via Direct IBAN Bank Transfer or PayFast.
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="font-medium text-slate-500">Designated Bank</p>
              <p className="font-bold text-slate-900 mt-0.5">Meezan Bank Ltd</p>
              <p className="mt-2 font-medium text-slate-500">Account Title</p>
              <p className="font-bold text-slate-900 mt-0.5">EduFlow Technologies (Pvt) Ltd</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <HelpCircle className="size-4 text-blue-600" />
              <span>Need Invoice Assistance?</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              For tax withholding certificates, customized billing cycles, or adding multi-branch campuses, contact support.
            </p>
            <a
              href={whatsappConcierge}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              WhatsApp Account Manager <ExternalLink className="ml-1.5 size-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Subscription Invoices History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Subscription Invoices</h2>
            <p className="text-xs text-slate-500">Past billing records and verified payment receipts.</p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-4">
            <ZeroDataEmptyState
              icon={CreditCard}
              title="No Invoices or Billing Charges Yet"
              description="Your school is currently on the 30-day Free Trial. Subscription invoices and receipts will appear here once your account transitions to paid billing."
              actionLabel="Contact Billing Concierge"
              onAction={() => window.open(whatsappConcierge, '_blank', 'noopener,noreferrer')}
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3.5">Invoice #</th>
                    <th className="px-4 py-3.5">Billing Date</th>
                    <th className="px-4 py-3.5">Plan Description</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-500">{inv.id}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{inv.date}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{inv.plan}</td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">{inv.amount}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.print()}
                          className="text-xs text-slate-700 hover:bg-slate-50 border border-slate-200"
                        >
                          <Download className="mr-1.5 size-3.5 text-blue-600" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
