'use client'

import React, { useState } from 'react'
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  GraduationCap,
  Layers,
  Printer,
  Sparkles,
  Users,
} from 'lucide-react'

interface TimetableSlot {
  period: number
  subject: string
  teacher: string
  room: string
  conflict?: boolean
}

type DaySchedule = Record<number, TimetableSlot>

const CLASSES = ['Class 5-A', 'Class 6-B', 'Class 7-A', 'Class 8-B', 'Class 9 (Matric)', 'Cambridge O-Levels']

const REGULAR_PERIOD_TIMES = [
  '08:00 - 08:45 AM',
  '08:45 - 09:30 AM',
  '09:30 - 10:15 AM',
  '10:45 - 11:30 AM', // After recess
  '11:30 - 12:15 PM',
  '12:15 - 01:00 PM',
]

const FRIDAY_PERIOD_TIMES = [
  '08:00 - 08:35 AM',
  '08:35 - 09:10 AM',
  '09:10 - 09:45 AM',
  '10:05 - 10:40 AM',
  '10:40 - 11:15 AM',
  '11:15 - 11:50 AM',
]

const SAMPLE_TIMETABLE: Record<string, Record<string, DaySchedule>> = {
  'Class 5-A': {
    Monday: {
      1: { period: 1, subject: 'Mathematics', teacher: 'Sir Tariq Mehmood', room: 'Room 101' },
      2: { period: 2, subject: 'General Science', teacher: 'Ms. Sadia Bilal', room: 'Sci-Lab A' },
      3: { period: 3, subject: 'English Grammar', teacher: 'Ms. Ayesha Siddiqa', room: 'Room 101' },
      4: { period: 4, subject: 'Urdu Adab', teacher: 'Sir Farhan Raza', room: 'Room 101' },
      5: { period: 5, subject: 'Islamiyat & Nazra', teacher: 'Qari Abdul Rehman', room: 'Room 101' },
      6: { period: 6, subject: 'Physical Education', teacher: 'Sir Zafar Iqbal', room: 'Sports Ground' },
    },
    Tuesday: {
      1: { period: 1, subject: 'General Science', teacher: 'Ms. Sadia Bilal', room: 'Sci-Lab A' },
      2: { period: 2, subject: 'Mathematics', teacher: 'Sir Tariq Mehmood', room: 'Room 101' },
      3: { period: 3, subject: 'Social Studies', teacher: 'Sir Farhan Raza', room: 'Room 101' },
      4: { period: 4, subject: 'Computer IT', teacher: 'Engr. Bilal Khan', room: 'Computer Lab 1' },
      5: { period: 5, subject: 'English Reader', teacher: 'Ms. Ayesha Siddiqa', room: 'Room 101' },
      6: { period: 6, subject: 'Art & Calligraphy', teacher: 'Ms. Hira Aslam', room: 'Art Studio' },
    },
    Wednesday: {
      1: { period: 1, subject: 'Mathematics', teacher: 'Sir Tariq Mehmood', room: 'Room 101' },
      2: { period: 2, subject: 'English Composition', teacher: 'Ms. Ayesha Siddiqa', room: 'Room 101' },
      3: { period: 3, subject: 'General Science', teacher: 'Ms. Sadia Bilal', room: 'Room 101' },
      4: { period: 4, subject: 'Urdu Qawaid', teacher: 'Sir Farhan Raza', room: 'Room 101' },
      5: { period: 5, subject: 'Islamiyat', teacher: 'Qari Abdul Rehman', room: 'Room 101' },
      6: { period: 6, subject: 'Library & Reading', teacher: 'Ms. Hira Aslam', room: 'Central Library' },
    },
    Thursday: {
      1: { period: 1, subject: 'Computer IT', teacher: 'Engr. Bilal Khan', room: 'Computer Lab 1' },
      2: { period: 2, subject: 'Mathematics', teacher: 'Sir Tariq Mehmood', room: 'Room 101' },
      3: { period: 3, subject: 'General Science', teacher: 'Ms. Sadia Bilal', room: 'Sci-Lab A' },
      4: { period: 4, subject: 'English Poetry', teacher: 'Ms. Ayesha Siddiqa', room: 'Room 101' },
      5: { period: 5, subject: 'Social Studies', teacher: 'Sir Farhan Raza', room: 'Room 101' },
      6: { period: 6, subject: 'Quran & Tajweed', teacher: 'Qari Abdul Rehman', room: 'Room 101' },
    },
    Friday: {
      1: { period: 1, subject: 'Friday Assembly & Tarbiyah', teacher: 'Principal & Staff', room: 'Auditorium' },
      2: { period: 2, subject: 'Mathematics Revision', teacher: 'Sir Tariq Mehmood', room: 'Room 101' },
      3: { period: 3, subject: 'English Spelling Bee', teacher: 'Ms. Ayesha Siddiqa', room: 'Room 101' },
      4: { period: 4, subject: 'General Science Quiz', teacher: 'Ms. Sadia Bilal', room: 'Sci-Lab A' },
      5: { period: 5, subject: 'Urdu Khushkhati', teacher: 'Sir Farhan Raza', room: 'Room 101' },
      6: { period: 6, subject: 'Jummah Prayer Prep', teacher: 'Qari Abdul Rehman', room: 'Mosque Hall' },
    },
  },
}

