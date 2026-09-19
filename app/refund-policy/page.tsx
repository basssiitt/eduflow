import Link from 'next/link'
import type { Metadata } from 'next'
import { AcademicCrest } from '@/components/academic-crest'
import { ArrowLeft, CheckCircle2, HelpCircle, Receipt, RefreshCw, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | EduFlow OS',
  description: 'Transparent Refund Policy, Subscription Cancellation Terms, and 14-Day Money-Back Guarantee for EduFlow OS.',
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md lg:px-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <AcademicCrest className="size-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">EduFlow OS</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="border-b border-slate-200/80 bg-white py-12 px-6 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-4">
            <RefreshCw className="size-3.5" /> Customer Satisfaction Guarantee
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl">
            We believe in honest, transparent institutional pricing. Here is how our 30-day free trial, cancellations, and refund guarantees work.
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-slate-700">
          
          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">1</span>
              30-Day Risk-Free Trial (Zero Upfront Charge)
            </h2>
            <p>
              Every school campus begins with a <strong>30-Day Free Pro Trial</strong>. No payment details, credit cards, or bank authorizations are captured during registration. Because you are never charged before or during your 30-day trial period, there is zero financial risk. You may evaluate the software with your faculty, teachers, and parents without obligation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">2</span>
              14-Day Post-Payment Money-Back Guarantee
            </h2>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2 text-xs sm:text-sm">
              <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                Full 100% Refund Within 14 Days of First Paid Invoice:
              </p>
              <p className="text-slate-700">
                If, after completing your 30-day trial and purchasing your first paid subscription cycle, your institution experiences technical difficulties or determines that EduFlow OS does not meet your operational requirements, simply submit a refund request within <strong>fourteen (14) days</strong> of payment. We will issue a 100% full refund with no dispute hurdles.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">3</span>
              Subscription Cancellation at Any Time
            </h2>
            <p>
              You may cancel your school campus subscription at any point from your <Link href="/admin/billing" className="text-blue-600 font-semibold underline">Billing &amp; Plan</Link> workspace. Cancellation takes effect at the conclusion of your current prepaid billing cycle, and you will not be billed for subsequent terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">4</span>
              How to Request a Refund
            </h2>
            <div className="space-y-2">
              <p>To initiate a refund under our 14-day money-back guarantee:</p>
              <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700">
                <li>Send an email to <a href="mailto:billing@eduflow.pk" className="text-blue-600 font-semibold underline">billing@eduflow.pk</a> or message our WhatsApp Finance desk at <a href="https://wa.me/923127803616" className="text-blue-600 font-semibold underline">+92 312 7803616</a>.</li>
                <li>Provide your School Name, Registered Admin Email, and Bank Transaction Slip / Reference Number.</li>
                <li>Refunds are processed to the original payment method (Bank Transfer, 1Link, EasyPaisa, or JazzCash) within 3 to 5 business days.</li>
              </ol>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
