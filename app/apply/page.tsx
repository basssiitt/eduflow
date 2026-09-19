'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AcademicCrest,
} from '@/components/academic-crest'
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  Mail,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react'

export interface AdmissionApplication {
  id: string
  trackingCode: string
  studentName: string
  dob: string
  gender: 'Male' | 'Female'
  gradeApplying: string
  previousSchool: string
  previousMarks: string
  fatherName: string
  fatherCnic: string
  guardianPhone: string
  guardianEmail: string
  residentialAddress: string
  city: string
  medicalNotes?: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  appliedAt: string
}

const GRADES = [
  'Playgroup / Nursery',
  'Kindergarten (KG)',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9 (Matric Science)',
  'Class 10 (Matric Science)',
  'Cambridge O-Level Grade 9',
  'Cambridge O-Level Grade 10',
]

export default function ApplyOnlinePage() {
  React.useEffect(() => {
    window.location.replace('/')
  }, [])
  const [studentName, setStudentName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female'>('Male')
  const [gradeApplying, setGradeApplying] = useState(GRADES[4])
  const [previousSchool, setPreviousSchool] = useState('')
  const [previousMarks, setPreviousMarks] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [fatherCnic, setFatherCnic] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')
  const [city, setCity] = useState('Lahore')
  const [residentialAddress, setResidentialAddress] = useState('')
  const [medicalNotes, setMedicalNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Generate random application tracking code using crypto
    const randomBuffer = new Uint32Array(1)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBuffer)
    } else {
      randomBuffer[0] = Date.now()
    }
    const randCode = 1000 + (randomBuffer[0] % 9000)
    const trackingCode = `ADM-2026-${randCode}`

    const newApp: AdmissionApplication = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      trackingCode,
      studentName: studentName.trim(),
      dob,
      gender,
      gradeApplying,
      previousSchool: previousSchool.trim() || 'First School Admission',
      previousMarks: previousMarks.trim() || 'N/A',
      fatherName: fatherName.trim(),
      fatherCnic: fatherCnic.trim() || '35202-XXXXXXX-X',
      guardianPhone: guardianPhone.trim(),
      guardianEmail: guardianEmail.trim() || 'parent@domain.com',
      residentialAddress: residentialAddress.trim(),
      city,
      medicalNotes: medicalNotes.trim(),
      status: 'pending',
      appliedAt: new Date().toISOString(),
    }

    // Save to local storage for persistence & admin desk review
    try {
      const existing = JSON.parse(localStorage.getItem('eduflow-admissions') || '[]')
      localStorage.setItem('eduflow-admissions', JSON.stringify([newApp, ...existing]))
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmittedApp(newApp)
    }, 600)
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <nav className="sticky top-0 z-50 flex h-18 items-center justify-between border-b border-slate-200/90 bg-white/95 px-6 backdrop-blur-md lg:px-12">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <AcademicCrest className="size-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900">EduFlow OS</span>
            <span className="ml-2 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-blue-700">
              Online Admissions 2026–27
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
          >
            Portal Sign In
          </Link>
          <a
            href="mailto:admissions@eduflow.pk?subject=Admission%20Inquiry"
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Mail className="size-3.5" /> Admissions Desk
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {!submittedApp ? (
          <div>
            {/* Header Banner */}
            <div className="mb-8 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800">
                <Sparkles className="size-3.5" /> Direct Campus Enrollment
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Online Admission Application Form
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Fill out the applicant details below. Upon submission, you will receive an official application tracking voucher. Our admissions incharge will contact you via email or phone for document verification and interview scheduling.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              {/* Section 1: Student Information */}
              <div className="border-b border-slate-100 pb-6 mb-6">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-base">
                  <User className="size-5 text-blue-600" />
                  <h2>1. Student Candidate Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label htmlFor="student-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      id="student-name"
                      type="text"
                      required
                      placeholder="e.g. Muhammad Hamza"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="dob" className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      id="dob"
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-xs font-bold text-slate-700 mb-1">
                      Gender *
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    >
                      <option value="Male">Male (Boy)</option>
                      <option value="Female">Female (Girl)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="grade" className="block text-xs font-bold text-slate-700 mb-1">
                      Grade Applying For *
                    </label>
                    <select
                      id="grade"
                      value={gradeApplying}
                      onChange={(e) => setGradeApplying(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prev-school" className="block text-xs font-bold text-slate-700 mb-1">
                      Previous School Attended
                    </label>
                    <input
                      id="prev-school"
                      type="text"
                      placeholder="e.g. Army Public School / Beaconhouse / None"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="prev-marks" className="block text-xs font-bold text-slate-700 mb-1">
                      Last Exam Percentage / Grade
                    </label>
                    <input
                      id="prev-marks"
                      type="text"
                      placeholder="e.g. 88% or Grade A"
                      value={previousMarks}
                      onChange={(e) => setPreviousMarks(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Guardian Information */}
              <div className="border-b border-slate-100 pb-6 mb-6">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-base">
                  <Users className="size-5 text-blue-600" />
                  <h2>2. Father / Guardian Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label htmlFor="father-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Father / Guardian Full Name *
                    </label>
                    <input
                      id="father-name"
                      type="text"
                      required
                      placeholder="e.g. Tariq Mehmood"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="father-cnic" className="block text-xs font-bold text-slate-700 mb-1">
                      Father / Guardian CNIC Number
                    </label>
                    <input
                      id="father-cnic"
                      type="text"
                      placeholder="e.g. 35202-1234567-1"
                      value={fatherCnic}
                      onChange={(e) => setFatherCnic(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="e.g. +92 300 1234567"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-xs font-bold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-xs font-bold text-slate-700 mb-1">
                      Residential Home Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      placeholder="e.g. House # 14-B, Street 3, Gulberg III"
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="medical" className="block text-xs font-bold text-slate-700 mb-1">
                      Special Remarks or Medical Allergies (Optional)
                    </label>
                    <textarea
                      id="medical"
                      rows={2}
                      placeholder="Any allergies, eye power, or learning preferences we should be aware of..."
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  Your information is encrypted and strictly used for academic records.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                  {!isSubmitting && <ArrowRight className="size-4" />}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Submission Receipt / Confirmation Slip */
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg text-center sm:text-left print:border-none print:shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 className="size-7" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    Application Submitted Successfully!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Your admission voucher has been registered in the EduFlow Campus Database.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center print:hidden">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Printer className="size-3.5" /> Print Receipt
                </button>
                <button
                  onClick={() => setSubmittedApp(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  Apply Another
                </button>
              </div>
            </div>

            {/* Official Voucher Slip */}
            <div className="my-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-200/80 pb-4 mb-4 gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Official Tracking Number</span>
                  <p className="text-2xl font-black text-blue-900 tracking-tight font-mono">
                    {submittedApp.trackingCode}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date of Application</span>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(submittedApp.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Candidate Name</span>
                  <strong className="text-slate-900 font-bold text-sm">{submittedApp.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Applying For</span>
                  <strong className="text-slate-900 font-bold text-sm">{submittedApp.gradeApplying}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Father / Guardian</span>
                  <strong className="text-slate-900 font-bold text-sm">{submittedApp.fatherName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone</span>
                  <strong className="text-slate-900 font-bold text-sm">{submittedApp.guardianPhone}</strong>
                </div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-700 space-y-2.5 print:hidden">
              <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="size-4 text-blue-600" /> Next Steps for Parents:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Keep your Application Tracking Code (<strong>{submittedApp.trackingCode}</strong>) for all inquiries.</li>
                <li>Bring the candidate&apos;s NADRA B-Form copy and 2 passport-sized photographs on the test day.</li>
                <li>School administration will send an entry test schedule via email or SMS within 24 to 48 hours.</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 print:hidden">
              <Link href="/" className="text-xs font-bold text-slate-600 hover:text-blue-600">
                ← Return to EduFlow Homepage
              </Link>
              <a
                href={`mailto:admissions@eduflow.pk?subject=${encodeURIComponent(`Admission Application ${submittedApp.trackingCode} - ${submittedApp.studentName}`)}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                <Mail className="size-4" /> Email Admissions Office
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
