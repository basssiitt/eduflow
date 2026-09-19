import Link from 'next/link'
import type { Metadata } from 'next'
import { AcademicCrest } from '@/components/academic-crest'
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | EduFlow OS',
  description: 'Privacy Policy and Data Protection Standards for EduFlow OS — Protecting institutional records, student data, and parent confidentiality.',
}

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 mb-4">
            <ShieldCheck className="size-3.5" /> Student &amp; Institutional Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl">
            Last Updated: September 2026. We are committed to safeguarding the confidentiality, privacy, and integrity of school records, students, teachers, and parents.
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-slate-700">
          
          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">1</span>
              Our Core Privacy Commitment
            </h2>
            <p>
              EduFlow OS respects the sensitive nature of educational and student records. We operate under a strict principle: <strong>We do not sell, rent, or trade student, parent, or institutional data to advertising networks, data brokers, or commercial third parties.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">2</span>
              Information We Collect &amp; Process
            </h2>
            <div className="space-y-3">
              <p>We process data solely for operating your school platform under the instructions of your school administration:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
                <li><strong>Institutional Information:</strong> School name, campus address, city, province, authorized administrator contact, and bank account parameters for 3-copy challan printing.</li>
                <li><strong>Student &amp; Academic Data:</strong> Full name, roll number, assigned grade/class, section, attendance timestamps (Haziri), examination marks, and report cards.</li>
                <li><strong>Parent &amp; Guardian Contact:</strong> Guardian name, mobile phone/WhatsApp number for delivery of automated absent notices and fee receipts.</li>
                <li><strong>Voice Homework Diaries:</strong> Encrypted audio recordings submitted by classroom teachers for homework explanation and parent review.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">3</span>
              Protection of Minor / Student Privacy
            </h2>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2 text-xs sm:text-sm">
              <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <Lock className="size-4 text-emerald-600 shrink-0" />
                Special Protections for Children &amp; Students:
              </p>
              <p className="text-slate-700">
                Students under 18 years of age are protected with elevated security safeguards. Student portals provide view-only learning spaces for attendance, homework, and report cards. No public profiles, third-party trackers, or behavioral profiling are permitted within student interfaces.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">4</span>
              Multi-Tenant Data Encryption &amp; Security
            </h2>
            <p>
              EduFlow OS utilizes multi-tenant architecture with PostgreSQL Row Level Security (RLS). Every query is strictly isolated to the authenticated campus identifier (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs">school_id</code>). All network communications are encrypted with SSL/TLS 1.3 in transit, and database backups are encrypted at rest with AES-256 standards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">5</span>
              Data Portability &amp; Right to Erasure
            </h2>
            <p>
              School Administrators can export their complete campus student rosters, attendance summaries, and fee history at any time via CSV/Excel formats. If a school elects to terminate its service, they can request complete permanent deletion of their database records by contacting <a href="mailto:privacy@eduflow.pk" className="text-blue-600 font-semibold underline">privacy@eduflow.pk</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">6</span>
              Contact Our Data Protection Officer
            </h2>
            <p>
              If you have inquiries regarding privacy practices or student data handling, contact us at <a href="mailto:privacy@eduflow.pk" className="text-blue-600 font-semibold underline">privacy@eduflow.pk</a> or via WhatsApp at <a href="https://wa.me/923127803616" className="text-blue-600 font-semibold underline">+92 312 7803616</a>.
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}
