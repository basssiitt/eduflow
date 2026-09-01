"use client"

import { useMemo, useState } from "react"
import { Bell, CalendarDays, Check, ChevronDown, Clock3, Download, GripVertical, MessageCircle, Pencil, Printer, Search, Send, UserRound, Users, X } from "lucide-react"

type Slot = { subject: string; teacher: string; room: string; tone: "green" | "blue" | "amber" | "slate" }
type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"

const days: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const periods = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"]
const times = ["8:00 AM", "8:45 AM", "9:30 AM", "10:15 AM", "11:30 AM", "12:15 PM", "1:30 PM"]
const classes = ["All Classes", "Class 5-A", "Class 6-A", "Class 7-A", "Class 8-A", "Class 9-A", "Class 10-A"]
const teachers = ["All Teachers", "Science Faculty", "Math Faculty", "Urdu Faculty", "Computer Faculty", "English Faculty"]
const baseSchedule: Record<Day, Record<string, Slot>> = {
  Monday: { P1: { subject: "Mathematics", teacher: "Math Teacher", room: "Room 12", tone: "blue" }, P2: { subject: "Science", teacher: "Science Teacher", room: "Lab 02", tone: "green" }, P3: { subject: "English", teacher: "English Teacher", room: "Room 08", tone: "amber" }, P4: { subject: "Break / Assembly", teacher: "All students", room: "Ground", tone: "slate" }, P5: { subject: "Urdu", teacher: "Urdu Teacher", room: "Room 08", tone: "amber" }, P6: { subject: "Computer", teacher: "Computer Teacher", room: "Lab 01", tone: "green" }, P7: { subject: "Islamiyat", teacher: "Islamiyat Teacher", room: "Room 05", tone: "blue" } },
  Tuesday: { P1: { subject: "Science", teacher: "Science Teacher", room: "Lab 02", tone: "green" }, P2: { subject: "Mathematics", teacher: "Math Teacher", room: "Room 12", tone: "blue" }, P3: { subject: "Free period", teacher: "Available", room: "—", tone: "slate" }, P4: { subject: "Break", teacher: "All students", room: "Canteen", tone: "slate" }, P5: { subject: "English", teacher: "English Teacher", room: "Room 08", tone: "amber" }, P6: { subject: "P.E.", teacher: "Physical Instructor", room: "Field", tone: "amber" }, P7: { subject: "Computer", teacher: "Computer Teacher", room: "Lab 01", tone: "green" } },
  Wednesday: { P1: { subject: "Urdu", teacher: "Urdu Teacher", room: "Room 08", tone: "amber" }, P2: { subject: "Science", teacher: "Science Teacher", room: "Lab 02", tone: "green" }, P3: { subject: "Mathematics", teacher: "Math Teacher", room: "Room 12", tone: "blue" }, P4: { subject: "Break", teacher: "All students", room: "Canteen", tone: "slate" }, P5: { subject: "Computer", teacher: "Computer Teacher", room: "Lab 01", tone: "green" }, P6: { subject: "English", teacher: "English Teacher", room: "Room 08", tone: "amber" }, P7: { subject: "Art & Design", teacher: "Arts Instructor", room: "Room 14", tone: "amber" } },
  Thursday: { P1: { subject: "Mathematics", teacher: "Math Teacher", room: "Room 12", tone: "blue" }, P2: { subject: "English", teacher: "English Teacher", room: "Room 08", tone: "amber" }, P3: { subject: "Science", teacher: "Science Teacher", room: "Lab 02", tone: "green" }, P4: { subject: "Break", teacher: "All students", room: "Canteen", tone: "slate" }, P5: { subject: "Urdu", teacher: "Urdu Teacher", room: "Room 08", tone: "amber" }, P6: { subject: "Islamiyat", teacher: "Islamiyat Teacher", room: "Room 05", tone: "blue" }, P7: { subject: "Computer", teacher: "Computer Teacher", room: "Lab 01", tone: "green" } },
  Friday: { P1: { subject: "English", teacher: "English Teacher", room: "Room 08", tone: "amber" }, P2: { subject: "Science", teacher: "Science Teacher", room: "Lab 02", tone: "green" }, P3: { subject: "Mathematics", teacher: "Math Teacher", room: "Room 12", tone: "blue" }, P4: { subject: "Jumma Break", teacher: "All students", room: "Prayer Hall", tone: "slate" }, P5: { subject: "Computer", teacher: "Computer Teacher", room: "Lab 01", tone: "green" }, P6: { subject: "P.E.", teacher: "Physical Instructor", room: "Field", tone: "amber" }, P7: { subject: "Library", teacher: "Librarian", room: "Library", tone: "slate" } },
  Saturday: { P1: { subject: "Mathematics", teacher: "Math Teacher", room: "Room 12", tone: "blue" }, P2: { subject: "Urdu", teacher: "Urdu Teacher", room: "Room 08", tone: "amber" }, P3: { subject: "Science", teacher: "Science Teacher", room: "Lab 02", tone: "green" }, P4: { subject: "Break", teacher: "All students", room: "Canteen", tone: "slate" }, P5: { subject: "English", teacher: "English Teacher", room: "Room 08", tone: "amber" }, P6: { subject: "Clubs", teacher: "Faculty", room: "Activity Hall", tone: "slate" }, P7: { subject: "Free period", teacher: "Available", room: "—", tone: "slate" } },
}

