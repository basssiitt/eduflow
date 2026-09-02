'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, CreditCard, Download, ExternalLink, HelpCircle, MessageCircle, ShieldCheck, Sparkles, Zap } from 'lucide-react'

export default function BillingPage() {
  const [currentPlan] = useState({
    name: 'Pro Campus Suite',
    price: 'PKR 5,000 / month',
    status: 'Active',
    nextBillingDate: '10 October 2026',
    studentsEnrolled: 'Up to 2,500 Students',
    features: [
      '1-Click Digital Haziri Attendance',
      '3-Copy Bank Fee Challans & PDF Generator',
      'WhatsApp Absent & Fee Notification Alerts',
      'Urdu & English Audio Voice Diaries',
      'Full Student Roster & Academic Register',
    ],
  })

  const invoices = [
    { id: 'INV-2026-009', date: '01 Sep 2026', plan: 'Pro Campus Suite', amount: 'PKR 5,000', status: 'Paid' },
    { id: 'INV-2026-008', date: '01 Aug 2026', plan: 'Pro Campus Suite', amount: 'PKR 5,000', status: 'Paid' },
    { id: 'INV-2026-007', date: '01 Jul 2026', plan: 'Pro Campus Suite', amount: 'PKR 5,000', status: 'Paid' },
  ]

  const whatsappConcierge = 'https://wa.me/923127803616?text=Hello%20EduFlow%2C%20I%20want%20to%20upgrade%20our%20campus%20subscription%20plan.'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20">
              SaaS Subscription
            </Badge>
            <span className="text-sm text-slate-500 dark:text-slate-400">Campus Account</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Billing &amp; Subscription</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your EduFlow OS subscription tier, invoices, and payment receipts.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsappConcierge}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-xs"
          >
            <MessageCircle className="mr-2 size-4" />
            Contact Billing Concierge
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Plan Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{currentPlan.name}</h2>
                  <p className="text-xs text-slate-500">{currentPlan.studentsEnrolled}</p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{currentPlan.price}</span>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">● Auto-renews on {currentPlan.nextBillingDate}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Included in Your Campus License</h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {currentPlan.features.map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600" />
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200">99.9% SLA &amp; Automated Backups</p>
                <p className="text-slate-500">Dedicated campus database partition in Supabase PostgreSQL.</p>
              </div>
            </div>
            <a
              href={whatsappConcierge}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
            >
              Upgrade to Enterprise <Sparkles className="ml-1.5 size-3.5 text-amber-500" />
            </a>
          </div>
        </div>

        {/* Payment Method / Support Info */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <CreditCard className="size-4 text-emerald-600" />
              <span>Payment Details</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Official school subscription fees are settled via Direct IBAN Bank Transfer or PayFast.
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950 text-xs">
              <p className="font-medium text-slate-600 dark:text-slate-400">Designated Bank</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">Meezan Bank Ltd</p>
              <p className="mt-2 font-medium text-slate-600 dark:text-slate-400">Account Title</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">EduFlow Technologies (Pvt) Ltd</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <HelpCircle className="size-4 text-emerald-600" />
              <span>Need Invoice Assistance?</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              For tax withholding certificates, customized billing cycles, or adding multi-branch campuses, contact support.
            </p>
            <a
              href={whatsappConcierge}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
            >
              WhatsApp Account Manager <ExternalLink className="ml-1.5 size-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Subscription Invoices History */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Subscription Invoices</h2>
            <p className="text-xs text-slate-500">Past billing records and verified payment receipts.</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Invoice #</th>
                  <th className="px-4 py-3.5">Billing Date</th>
                  <th className="px-4 py-3.5">Plan Description</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-600 dark:text-slate-400">{inv.id}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{inv.date}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">{inv.plan}</td>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{inv.amount}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.print()}
                        className="text-xs text-slate-600 hover:text-slate-900"
                      >
                        <Download className="mr-1.5 size-3.5" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
