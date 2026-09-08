'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Recipient = {
  id: string
  name: string
  roll: string
  class: string
  guardian: string
  phone: string
  arrears?: number
  absentToday?: boolean
}

const recipientsSeed: Recipient[] = [
  { id: '1', name: 'Ali Khan', roll: '2026-001', class: 'Class 5-A', guardian: 'Tariq Khan', phone: '923001234567', arrears: 4500, absentToday: true },
  { id: '2', name: 'Zainab Fatima', roll: '2026-002', class: 'Class 5-A', guardian: 'Muhammad Usman', phone: '923012345678', arrears: 0, absentToday: false },
  { id: '3', name: 'Hamza Bilal', roll: '2026-003', class: 'Class 6-B', guardian: 'Bilal Farooq', phone: '923023456789', arrears: 8000, absentToday: true },
  { id: '4', name: 'Ayesha Raza', roll: '2026-004', class: 'Class 7-A', guardian: 'Raza Ahmed', phone: '923034567890', arrears: 3500, absentToday: false },
  { id: '5', name: 'Mustafa Kamal', roll: '2026-005', class: 'Class 8-C', guardian: 'Kamal Pasha', phone: '923045678901', arrears: 12000, absentToday: true },
  { id: '6', name: 'Sara Imran', roll: '2026-006', class: 'Class 9-A', guardian: 'Imran Bashir', phone: '923056789012', arrears: 0, absentToday: false },
]

type BroadcastLog = {
  id: string
  templateName: string
  targetGroup: string
  recipientCount: number
  timestamp: string
  status: 'Delivered' | 'Queued'
}

