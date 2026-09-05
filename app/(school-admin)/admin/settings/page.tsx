'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Bell, Building2, Check, Globe, Lock, Mail, Phone, Save, ShieldCheck } from 'lucide-react'

export default function AdminSettingsPage() {
  const [campusName, setCampusName] = useState('Greenfield International School')
  const [campusCode, setCampusCode] = useState('GIS-LHR-01')
  const [phone, setPhone] = useState('+92 300 1234567')
  const [email, setEmail] = useState('admin@greenfield.edu.pk')
  const [address, setAddress] = useState('Plot 42-B, Sector G, Phase 5, DHA, Lahore')
  const [lang, setLang] = useState<'en' | 'ur'>('en')
  const [notifications, setNotifications] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:text-emerald-600 transition flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="size-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Campus Settings</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/admin/billing" className="hover:text-emerald-600 transition font-medium text-slate-500">
            Billing &amp; Plan →
          </Link>
        </div>
      </nav>

      <div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20">
            Campus Configuration
          </Badge>
          <span className="text-sm text-slate-500 dark:text-slate-400">Academic Session 2026–2027</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Campus Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage school profile, branch metadata, WhatsApp alerts, and localization.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Building2 className="size-5 text-emerald-600" />
            <span>School Identity &amp; Profile</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">This information appears on fee challans, report cards, and parent receipts.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
              Institution Name
              <Input
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                required
                className="rounded-xl text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Campus Code
              <Input
                value={campusCode}
                onChange={(e) => setCampusCode(e.target.value)}
                required
                className="rounded-xl text-sm font-mono"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Official Contact Phone
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-xl text-sm font-mono"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
              Administrative Email
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
              Physical Campus Address
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="rounded-xl text-sm"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Bell className="size-5 text-emerald-600" />
            <span>Parent Broadcast &amp; Notifications</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Configure automated dispatch of student haziri and fee invoice alerts.</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold">Daily Attendance Absent Alerts</p>
                <p className="text-xs text-muted-foreground">Instantly dispatch notification to parents when student is marked absent.</p>
              </div>
              <Button
                type="button"
                variant={notifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(!notifications)}
                className={notifications ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              >
                {notifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold">Fee Challan Reminder Broadcast</p>
                <p className="text-xs text-muted-foreground">Send payment reminder on the 5th and 10th of every calendar month.</p>
              </div>
              <Button
                type="button"
                variant={smsAlerts ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={smsAlerts ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              >
                {smsAlerts ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold">Language Preference / زبان</p>
                <p className="text-xs text-muted-foreground">Switch default portal interface language.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
              >
                <Globe className="mr-1.5 size-3.5" />
                {lang === 'en' ? 'اردو' : 'English'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6">
            {saved ? <Check className="mr-2 size-4" /> : <Save className="mr-2 size-4" />}
            {saved ? 'Settings Saved' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
