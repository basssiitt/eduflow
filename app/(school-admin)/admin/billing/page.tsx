'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import {
  SchoolSubscription,
  SubscriptionPaymentRecord,
  formatFriendlyDate,
} from '@/lib/subscription'
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  HelpCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SchoolSubscription | null>(null)
  const [payments, setPayments] = useState<SubscriptionPaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  const supportConcierge = 'mailto:billing@eduflow.pk?subject=Campus%20Subscription%20Inquiry'

  useEffect(() => {
    async function loadBilling() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/subscription')
        if (res.ok) {
          const data = await res.json()
          if (data?.subscription) {
            setSubscription(data.subscription)
          }
          if (data?.payments && Array.isArray(data.payments)) {
            setPayments(data.payments)
          }
        }
      } catch (err) {
        console.error('Failed to load subscription data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBilling()
  }, [])

  const planTierName = subscription?.planTier
    ? subscription.planTier.charAt(0).toUpperCase() + subscription.planTier.slice(1)
    : 'Pro'

  const isTrial = subscription?.isTrial ?? true
  const daysRemaining = subscription?.daysRemaining ?? 30
  const isExpired = subscription?.isExpired ?? false

  const currentPlan = {
    name: `${planTierName} Campus Suite (${isTrial ? (isExpired ? 'Trial Expired' : '30-Day Trial Active') : 'Active Subscription'})`,
    price: `PKR ${(subscription?.monthlyAmount || 5000).toLocaleString()} / month`,
    status: isTrial ? (isExpired ? 'Trial Expired' : `${daysRemaining} Days Left in Trial`) : 'Active Paid',
    nextBillingDate: formatFriendlyDate(subscription?.nextBillingDate),
    studentsEnrolled: 'Up to 2,500 Students',
    features: [
      '1-Click Digital Haziri Attendance',
      '3-Copy Bank Fee Challans & PDF Generator',
      'SMS Absent & Bell Notification Alerts',
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
            {isTrial ? (
              <Badge
                className={
                  isExpired
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }
              >
                {isExpired ? 'Trial Expired' : `${daysRemaining} Days Left in Free Trial`}
              </Badge>
            ) : (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                Active Paid Subscription
              </Badge>
            )}
            <span className="text-sm text-slate-500">
              {subscription?.name || 'Campus Account'}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Billing &amp; Subscription</h1>
          <p className="text-slate-500">Database-backed subscription tracking, real trial lifecycle, and payment receipts.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={supportConcierge}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-xs"
          >
            <Mail className="mr-2 size-4 text-white" />
            Contact Billing Concierge
          </a>
        </div>
      </div>

      {/* Trial Lifecycle Tracking Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="size-4 text-blue-600" />
          Real 30-Day Trial &amp; Billing Lifecycle (Supabase PostgreSQL)
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-xs font-semibold text-slate-500">Account Registered</span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {subscription?.createdAt ? formatFriendlyDate(subscription.createdAt) : '—'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">DB: schools.created_at</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-xs font-semibold text-slate-500">Trial Valid Until</span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {subscription?.trialEndsAt ? formatFriendlyDate(subscription.trialEndsAt) : '—'}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Trial concluded'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-xs font-semibold text-slate-500">First Subscription Paid</span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {subscription?.firstPaidAt ? formatFriendlyDate(subscription.firstPaidAt) : 'Not paid yet'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">DB: schools.first_paid_at</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-xs font-semibold text-slate-500">Next Billing Renewal</span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {subscription?.nextBillingDate ? formatFriendlyDate(subscription.nextBillingDate) : '—'}
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Auto-calculated +1 month</p>
          </div>
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
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">● Renews on {currentPlan.nextBillingDate}</p>
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
              href={supportConcierge}
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
              <span>Official Payment Details</span>
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
              For tax withholding certificates, customized billing cycles, or adding multi-branch campuses, contact billing support.
            </p>
            <a
              href={supportConcierge}
              className="mt-4 flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Contact Account Manager <ExternalLink className="ml-1.5 size-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Subscription Invoices History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Subscription Invoices &amp; Receipts</h2>
            <p className="text-xs text-slate-500">Verified payment receipts recorded from Supabase PostgreSQL.</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="p-4">
            <ZeroDataEmptyState
              icon={CreditCard}
              title="No Invoices or Billing Charges Yet"
              description={
                isTrial
                  ? `Your school is currently on the 30-day Free Trial (${daysRemaining} days remaining). Receipts will appear here once your first subscription payment is recorded.`
                  : 'No subscription payments have been recorded yet.'
              }
              actionLabel="Contact Billing Concierge"
              onAction={() => window.location.href = supportConcierge}
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3.5">Receipt #</th>
                    <th className="px-4 py-3.5">Payment Date</th>
                    <th className="px-4 py-3.5">Plan / Cycle</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-500">
                        {pmt.referenceNo || pmt.id.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {formatFriendlyDate(pmt.paidAt)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 capitalize">
                        {pmt.billingCycle} Subscription
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">
                        {pmt.currency} {pmt.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {pmt.status}
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