function SelectControl({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="schedule-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown aria-hidden="true" /></label>
}

export function TimetableScheduler() {
  const [classFilter, setClassFilter] = useState(classes[1])
  const [teacherFilter, setTeacherFilter] = useState(teachers[0])
  const [schedule, setSchedule] = useState(baseSchedule)
  const [editing, setEditing] = useState<{ day: Day; period: string } | null>(null)
  const [absent, setAbsent] = useState<string[]>([])
  const [assigned, setAssigned] = useState(false)
  const [sent, setSent] = useState(false)
  const [search, setSearch] = useState("")

  const visibleDays = useMemo(() => days.filter((day) => day.toLowerCase().includes(search.toLowerCase()) || search === ""), [search])
  const editingSlot = editing ? schedule[editing.day][editing.period] : null
  const saveSlot = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing) return
    const form = new FormData(event.currentTarget)
    setSchedule((current) => ({ ...current, [editing.day]: { ...current[editing.day], [editing.period]: { subject: String(form.get("subject")), teacher: String(form.get("teacher")), room: String(form.get("room")), tone: editingSlot?.tone ?? "green" } } }))
    setEditing(null)
  }

  return <section className="timetable-workspace" aria-label="Class timetable and substitution scheduler">
    {absent.length > 0 && (
      <div className="schedule-alert"><div className="schedule-alert-icon"><Bell aria-hidden="true" /></div><div><strong>Today&apos;s Absent Teachers</strong><span>{absent.join(" & ")}</span></div><button className="schedule-alert-close" onClick={() => setAbsent([])} aria-label="Dismiss absent teacher alert"><X aria-hidden="true" /></button></div>
    )}
    <div className="schedule-heading"><div><span className="eyebrow">ACADEMIC OPERATIONS</span><h2>Class Timetable &amp; Substitution Scheduler</h2><p>Plan every period, spot clashes, and cover absences before the first bell.</p></div><div className="schedule-heading-actions"><button className="admin-btn admin-btn-outline" onClick={() => window.print()}><Printer aria-hidden="true" /> Print Class Schedule</button><button className="admin-btn admin-btn-primary" onClick={() => { setSent(true); window.setTimeout(() => setSent(false), 2500) }}><MessageCircle aria-hidden="true" /> Send Teacher Schedule</button></div></div>
    <div className="schedule-filters"><div className="schedule-filter-group"><SelectControl label="VIEW BY CLASS" value={classFilter} options={classes} onChange={setClassFilter} /><SelectControl label="VIEW BY TEACHER" value={teacherFilter} options={teachers} onChange={setTeacherFilter} /></div><label className="schedule-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search day or room" aria-label="Search timetable" /></label></div>
    {sent && <div className="schedule-toast"><Check aria-hidden="true" /> Personal schedule prepared for WhatsApp sharing.</div>}
    <div className="timetable-scroll"><table className="timetable-grid"><thead><tr><th className="period-column">PERIOD / TIME</th>{visibleDays.map((day) => <th key={day}><span>{day.slice(0, 3).toUpperCase()}</span><b>{day}</b><small>6 periods</small></th>)}</tr></thead><tbody>{periods.map((period, index) => <tr key={period}><th className="period-column"><b>{period}</b><span>{times[index]}</span></th>{visibleDays.map((day) => { const slot = schedule[day][period]; const isBreak = slot.subject.toLowerCase().includes("break") || slot.subject.includes("Assembly"); return <td key={`${day}-${period}`}><button className={`slot-card slot-${slot.tone} ${isBreak ? "slot-break" : ""}`} onClick={() => setEditing({ day, period })} aria-label={`Edit ${day} ${period}, ${slot.subject}`}><span className="slot-title">{slot.subject}</span><span className="slot-teacher"><UserRound aria-hidden="true" /> {slot.teacher}</span><span className="slot-room">{slot.room}</span><Pencil aria-hidden="true" className="slot-edit" /></button></td> })}</tr>)}</tbody></table></div>
    <div className="schedule-footer"><span><GripVertical aria-hidden="true" /> Click any subject card to edit or reassign. Drag-and-drop ready.</span><span>Last updated just now · Academic Session 2026–27</span></div>
    {editing && editingSlot && <div className="admin-modal-backdrop" onClick={() => setEditing(null)}><form className="schedule-edit-modal" onSubmit={saveSlot} onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setEditing(null)} aria-label="Close edit dialog"><X aria-hidden="true" /></button><span className="eyebrow">EDIT SLOT · {editing.day.toUpperCase()} · {editing.period}</span><h3>Reassign timetable period</h3><p>Update the subject, teacher, or room. Changes are reflected across the weekly grid.</p><label>Subject<input name="subject" defaultValue={editingSlot.subject} required /></label><label>Teacher<select name="teacher" defaultValue={editingSlot.teacher}>{teachers.slice(1).map((teacher) => <option key={teacher}>{teacher}</option>)}</select></label><label>Room<input name="room" defaultValue={editingSlot.room} required /></label><div className="modal-actions"><button type="button" className="admin-btn admin-btn-outline" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="admin-btn admin-btn-primary"><Check aria-hidden="true" /> Save changes</button></div></form></div>}
  </section>
}
