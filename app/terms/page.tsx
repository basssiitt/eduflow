import Link from 'next/link'
import type { Metadata } from 'next'
import { AcademicCrest } from '@/components/academic-crest'
import { ArrowLeft, CheckCircle2, FileText, Lock, Shield, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms and Conditions | EduFlow OS',
  description: 'Terms of Service, 30-Day Free Pro Trial Terms, Institutional Software Agreement, and Usage Policies for EduFlow OS.',
}

export default function TermsPage() {
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
            <FileText className="size-3.5" /> Institutional SaaS Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl">
            Effective Date: September 2026. Please read these terms carefully before registering your school, college, or academy on EduFlow OS.
          </p>
        </div>
      </div>

      {/* Document Content */}
      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-slate-700">
          
          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">1</span>
              Acceptance of Terms &amp; Scope
            </h2>
            <p>
              By accessing, browsing, or creating a school workspace on EduFlow OS (&quot;the Platform&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be legally bound by these Terms and Conditions. These terms apply to all School Administrators, Faculty, Students, and Parents accessing portals provided under EduFlow OS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">2</span>
              30-Day Free Pro Plan Trial System
            </h2>
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2 text-xs sm:text-sm">
              <p className="font-semibold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="size-4 text-blue-600 shrink-0" />
                Automatic 30-Day Pro Trial Activation:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                <li>Every newly registered school campus automatically receives a <strong>full 30-day Pro Plan trial for free</strong> upon signup.</li>
                <li><strong>No Credit Card Required:</strong> You do not need to provide banking or card details to commence your 30-day trial.</li>
                <li><strong>Full Feature Access:</strong> During the trial, you enjoy uninhibited access to 1-Click Haziri Attendance, 3-Copy Fee Bank Challans, Urdu Voice Homework Diaries, automated SMS reminders, and reporting modules.</li>
                <li><strong>Trial Expiration:</strong> When the 30-day trial period ends, the administrative dashboard transitions to subscription renewal mode. To continue utilizing the platform and generating live challans, the institution must subscribe to a plan (Starter, Pro, or Enterprise).</li>
                <li><strong>Data Retention Post-Trial:</strong> Your school data, enrolled student rosters, and fee ledgers are securely retained for sixty (60) days after trial expiration, allowing you to subscribe and resume without data loss.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">3</span>
              Institutional Data Ownership &amp; Sovereignty
            </h2>
            <p>
              Your school institution maintains <strong>100% full legal ownership</strong> of all data uploaded or collected through EduFlow OS, including student roll lists, guardian contacts, marks registers, attendance timestamps, and financial fee records. EduFlow does not sell, monetize, or harvest institutional or student records for commercial third-party marketing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">4</span>
              Account Security &amp; Administrative Responsibilities
            </h2>
            <p>
              School Administrators are responsible for safeguarding master login credentials, issuing authorized role permissions to campus teachers, and ensuring that student fee and contact details are maintained accurately. Any suspected credential breach must be reported immediately to our institutional support team.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">5</span>
              Service Availability &amp; Offline Sync Guarantee
            </h2>
            <p>
              EduFlow OS is engineered with offline-first client architecture. In the event of cellular or broadband interruptions in your campus area, daily attendance (Haziri) and homework diaries continue to function locally and automatically synchronize with the primary cloud cluster upon internet restoration.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">6</span>
              Modifications &amp; Inquiries
            </h2>
            <p>
              We reserve the right to revise these terms to align with emerging educational legislation and technological enhancements. For questions regarding institutional licensing or agreements, contact us at <a href="mailto:support@eduflow.pk" className="text-blue-600 font-semibold underline">support@eduflow.pk</a> or phone at <a href="tel:+923127803616" className="text-blue-600 font-semibold underline">+92 312 7803616</a>.
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}
