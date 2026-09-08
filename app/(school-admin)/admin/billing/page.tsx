'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, CreditCard, Download, ExternalLink, HelpCircle, MessageCircle, ShieldCheck, Sparkles, Zap } from 'lucide-react'

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
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-[#c5a059] transition flex items-center gap-1 text-[#5c4a3e]">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-[#2c1d17] font-semibold">Billing &amp; Subscription</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/finance" className="hover:text-[#c5a059] transition font-medium text-[#8c7a6b]">
            Finance Ledger →
          </Link>
          <span className="text-[#e7e2da]">|</span>
          <Link href="/admin/settings" className="hover:text-[#c5a059] transition font-medium text-[#8c7a6b]">
            Campus Settings →
          </Link>
        </div>
      </nav>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#faf9f5] text-[#2c1d17] border-[#c5a059]/30">
              SaaS Subscription
            </Badge>
            <span className="text-sm text-[#786c62]">Campus Account</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#2c1d17]">Billing &amp; Subscription</h1>
          <p className="text-[#786c62]">Manage your EduFlow OS subscription tier, invoices, and payment receipts.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsappConcierge}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#2c1d17] hover:bg-[#3d2a20] px-4 py-2 text-sm font-semibold text-white shadow-xs"
          >
            <MessageCircle className="mr-2 size-4 text-[#c5a059]" />
            Contact Billing Concierge
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Plan Card */}
        <div className="lg:col-span-2 rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
                  <Zap className="size-5 text-[#c5a059]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#2c1d17]">{currentPlan.name}</h2>
                  <p className="text-xs text-[#786c62]">{currentPlan.studentsEnrolled}</p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-black text-[#2c1d17]">{currentPlan.price}</span>
              <p className="text-xs text-[#166534] font-semibold mt-0.5">● Auto-renews on {currentPlan.nextBillingDate}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-[#e7e2da] pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8c7a6b] mb-3">Included in Your Campus License</h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {currentPlan.features.map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-xs text-[#5c4a3e]">
                  <Check className="size-4 text-[#c5a059] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf9f5] p-4 border border-[#e7e2da]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#c5a059]" />
              <div className="text-xs">
                <p className="font-bold text-[#2c1d17]">99.9% SLA &amp; Automated Backups</p>
                <p className="text-[#786c62]">Dedicated campus database partition in Supabase PostgreSQL.</p>
              </div>
            </div>
            <a
              href={whatsappConcierge}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-[#e7e2da] bg-white px-3 py-1.5 text-xs font-semibold text-[#2c1d17] hover:bg-[#faf9f5] shadow-xs"
            >
              Upgrade to Enterprise <Sparkles className="ml-1.5 size-3.5 text-[#c5a059]" />
            </a>
          </div>
        </div>

        {/* Payment Method / Support Info */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2c1d17]">
              <CreditCard className="size-4 text-[#c5a059]" />
              <span>Payment Details</span>
            </div>
            <p className="mt-2 text-xs text-[#786c62]">
              Official school subscription fees are settled via Direct IBAN Bank Transfer or PayFast.
            </p>
            <div className="mt-4 rounded-xl border border-[#e7e2da] bg-[#faf9f5] p-3 text-xs">
              <p className="font-medium text-[#786c62]">Designated Bank</p>
              <p className="font-bold text-[#2c1d17] mt-0.5">Meezan Bank Ltd</p>
              <p className="mt-2 font-medium text-[#786c62]">Account Title</p>
              <p className="font-bold text-[#2c1d17] mt-0.5">EduFlow Technologies (Pvt) Ltd</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2c1d17]">
              <HelpCircle className="size-4 text-[#c5a059]" />
              <span>Need Invoice Assistance?</span>
            </div>
            <p className="mt-2 text-xs text-[#786c62]">
              For tax withholding certificates, customized billing cycles, or adding multi-branch campuses, contact support.
            </p>
            <a
              href={whatsappConcierge}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center rounded-xl border border-[#e7e2da] bg-white px-3 py-1.5 text-xs font-semibold text-[#2c1d17] hover:bg-[#faf9f5] shadow-xs"
            >
              WhatsApp Account Manager <ExternalLink className="ml-1.5 size-3 text-[#8c7a6b]" />
            </a>
          </div>
        </div>
      </div>

      {/* Subscription Invoices History */}
      <div className="rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#2c1d17]">Subscription Invoices</h2>
            <p className="text-xs text-[#786c62]">Past billing records and verified payment receipts.</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#e7e2da]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e7e2da] bg-[#faf9f5] text-xs font-semibold uppercase tracking-wider text-[#8c7a6b]">
                <tr>
                  <th className="px-4 py-3.5">Invoice #</th>
                  <th className="px-4 py-3.5">Billing Date</th>
                  <th className="px-4 py-3.5">Plan Description</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e2da]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#faf9f5]">
                    <td className="px-4 py-3.5 font-mono text-xs font-medium text-[#8c7a6b]">{inv.id}</td>
                    <td className="px-4 py-3.5 text-xs text-[#5c4a3e]">{inv.date}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#2c1d17]">{inv.plan}</td>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#2c1d17]">{inv.amount}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-[#166534]">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.print()}
                        className="text-xs text-[#2c1d17] hover:bg-[#faf9f5] border border-[#e7e2da]"
                      >
                        <Download className="mr-1.5 size-3.5 text-[#c5a059]" /> PDF
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
