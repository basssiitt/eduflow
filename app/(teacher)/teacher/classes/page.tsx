'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { fetchStudents } from '@/lib/live-data'
import { supabaseClient } from '@/lib/supabaseClient'
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

type TimetableSlot = {
  period: string
  time: string
  subject: string
  className: string
  room: string
  day: string
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function TeacherClassesPage() {
  const [assignedClasses, setAssignedClasses] = useState<ClassBatch[]>([])
  const [timetable, setTimetable] = useState<TimetableSlot[]>([])
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTeacherData() {
      setLoading(true)
      try {
        // 1. Fetch real students from Supabase
        const { data: students } = await fetchStudents()
        const studentList = students || []

        if (studentList.length > 0) {
          // Group real students by class
          const classGroups: Record<string, number> = {}
          for (const s of studentList) {
            const cls = s.class || 'Class 5'
            classGroups[cls] = (classGroups[cls] || 0) + 1
          }

          // Compute real attendance rate for today
          const today = new Date().toISOString().split('T')[0]
          let todayAttendanceMap: Record<string, string> = {}
          if (supabaseClient) {
            try {
              const { data: att } = await supabaseClient
                .from('attendance')
                .select('student_id, status')
                .eq('date', today)
              if (att) {
                todayAttendanceMap = Object.fromEntries(
                  att.map((a: any) => [String(a.student_id), a.status])
                )
              }
            } catch {}
          }

          const batches: ClassBatch[] = Object.entries(classGroups).map(([clsName, count], idx) => {
            // Find students in this class to calculate real attendance
            const classStudents = studentList.filter((s) => (s.class || 'Class 5') === clsName)
            const presentCount = classStudents.filter(
              (s) => todayAttendanceMap[String(s.id)]?.toLowerCase() === 'present'
            ).length
            const attRate = classStudents.length > 0 ? Math.round((presentCount / classStudents.length) * 100) : 0

            return {
              id: `cls-${idx + 1}`,
              name: clsName,
              subject: 'General Academics',
              room: `Room ${101 + idx}`,
              studentsCount: count,
              schedule: 'Monday – Friday',
              attendanceRate: attRate,
            }
          })

          setAssignedClasses(batches)
        } else {
          setAssignedClasses([])
        }

        // 2. Load real master timetable from storage if configured
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('eduflow_master_timetable')
            if (stored) {
              const master = JSON.parse(stored)
              if (master && typeof master === 'object') {
                const slots: TimetableSlot[] = []
                for (const [clsName, daySchedule] of Object.entries(master)) {
                  if (daySchedule && typeof daySchedule === 'object') {
                    for (const [dayName, periodRecord] of Object.entries(daySchedule as Record<string, any>)) {
                      if (periodRecord && typeof periodRecord === 'object') {
                        for (const [pNum, slotData] of Object.entries(periodRecord as Record<string, any>)) {
                          if (slotData && slotData.subject) {
                            slots.push({
                              period: `Period ${pNum}`,
                              time: slotData.time || '08:00 - 08:45 AM',
                              subject: slotData.subject,
                              className: clsName,
                              room: slotData.room || 'Classroom',
                              day: dayName,
                            })
                          }
                        }
                      }
                    }
                  }
                }
                setTimetable(slots)
              }
            } else {
              setTimetable([])
            }
          } catch {
            setTimetable([])
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadTeacherData()
  }, [])

  const daySlots = timetable.filter((slot) => slot.day === selectedDay)
  const totalStudents = assignedClasses.reduce((acc, c) => acc + c.studentsCount, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/teacher"
              className="text-xs text-slate-500 hover:text-blue-600 transition flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="size-3.5" /> Classroom Haziri
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 font-medium">
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs text-xs">
              <CalendarCheck className="mr-1.5 size-4 text-white" /> 1-Click Haziri
            </Button>
          </Link>
          <Link href="/teacher/gradebook">
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs">
              <BookOpen className="mr-1.5 size-4 text-slate-500" /> Enter Marks
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Assigned Classes</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <GraduationCap className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {assignedClasses.length} {assignedClasses.length === 1 ? 'Batch' : 'Batches'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Active class sections in database</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Enrolled Students</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {totalStudents} Learners
          </p>
          <p className="mt-1 text-xs text-slate-500">Across all active sections</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Weekly Teaching Load</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {timetable.length} Periods
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              {timetable.length === 0 ? 'No periods assigned' : `${timetable.length} scheduled periods`}
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Class Status</p>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Calendar className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xl font-bold tracking-tight text-slate-900 truncate">
            {assignedClasses.length > 0 ? assignedClasses[0].name : 'No Active Class'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {assignedClasses.length > 0 ? `${assignedClasses[0].studentsCount} Students Enrolled` : 'Awaiting enrollment'}
          </p>
        </article>
      </section>

      {/* Section 1: Assigned Classes Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              My Teaching Sections
            </h2>
            <p className="text-xs text-slate-500">Primary classroom assignments derived from live Supabase student rosters.</p>
          </div>
        </div>

        {assignedClasses.length === 0 && !loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <ZeroDataEmptyState
              icon={GraduationCap}
              title="No Classes Assigned Yet"
              description="When students are enrolled by school administration, your assigned classroom sections and learner rosters will appear here."
              actionLabel="Go to Classroom Haziri"
              onAction={() => window.location.href = '/teacher'}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedClasses.map((cls) => (
              <article
                key={cls.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-slate-900">
                      {cls.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200/80">
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

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-200/80">
                    <span className="text-slate-500">Class Haziri Average:</span>
                    <span className="font-bold text-emerald-600">{cls.attendanceRate}%</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Link href="/teacher" className="flex-1">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs"
                    >
                      Take Haziri
                    </Button>
                  </Link>
                  <Link href="/teacher/diary">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs px-2.5"
                      title="Audio Voice Diary"
                    >
                      <Mic className="size-3.5 text-slate-600" />
                    </Button>
                  </Link>
                  <Link href="/teacher/gradebook">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs px-2.5"
                      title="Open Gradebook"
                    >
                      <BookOpen className="size-3.5 text-blue-600" />
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Weekly Timetable Schedule */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 p-5 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ACADEMIC SCHEDULE
            </span>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
              Weekly Period Timetable
            </h2>
          </div>

          {/* Day selection tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200/60 p-1 overflow-x-auto">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0',
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable List for selected day */}
        <div className="divide-y divide-slate-100">
          {daySlots.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <ZeroDataEmptyState
                icon={Calendar}
                title={`No Timetable for ${selectedDay}`}
                description="The school administration has not scheduled or published periods for this day yet."
              />
            </div>
          ) : (
            daySlots.map((slot, index) => (
              <div
                key={`${slot.day}-${slot.period}-${index}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-slate-50/60 transition-colors gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                    {slot.period.replace('Period ', 'P')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {slot.subject}
                      </span>
                      <span className="rounded bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
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
                      className="rounded-xl border-slate-200 bg-white text-xs hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      <CalendarCheck className="mr-1.5 size-3.5 text-blue-600" /> Take Haziri
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