export function BroadcastCenter() {
  const [template, setTemplate] = useState<'absent' | 'fee' | 'smog' | 'exam'>('absent')
  const [audience, setAudience] = useState<'all' | 'absent' | 'defaulters' | 'class5'>('absent')
  const [customNote, setCustomNote] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [toast, setToast] = useState('')
  const [history, setHistory] = useState<BroadcastLog[]>([
    { id: 'BRD-901', templateName: 'Fee Challan Due Notice', targetGroup: 'Unpaid Arrears', recipientCount: 38, timestamp: 'Yesterday, 04:15 PM', status: 'Delivered' },
    { id: 'BRD-902', templateName: 'Morning Haziri Alert', targetGroup: 'Daily Absent Pool', recipientCount: 14, timestamp: '01-Oct-2026, 09:35 AM', status: 'Delivered' },
  ])

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const getFilteredRecipients = () => {
    if (audience === 'absent') return recipientsSeed.filter(r => r.absentToday)
    if (audience === 'defaulters') return recipientsSeed.filter(r => (r.arrears || 0) > 0)
    if (audience === 'class5') return recipientsSeed.filter(r => r.class.includes('Class 5'))
    return recipientsSeed
  }

  const targetList = getFilteredRecipients()

  const formatMessageForRecipient = (r: Recipient) => {
    if (template === 'absent') {
      return `Assalam-o-Alaikum Dear ${r.guardian},\n\nThis is an automated attendance notification from EduFlow Academy.\n\nYour child *${r.name}* (Roll: ${r.roll}, ${r.class}) was marked *ABSENT* today without prior leave.\n\nKindly contact the campus admin if this was in error.\n\n— EduFlow Campus Office`
    }
    if (template === 'fee') {
      return `Dear ${r.guardian},\n\nThis is a friendly reminder that *${r.name}* has a pending fee balance of *PKR ${(r.arrears || 4500).toLocaleString('en-PK')}*.\n\nPlease clear your challan via 1Link 1Bill or at any designated bank branch before the due date to avoid the late surcharge.\n\n— EduFlow Accounts Office`
    }
    if (template === 'smog') {
      return `URGENT CIRCULAR: Due to official government environmental directives regarding severe smog/air quality, EduFlow Campus classes will remain *CLOSED* tomorrow.\n\nTeachers have uploaded homework audio diaries on the Parent Portal.\n\n— Principal, EduFlow Academy`
    }
    return `Dear ${r.guardian},\n\nThe Mid-Term Examination Date Sheet for *${r.name}* has been published on the Parent Portal.\n\nPapers commence from Monday, 12-Oct-2026. Please check your child's syllabus review.\n\n— EduFlow Exam Controller`
  }

  const handleQueueBroadcast = () => {
    setBroadcasting(true)
    setTimeout(() => {
      setBroadcasting(false)
      const templateTitles = {
        absent: 'Morning Haziri Alert',
        fee: 'Fee Due & Arrears Reminder',
        smog: 'Smog / Weather Emergency Circular',
        exam: 'Mid-Term Exam Date Sheet',
      }
      const newEntry: BroadcastLog = {
        id: `BRD-${Date.now().toString().slice(-3)}`,
        templateName: templateTitles[template],
        targetGroup: audience === 'absent' ? 'Daily Absent Pool' : audience === 'defaulters' ? 'Fee Defaulters' : 'Whole School',
        recipientCount: targetList.length,
        timestamp: 'Just now',
        status: 'Delivered',
      }
      setHistory([newEntry, ...history])
      notify(`WhatsApp broadcast dispatched to ${targetList.length} parents!`)
    }, 1000)
  }

  const previewRecipient = targetList[0] || recipientsSeed[0]

  return (
    <div className="space-y-6">
      <nav className="flex items-center justify-between text-xs text-stone-500 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-[#2c1d17] transition flex items-center gap-1 text-stone-600">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-[#2c1d17] font-semibold">WhatsApp Notification Center</span>
        </div>
      </nav>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059] flex items-center gap-1.5">
            <MessageCircle className="size-3.5" /> Automated Broadcast Gateway
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#2c1d17]">WhatsApp Notification Hub</h1>
          <p className="text-stone-500">Dispatch morning absentee haziri alerts, fee challan reminders, and official campus circulars.</p>
        </div>
        <Button
          onClick={handleQueueBroadcast}
          disabled={broadcasting || targetList.length === 0}
          className="bg-[#2c1d17] hover:bg-[#1e130f] text-white font-semibold rounded-xl shadow-xs"
        >
          <Send className="mr-2 size-4" />
          {broadcasting ? 'Dispatching…' : `Broadcast to ${targetList.length} Guardians`}
        </Button>
      </header>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Grid: Template Selector & Message Composer */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Template & Audience */}
        <div className="space-y-5 lg:col-span-2">
          {/* Step 1: Pre-built templates */}
          <section className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#2c1d17]">1. Select Notification Template</h3>
              <span className="text-[11px] text-stone-400">Pre-approved message shapes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setTemplate('absent'); setAudience('absent') }}
                className={`p-3.5 rounded-xl border text-left transition ${
                  template === 'absent'
                    ? 'border-[#c5a059] bg-[#faf9f5] text-[#2c1d17] ring-1 ring-[#c5a059]'
                    : 'border-[#e7e2da] hover:bg-[#faf9f5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Morning Haziri Absent Alert</span>
                  <span className="text-[10px] font-semibold bg-[#fce4ec] text-[#880e4f] px-1.5 py-0.5 rounded-xs">High Priority</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Instant notification to parents of kids marked absent today at 09:30 AM.</p>
              </button>

              <button
                type="button"
                onClick={() => { setTemplate('fee'); setAudience('defaulters') }}
                className={`p-3.5 rounded-xl border text-left transition ${
                  template === 'fee'
                    ? 'border-[#c5a059] bg-[#faf9f5] text-[#2c1d17] ring-1 ring-[#c5a059]'
                    : 'border-[#e7e2da] hover:bg-[#faf9f5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Fee Due &amp; Arrears Reminder</span>
                  <span className="text-[10px] font-semibold bg-[#efebe9] text-[#5D4037] px-1.5 py-0.5 rounded-xs">Accounts</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Sends student challan amount, due date, and 1Link 1Bill PSID.</p>
              </button>

              <button
                type="button"
                onClick={() => { setTemplate('smog'); setAudience('all') }}
                className={`p-3.5 rounded-xl border text-left transition ${
                  template === 'smog'
                    ? 'border-[#c5a059] bg-[#faf9f5] text-[#2c1d17] ring-1 ring-[#c5a059]'
                    : 'border-[#e7e2da] hover:bg-[#faf9f5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Smog / Weather Emergency Circular</span>
                  <span className="text-[10px] font-semibold bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da] px-1.5 py-0.5 rounded-xs">Emergency</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Broadcast official holiday decrees or weather announcements school-wide.</p>
              </button>

              <button
                type="button"
                onClick={() => { setTemplate('exam'); setAudience('all') }}
                className={`p-3.5 rounded-xl border text-left transition ${
                  template === 'exam'
                    ? 'border-[#c5a059] bg-[#faf9f5] text-[#2c1d17] ring-1 ring-[#c5a059]'
                    : 'border-[#e7e2da] hover:bg-[#faf9f5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Mid-Term Exam Date Sheet</span>
                  <span className="text-[10px] font-semibold bg-[#f7f5f0] text-[#2c1d17] border border-[#e7e2da] px-1.5 py-0.5 rounded-xs">Academics</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Announces examination schedule dates and parent portal syllabus link.</p>
              </button>
            </div>
          </section>

          {/* Step 2: Target Audience */}
          <section className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#2c1d17]">2. Target Audience</h3>
              <span className="text-xs font-semibold text-[#c5a059]">{targetList.length} Parents Selected</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAudience('absent')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  audience === 'absent' ? 'bg-[#2c1d17] text-white border-[#2c1d17]' : 'border-[#e7e2da] text-stone-600 hover:bg-[#faf9f5]'
                }`}
              >
                Students Absent Today ({recipientsSeed.filter(r => r.absentToday).length})
              </button>

              <button
                type="button"
                onClick={() => setAudience('defaulters')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  audience === 'defaulters' ? 'bg-[#2c1d17] text-white border-[#2c1d17]' : 'border-[#e7e2da] text-stone-600 hover:bg-[#faf9f5]'
                }`}
              >
                Unpaid Arrears Defaulters ({recipientsSeed.filter(r => (r.arrears || 0) > 0).length})
              </button>

              <button
                type="button"
                onClick={() => setAudience('class5')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  audience === 'class5' ? 'bg-[#2c1d17] text-white border-[#2c1d17]' : 'border-[#e7e2da] text-stone-600 hover:bg-[#faf9f5]'
                }`}
              >
                Class 5 Primary Only
              </button>

              <button
                type="button"
                onClick={() => setAudience('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  audience === 'all' ? 'bg-[#2c1d17] text-white border-[#2c1d17]' : 'border-[#e7e2da] text-stone-600 hover:bg-[#faf9f5]'
                }`}
              >
                All Enrolled Campus Students ({recipientsSeed.length})
              </button>
            </div>
          </section>

          {/* Recipient Roster */}
          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Recipient Dispatch Roster</span>
              <span className="text-[11px] text-slate-400">1-Click individual WhatsApp or bulk queue</span>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-500 text-[10px] uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-4 py-2.5">Parent / Guardian</th>
                    <th className="px-4 py-2.5">WhatsApp Contact</th>
                    <th className="px-4 py-2.5">Status Filter</th>
                    <th className="px-4 py-2.5 text-right">Individual Send</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {targetList.map((r) => {
                    const msg = formatMessageForRecipient(r)
                    const waUrl = `https://wa.me/${r.phone}?text=${encodeURIComponent(msg)}`
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100">
                          {r.name} <span className="font-normal text-[11px] text-slate-500">({r.class})</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{r.guardian}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">+{r.phone}</td>
                        <td className="px-4 py-2.5">
                          {r.absentToday && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 mr-1">
                              Absent
                            </span>
                          )}
                          {(r.arrears || 0) > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                              Fee Due
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            <MessageCircle className="size-3" /> Send
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Live WhatsApp Message Simulator & History */}
        <div className="space-y-5">
          {/* WhatsApp Chat Preview Phone Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-900 p-4 text-white shadow-md">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="size-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                WA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">EduFlow Broadcast Preview</p>
                <p className="text-[10px] text-emerald-400">Target: {previewRecipient.guardian} (+{previewRecipient.phone})</p>
              </div>
            </div>

            {/* Bubble */}
            <div className="my-4 bg-emerald-950/60 border border-emerald-800/60 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-200 leading-relaxed font-sans">
              <pre className="whitespace-pre-wrap font-sans text-xs">{formatMessageForRecipient(previewRecipient)}</pre>
              <div className="flex justify-end items-center gap-1 text-[10px] text-emerald-400 mt-2">
                <span>09:30 AM</span>
                <Check className="size-3" />
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Parent receives this personalized message directly in WhatsApp with 1-click response ability.
            </p>
          </div>

          {/* Broadcast History */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Recent Dispatches</h4>
            <div className="space-y-3">
              {history.map((log) => (
                <div key={log.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{log.templateName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{log.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{log.recipientCount} messages · {log.targetGroup}</span>
                    <span className="text-emerald-600 font-semibold">{log.status}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
