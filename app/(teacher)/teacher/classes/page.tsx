'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Mic,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ClassBatch = {
  id: string
  name: string
  subject: string
  room: string
  studentsCount: number
  schedule: string
  attendanceRate: number
}

const assignedClasses: ClassBatch[] = [
  {
    id: 'cls-9a',
    name: 'Class 9-A',
    subject: 'Mathematics & Algebra',
    room: 'Room 204 (Science Block)',
    studentsCount: 32,
    schedule: 'Mon, Wed, Fri · 08:30 – 09:15 AM',
    attendanceRate: 94,
  },
  {
    id: 'cls-10a',
    name: 'Class 10-A',
    subject: 'Geometry & Trigonometry',
    room: 'Room 208 (Senior Wing)',
    studentsCount: 28,
    schedule: 'Mon, Tue, Thu · 10:30 – 11:15 AM',
    attendanceRate: 91,
  },
  {
    id: 'cls-fsc1',
    name: 'FSc Pre-Engineering Part 1',
    subject: 'Calculus & Analytical Geometry',
    room: 'Lecture Hall B',
    studentsCount: 24,
    schedule: 'Daily (Mon–Fri) · 12:00 – 12:45 PM',
    attendanceRate: 96,
  },
]

type TimetableSlot = {
  period: string
  time: string
  subject: string
  className: string
  room: string
  day: string
}