export default function AdminTimetablePage() {
  const [selectedClass, setSelectedClass] = useState('Class 5-A')
  const [scheduleType, setScheduleType] = useState<'regular' | 'friday'>('regular')
  const [activeDay, setActiveDay] = useState<string>('Monday')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const periodTimes = scheduleType === 'regular' ? REGULAR_PERIOD_TIMES : FRIDAY_PERIOD_TIMES

  // Get current class schedule
  const currentSchedule = SAMPLE_TIMETABLE[selectedClass] || SAMPLE_TIMETABLE['Class 5-A']

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Academic Operations
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Master Timetable & Bell Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Configure weekly classroom period allocations, monitor teacher workloads, and prevent double-booking conflicts across labs and classrooms.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Printer className="size-3.5" /> Print Timetable
          </button>
        </div>
      </div>

      {/* Workload & Scheduling Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Periods / Day</span>
          <p className="mt-1 text-2xl font-black text-slate-900">6 Periods</p>
          <span className="text-[11px] text-slate-400">45 mins each + 30m recess</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Faculty On Duty</span>
          <p className="mt-1 text-2xl font-black text-blue-600">18 Teachers</p>
          <span className="text-[11px] text-slate-400">0 scheduling conflicts</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Science / Computer Labs</span>
          <p className="mt-1 text-2xl font-black text-purple-600">4 Dedicated Rooms</p>
          <span className="text-[11px] text-slate-400">Capacity & bookings verified</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Conflict Guard Status</span>
          <p className="mt-1 text-2xl font-black text-emerald-600">100% Conflict-Free</p>
          <span className="text-[11px] text-slate-400">Zero double-booked staff</span>
        </div>
      </div>

      {/* Control Bar: Class selector & Schedule Type */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs print:hidden">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Class & Section:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
          >
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => setScheduleType('regular')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              scheduleType === 'regular'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Regular Bell Schedule (Mon–Thu)
          </button>
          <button
            onClick={() => setScheduleType('friday')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              scheduleType === 'friday'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Friday Shortened Schedule
          </button>
        </div>
      </div>

      {/* Weekly Matrix View */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Weekly Class Routine — {selectedClass}
              </h2>
              <span className="text-xs text-slate-500">
                {scheduleType === 'regular' ? 'Standard 45-Minute Periods' : 'Friday Shortened 35-Minute Periods'}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            Active Term Routine
          </span>
        </div>

        {/* Day Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {days.map((day) => {
            const daySlots = currentSchedule[day] || currentSchedule['Monday']
            return (
              <div key={day} className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-black text-xs text-slate-900">{day}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {day === 'Friday' ? 'Half Day' : 'Full Day'}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4, 5, 6].map((pNum) => {
                    const slot = daySlots[pNum]
                    const time = periodTimes[pNum - 1]
                    if (!slot) return null

                    return (
                      <div
                        key={pNum}
                        className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-blue-400 transition"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Period {pNum}</span>
                          <span className="font-mono text-slate-400">{time}</span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs">{slot.subject}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="truncate max-w-[110px]" title={slot.teacher}>
                            {slot.teacher}
                          </span>
                          <span className="rounded bg-slate-100 px-1 py-0.5 font-medium">
                            {slot.room}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
