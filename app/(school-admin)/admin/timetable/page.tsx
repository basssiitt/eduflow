'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Layers,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { fetchTeachers } from '@/lib/live-data'

export interface TimetableSlot {
  period: number
  subject: string
  teacher: string
  room: string
  time?: string
}

export type DaySchedule = Record<number, TimetableSlot>
export type ClassSchedule = Record<string, DaySchedule>
export type MasterTimetable = Record<string, ClassSchedule>

const DEFAULT_CLASSES = [
  'Class 5-A',
  'Class 6-A',
  'Class 7-A',
  'Class 8-A',
  'Class 9-A',
  'Class 10-A',
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const REGULAR_PERIOD_TIMES = [
  '08:00 - 08:45 AM',
  '08:45 - 09:30 AM',
  '09:30 - 10:15 AM',
  '10:45 - 11:30 AM',
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

const STORAGE_KEY = 'eduflow_master_timetable'

export default function AdminTimetablePage() {
  const [timetable, setTimetable] = useState<MasterTimetable>({})
  const [selectedClass, setSelectedClass] = useState<string>('Class 5-A')
  const [scheduleType, setScheduleType] = useState<'regular' | 'friday'>('regular')
  const [registeredTeachers, setRegisteredTeachers] = useState<string[]>([])
  const [toast, setToast] = useState<string>('')
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add slot form
  const [formDay, setFormDay] = useState('Monday')
  const [formPeriod, setFormPeriod] = useState(1)
  const [formSubject, setFormSubject] = useState('')
  const [formTeacher, setFormTeacher] = useState('')
  const [formRoom, setFormRoom] = useState('')

  // CSV paste input
  const [csvText, setCsvText] = useState('')

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Load from local storage and fetch live teachers on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && typeof parsed === 'object') {
            setTimetable(parsed)
          }
        }
      } catch {}
    }

    async function loadTeachers() {
      const res = await fetchTeachers()
      if (res.data && res.data.length > 0) {
        setRegisteredTeachers(res.data.map(t => t.name))
      }
    }
    loadTeachers()
  }, [])

  // Persist timetable helper
  const saveTimetable = (updated: MasterTimetable) => {
    setTimetable(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {}
    }
  }

  // Available classes: union of DEFAULT_CLASSES and any keys in timetable
  const availableClasses = useMemo(() => {
    const set = new Set([...DEFAULT_CLASSES, ...Object.keys(timetable)])
    return Array.from(set)
  }, [timetable])

  const periodTimes = scheduleType === 'regular' ? REGULAR_PERIOD_TIMES : FRIDAY_PERIOD_TIMES

  // Current class schedule
  const currentClassSchedule: ClassSchedule = timetable[selectedClass] || {}

  // Compute total slots for this class
  const totalSlotsForClass = useMemo(() => {
    let count = 0
    Object.values(currentClassSchedule).forEach(dayObj => {
      count += Object.keys(dayObj || {}).length
    })
    return count
  }, [currentClassSchedule])

  // Compute unique teachers and rooms in current class schedule
  const { assignedTeachers, assignedRooms, maxPeriodsCount } = useMemo(() => {
    const teachers = new Set<string>()
    const rooms = new Set<string>()
    let maxP = 0

    Object.values(currentClassSchedule).forEach(dayObj => {
      Object.entries(dayObj || {}).forEach(([pStr, slot]) => {
        if (slot.teacher) teachers.add(slot.teacher.trim())
        if (slot.room) rooms.add(slot.room.trim())
        const pNum = Number(pStr)
        if (pNum > maxP) maxP = pNum
      })
    })

    return {
      assignedTeachers: teachers.size,
      assignedRooms: rooms.size,
      maxPeriodsCount: maxP > 0 ? maxP : (totalSlotsForClass > 0 ? 6 : 0),
    }
  }, [currentClassSchedule, totalSlotsForClass])

  // Check conflicts across the entire school timetable
  const conflictCount = useMemo(() => {
    let conflicts = 0
    const teacherSlotMap: Record<string, string> = {}
    const roomSlotMap: Record<string, string> = {}

    Object.entries(timetable).forEach(([cls, classObj]) => {
      Object.entries(classObj || {}).forEach(([day, dayObj]) => {
        Object.entries(dayObj || {}).forEach(([period, slot]) => {
          if (slot.teacher) {
            const tKey = `${day}_${period}_${slot.teacher.trim().toLowerCase()}`
            if (teacherSlotMap[tKey] && teacherSlotMap[tKey] !== cls) {
              conflicts++
            } else {
              teacherSlotMap[tKey] = cls
            }
          }
          if (slot.room) {
            const rKey = `${day}_${period}_${slot.room.trim().toLowerCase()}`
            if (roomSlotMap[rKey] && roomSlotMap[rKey] !== cls) {
              conflicts++
            } else {
              roomSlotMap[rKey] = cls
            }
          }
        })
      })
    })

    return conflicts
  }, [timetable])

  // Handle Save Slot
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSubject.trim() || !formTeacher.trim()) {
      alert('Please provide Subject and Teacher Name.')
      return
    }

    const updated: MasterTimetable = { ...timetable }
    if (!updated[selectedClass]) updated[selectedClass] = {}
    if (!updated[selectedClass][formDay]) updated[selectedClass][formDay] = {}

    updated[selectedClass][formDay][formPeriod] = {
      period: formPeriod,
      subject: formSubject.trim(),
      teacher: formTeacher.trim(),
      room: formRoom.trim() || 'Room 101',
      time: periodTimes[formPeriod - 1] || '08:00 - 08:45 AM',
    }

    saveTimetable(updated)
    setIsAddModalOpen(false)
    setFormSubject('')
    setFormTeacher('')
    setFormRoom('')
    notify(`Slot added for ${selectedClass} (${formDay}, Period ${formPeriod})`)
  }

  // Handle Delete Slot
  const handleDeleteSlot = (day: string, period: number) => {
    const updated: MasterTimetable = { ...timetable }
    if (updated[selectedClass]?.[day]?.[period]) {
      delete updated[selectedClass][day][period]
      saveTimetable(updated)
      notify(`Removed Period ${period} on ${day}`)
    }
  }

  // Clear Class Timetable
  const handleClearClass = () => {
    if (confirm(`Are you sure you want to clear the entire timetable for ${selectedClass}?`)) {
      const updated = { ...timetable }
      delete updated[selectedClass]
      saveTimetable(updated)
      notify(`Cleared timetable for ${selectedClass}`)
    }
  }

  // Handle CSV Template Download
  const handleDownloadTemplate = () => {
    const headers = 'Class,Day,Period,Subject,Teacher,Room\n'
    const sampleRows = [
      'Class 5-A,Monday,1,Mathematics,Tariq Mehmood,Room 101',
      'Class 5-A,Monday,2,General Science,Sadia Bilal,Sci-Lab A',
      'Class 5-A,Tuesday,1,English Grammar,Ayesha Siddiqa,Room 101',
    ].join('\n')
    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'eduflow_timetable_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle CSV Import
  const processCsvData = (rawText: string) => {
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length <= 1) {
      alert('CSV file does not contain enough data rows.')
      return
    }

    const updated: MasterTimetable = { ...timetable }
    let importedRows = 0

    // Check header
    const startIdx = lines[0].toLowerCase().includes('class') ? 1 : 0

    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      if (cols.length >= 4) {
        const rowClass = cols[0] || selectedClass
        const rowDay = cols[1] || 'Monday'
        const rowPeriod = parseInt(cols[2], 10) || 1
        const rowSubject = cols[3] || 'General'
        const rowTeacher = cols[4] || 'Faculty Member'
        const rowRoom = cols[5] || 'Room 101'

        if (!updated[rowClass]) updated[rowClass] = {}
        if (!updated[rowClass][rowDay]) updated[rowClass][rowDay] = {}

        updated[rowClass][rowDay][rowPeriod] = {
          period: rowPeriod,
          subject: rowSubject,
          teacher: rowTeacher,
          room: rowRoom,
          time: periodTimes[rowPeriod - 1] || '08:00 - 08:45 AM',
        }
        importedRows++
      }
    }

    if (importedRows > 0) {
      saveTimetable(updated)
      setIsImportModalOpen(false)
      setCsvText('')
      notify(`Successfully imported ${importedRows} timetable periods.`)
    } else {
      alert('Could not parse timetable rows. Ensure CSV follows: Class,Day,Period,Subject,Teacher,Room')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) processCsvData(content)
    }
    reader.readAsText(file)
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

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="mr-1.5 size-3.5" /> CSV Template
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="mr-1.5 size-3.5" /> Import CSV
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Plus className="mr-1.5 size-3.5" /> Add Routine Slot
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Printer className="mr-1.5 size-3.5" /> Print
          </Button>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Workload & Scheduling Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Periods / Day</span>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {maxPeriodsCount > 0 ? `${maxPeriodsCount} Periods` : '0 Periods'}
          </p>
          <span className="text-[11px] text-slate-400">
            {scheduleType === 'regular' ? '45 mins each + recess' : '35 mins Friday schedule'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Faculty Assigned</span>
          <p className="mt-1 text-2xl font-black text-blue-600">
            {assignedTeachers} Teachers
          </p>
          <span className="text-[11px] text-slate-400">In this class timetable</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Dedicated Rooms</span>
          <p className="mt-1 text-2xl font-black text-purple-600">
            {assignedRooms} Rooms
          </p>
          <span className="text-[11px] text-slate-400">Allocated classrooms & labs</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Conflict Guard Status</span>
          <p className={`mt-1 text-2xl font-black ${
            totalSlotsForClass === 0 ? 'text-slate-500' :
            conflictCount > 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {totalSlotsForClass === 0 ? 'No Active Schedule' :
             conflictCount > 0 ? `${conflictCount} Conflicts` : '100% Conflict-Free'}
          </p>
          <span className="text-[11px] text-slate-400">
            {totalSlotsForClass === 0 ? 'Define slots to activate guard' :
             conflictCount > 0 ? 'Review overlapping room/teacher' : 'Zero double-booked staff'}
          </span>
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
            {availableClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {totalSlotsForClass > 0 && (
            <button
              onClick={handleClearClass}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold ml-2 hover:underline"
            >
              Clear Class Schedule
            </button>
          )}
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

      {/* Weekly Matrix View or Zero State */}
      {totalSlotsForClass === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <ZeroDataEmptyState
            icon={Calendar}
            title="No Timetable Configured Yet"
            description={`No classroom routine has been scheduled for ${selectedClass}. Create period slots manually or import a routine CSV template.`}
            actionLabel="Add Routine Slot"
            onAction={() => setIsAddModalOpen(true)}
            secondaryActionLabel="Import CSV Template"
            onSecondaryAction={() => setIsImportModalOpen(true)}
          />
        </div>
      ) : (
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
            {DAYS.map((day) => {
              const daySlots = currentClassSchedule[day] || {}
              const sortedPeriods = Object.keys(daySlots)
                .map(Number)
                .sort((a, b) => a - b)

              return (
                <div key={day} className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-black text-xs text-slate-900">{day}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {day === 'Friday' ? 'Half Day' : 'Full Day'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 min-h-[140px]">
                    {sortedPeriods.length === 0 ? (
                      <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-slate-400">
                        <span className="text-[11px] italic">No periods</span>
                        <button
                          onClick={() => {
                            setFormDay(day)
                            setFormPeriod(1)
                            setIsAddModalOpen(true)
                          }}
                          className="mt-1.5 text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          + Add Period
                        </button>
                      </div>
                    ) : (
                      sortedPeriods.map((pNum) => {
                        const slot = daySlots[pNum]
                        const time = slot.time || periodTimes[pNum - 1] || `Period ${pNum}`

                        return (
                          <div
                            key={`${day}-${time}-${pNum}`}
                            className="group relative rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-blue-400 transition"
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                              <span>Period {pNum}</span>
                              <span className="font-mono text-slate-400">{time}</span>
                            </div>
                            <p className="font-bold text-slate-900 text-xs">{slot.subject}</p>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                              <span className="truncate max-w-[100px]" title={slot.teacher}>
                                {slot.teacher}
                              </span>
                              <span className="rounded bg-slate-100 px-1 py-0.5 font-medium">
                                {slot.room}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteSlot(day, pNum)}
                              className="absolute right-1.5 top-1.5 hidden group-hover:flex size-5 items-center justify-center rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                              title="Delete Period"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Routine Slot</h3>
                <p className="text-xs text-slate-500">Assign a period to {selectedClass}</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Day</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Period Number</label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                      <option key={p} value={p}>Period {p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject Name</label>
                <Input
                  required
                  placeholder="e.g. Mathematics, English Grammar"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Teacher</label>
                <Input
                  required
                  list="teacher-suggestions"
                  placeholder="e.g. Sir Tariq Mehmood"
                  value={formTeacher}
                  onChange={(e) => setFormTeacher(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs"
                />
                <datalist id="teacher-suggestions">
                  {registeredTeachers.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Classroom / Lab</label>
                <Input
                  placeholder="e.g. Room 101, Sci-Lab A, Computer Lab"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  Save Period Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Import Timetable CSV</h3>
                <p className="text-xs text-slate-500">Bulk upload classroom schedules using CSV format</p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-blue-800">
                <p className="font-bold mb-1">Expected Format:</p>
                <code className="text-[11px] font-mono block text-blue-900 bg-white/70 p-1.5 rounded-lg border border-blue-200">
                  Class,Day,Period,Subject,Teacher,Room
                </code>
              </div>

              <div className="flex items-center justify-between">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-slate-200 text-xs font-medium"
                >
                  <Upload className="mr-1.5 size-3.5" /> Select .CSV File
                </Button>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Download Blank Template
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Or Paste CSV Content:
                </label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`Class 5-A,Monday,1,Mathematics,Tariq Mehmood,Room 101\nClass 5-A,Monday,2,General Science,Sadia Bilal,Sci-Lab A`}
                  className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImportModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!csvText.trim()}
                  onClick={() => processCsvData(csvText)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                >
                  Import Pasted Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