const timetable: TimetableSlot[] = [
  { period: 'Period 1', time: '08:30 – 09:15', subject: 'Mathematics', className: 'Class 9-A', room: 'Room 204', day: 'Monday' },
  { period: 'Period 2', time: '09:15 – 10:00', subject: 'Mathematics Prep', className: 'Faculty Room', room: 'Block A', day: 'Monday' },
  { period: 'Period 3', time: '10:30 – 11:15', subject: 'Geometry', className: 'Class 10-A', room: 'Room 208', day: 'Monday' },
  { period: 'Period 5', time: '12:00 – 12:45', subject: 'Calculus', className: 'FSc-I', room: 'Lecture Hall B', day: 'Monday' },

  { period: 'Period 1', time: '08:30 – 09:15', subject: 'Algebra Tutorial', className: 'Class 9-B', room: 'Room 205', day: 'Tuesday' },
  { period: 'Period 3', time: '10:30 – 11:15', subject: 'Trigonometry', className: 'Class 10-A', room: 'Room 208', day: 'Tuesday' },
  { period: 'Period 5', time: '12:00 – 12:45', subject: 'Calculus', className: 'FSc-I', room: 'Lecture Hall B', day: 'Tuesday' },

  { period: 'Period 1', time: '08:30 – 09:15', subject: 'Mathematics', className: 'Class 9-A', room: 'Room 204', day: 'Wednesday' },
  { period: 'Period 4', time: '11:15 – 12:00', subject: 'Problem Solving Lab', className: 'Class 10-A', room: 'Math Lab', day: 'Wednesday' },
  { period: 'Period 5', time: '12:00 – 12:45', subject: 'Calculus', className: 'FSc-I', room: 'Lecture Hall B', day: 'Wednesday' },

  { period: 'Period 2', time: '09:15 – 10:00', subject: 'Math Drill', className: 'Class 9-A', room: 'Room 204', day: 'Thursday' },
  { period: 'Period 3', time: '10:30 – 11:15', subject: 'Geometry Quiz', className: 'Class 10-A', room: 'Room 208', day: 'Thursday' },
  { period: 'Period 5', time: '12:00 – 12:45', subject: 'Calculus', className: 'FSc-I', room: 'Lecture Hall B', day: 'Thursday' },

  { period: 'Period 1', time: '08:30 – 09:15', subject: 'Mathematics', className: 'Class 9-A', room: 'Room 204', day: 'Friday' },
  { period: 'Period 2', time: '09:15 – 10:00', subject: 'Weekly Assessment', className: 'Class 10-A', room: 'Room 208', day: 'Friday' },
  { period: 'Period 4', time: '11:00 – 11:45', subject: 'Calculus Review', className: 'FSc-I', room: 'Lecture Hall B', day: 'Friday' },
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function TeacherClassesPage() {
  const [selectedDay, setSelectedDay] = useState('Monday')

  const daySlots = timetable.filter((slot) => slot.day === selectedDay)

  return (
    <div className="flex flex-col gap-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/teacher"
              className="text-xs text-slate-500 hover:text-[#2c1d17] transition flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="size-3.5" /> Classroom Haziri
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <Badge className="bg-[#faf9f5] text-[#2c1d17] hover:bg-[#faf9f5] border border-[#e7e2da]">
              Session 2026–2027
            </Badge>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            My Assigned Classes &amp; Timetable
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Weekly timetable schedule, classroom locations, student enrollments, and quick haziri shortcuts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/teacher">
            <Button className="bg-[#2c1d17] hover:bg-[#1e130f] text-white font-semibold rounded-xl shadow-xs text-xs">
              <CalendarCheck className="mr-1.5 size-4 text-[#c5a059]" /> 1-Click Haziri
            </Button>
          </Link>
          <Link href="/teacher/gradebook">
            <Button variant="outline" className="rounded-xl border-[#e7e2da] hover:border-[#c5a059] hover:bg-[#faf9f5] hover:text-[#2c1d17] text-xs">
              <BookOpen className="mr-1.5 size-4 text-[#c5a059]" /> Enter Marks
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs hover:border-[#c5a059] transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#5c4a3e]">Assigned Classes</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
              <GraduationCap className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {assignedClasses.length} Batches
          </p>
          <p className="mt-1 text-xs text-slate-500">Secondary &amp; College levels</p>
        </article>

        <article className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs hover:border-[#c5a059] transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#5c4a3e]">Enrolled Students</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {assignedClasses.reduce((acc, c) => acc + c.studentsCount, 0)} Learners
          </p>
          <p className="mt-1 text-xs text-slate-500">Across all teaching sections</p>
        </article>

        <article className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs hover:border-[#c5a059] transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#5c4a3e]">Weekly Teaching Load</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {timetable.length} Periods
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              13.5 hours / week
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs hover:border-[#c5a059] transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#5c4a3e]">Next Class Today</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xl font-bold tracking-tight text-slate-900 truncate">
            Class 10-A
          </p>
          <p className="mt-1 text-xs text-slate-500">10:30 AM · Room 208</p>
        </article>
      </section>

      {/* Section 1: Assigned Classes Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              My Teaching Sections
            </h2>
            <p className="text-xs text-slate-500">Primary classroom assignments for this academic term.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignedClasses.map((cls) => (
            <article
              key={cls.id}
              className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs hover:border-[#c5a059] transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-slate-900">
                    {cls.name}
                  </span>
                  <span className="rounded-full bg-[#faf9f5] px-2.5 py-0.5 text-xs font-bold text-[#2c1d17] border border-[#e7e2da]">
                    {cls.studentsCount} Students
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {cls.subject}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="size-3.5 text-slate-400" />
                  <span>{cls.room}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="size-3.5 text-slate-400" />
                  <span>{cls.schedule}</span>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#faf9f5] p-2.5 text-xs border border-[#e7e2da]">
                  <span className="text-slate-500">Class Haziri Average:</span>
                  <span className="font-bold text-emerald-600">{cls.attendanceRate}%</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-[#e7e2da]">
                <Link href="/teacher" className="flex-1">
                  <Button
                    size="sm"
                    className="w-full bg-[#2c1d17] hover:bg-[#1e130f] text-white font-medium text-xs rounded-xl shadow-xs"
                  >
                    Take Haziri
                  </Button>
                </Link>
                <Link href="/teacher/diary">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#e7e2da] hover:border-[#c5a059] hover:bg-[#faf9f5] text-xs px-2.5"
                    title="Audio Voice Diary"
                  >
                    <Mic className="size-3.5 text-[#2c1d17]" />
                  </Button>
                </Link>
                <Link href="/teacher/gradebook">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#e7e2da] hover:border-[#c5a059] hover:bg-[#faf9f5] text-xs px-2.5"
                    title="Open Gradebook"
                  >
                    <BookOpen className="size-3.5 text-[#c5a059]" />
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Section 2: Weekly Timetable Schedule */}
      <section className="rounded-2xl border border-[#e7e2da] bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e7e2da] p-5 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5c4a3e]">
              ACADEMIC SCHEDULE
            </span>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
              Weekly Period Timetable
            </h2>
          </div>

          {/* Day selection tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-[#faf9f5] border border-[#e7e2da] p-1 overflow-x-auto">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0',
                  selectedDay === day
                    ? 'bg-[#2c1d17] text-white shadow-xs'
                    : 'text-[#5c4a3e] hover:text-[#2c1d17]'
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable List for selected day */}
        <div className="divide-y divide-[#e7e2da]">
          {daySlots.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No classes scheduled for {selectedDay}.
            </div>
          ) : (
            daySlots.map((slot, index) => (
              <div
                key={`${slot.day}-${slot.period}-${index}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-[#faf9f5] transition-colors gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] font-bold text-xs border border-[#e7e2da]">
                    {slot.period.replace('Period ', 'P')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {slot.subject}
                      </span>
                      <span className="rounded bg-[#f7f5f0] border border-[#e7e2da] px-2 py-0.5 text-[11px] font-semibold text-[#2c1d17]">
                        {slot.className}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-slate-400" />
                        {slot.time}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 text-slate-400" />
                        {slot.room}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end">
                  <Link href="/teacher">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-[#e7e2da] text-xs hover:border-[#c5a059] hover:text-[#2c1d17] hover:bg-[#faf9f5]"
                    >
                      <CalendarCheck className="mr-1.5 size-3.5 text-[#c5a059]" /> Take Haziri
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
