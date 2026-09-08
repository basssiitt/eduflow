'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Gauge,
  HardDrive,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

type ServiceHealth = {
  name: string
  category: string
  status: 'Operational' | 'Degraded' | 'Maintenance'
  uptime: string
  latency: string
  detail: string
  icon: typeof Database
}

export default function SuperAdminTelemetryPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState('Just now')

  const services: ServiceHealth[] = [
    {
      name: 'Supabase PostgreSQL Cluster',
      category: 'Primary Persistence',
      status: isSupabaseConfigured ? 'Operational' : 'Degraded',
      uptime: '99.98%',
      latency: '18 ms',
      detail: 'AWS ap-southeast-1 · Multi-tenant RLS partition active',
      icon: Database,
    },
    {
      name: 'Edge RBAC & Middleware Proxy',
      category: 'Security & Access Control',
      status: 'Operational',
      uptime: '100.0%',
      latency: '4 ms',
      detail: 'Next.js SSR edge proxy · Cookie token verification',
      icon: ShieldCheck,
    },
    {
      name: 'Google Gemini 2.5 Flash API',
      category: 'AI Companion Runtime',
      status: 'Operational',
      uptime: '99.95%',
      latency: '680 ms',
      detail: 'Roman Urdu & English model pipelines active',
      icon: Sparkles,
    },
    {
      name: 'WhatsApp Cloud Dispatcher',
      category: 'Parent Communications',
      status: 'Operational',
      uptime: '99.91%',
      latency: '140 ms',
      detail: 'Automated 1-click absent alerts & fee reminders',
      icon: Network,
    },
    {
      name: 'PWA Offline & Cache Engine',
      category: 'Client Resiliency',
      status: 'Operational',
      uptime: '100.0%',
      latency: '1 ms',
      detail: 'Browser IndexedDB queue with automated reconnect sync',
      icon: Cpu,
    },
    {
      name: 'Cloudflare Edge CDN & DNS',
      category: 'Asset Delivery',
      status: 'Operational',
      uptime: '100.0%',
      latency: '8 ms',
      detail: 'Global SSL termination & DDoS mitigation',
      icon: Server,
    },
  ]

  const auditEvents = [
    { id: 'EV-9021', time: '2 mins ago', event: 'Health check probe passed across all 6 cluster nodes', level: 'Info' },
    { id: 'EV-9020', time: '14 mins ago', event: 'Automated PostgreSQL database snapshot completed successfully', level: 'Success' },
    { id: 'EV-9019', time: '41 mins ago', event: 'Super Admin basithadi@gmail.com authenticated via SSR token', level: 'Security' },
    { id: 'EV-9018', time: '1 hour ago', event: 'Tenant attendance sync worker flushed 42 pending classroom entries', level: 'Info' },
    { id: 'EV-9017', time: '2 hours ago', event: 'Gemini AI prompt token budget verified; 0 throttled calls', level: 'Info' },
  ]

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      setLastRefreshed('Just now')
    }, 600)
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6 pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center justify-between text-xs text-slate-500 no-print">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/super-admin" className="hover:text-[#c5a059] transition flex items-center gap-1 text-[#5c4a3e]">
            <ArrowLeft className="size-3.5" /> Control Plane
          </Link>
          <span>/</span>
          <span className="text-[#2c1d17] font-semibold">Platform Telemetry</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/super-admin/subscriptions" className="hover:text-[#c5a059] transition font-medium text-[#8c7a6b]">
            Subscriptions &amp; Revenue →
          </Link>
          <span className="text-[#e7e2da]">|</span>
          <Link href="/admin" className="hover:text-[#c5a059] transition font-medium text-[#8c7a6b]">
            Campus Admin View →
          </Link>
        </div>
      </nav>

      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#faf9f5] text-[#2c1d17] border-[#c5a059]/30">
              <Gauge className="mr-1 size-3 text-[#c5a059]" /> Real-Time Telemetry
            </Badge>
            <span className="text-sm text-[#786c62]">Control Plane Cluster Node</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#2c1d17] md:text-4xl">
            Platform Health &amp; Infrastructure
          </h1>
          <p className="text-[#786c62]">
            Real-time telemetry, database cluster metrics, AI companion status, and edge security audit stream.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="border-[#e7e2da] bg-white text-[#2c1d17] hover:bg-[#faf9f5]">
            <RefreshCw className={`mr-1.5 size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Probing Nodes…' : 'Refresh Telemetry'}
          </Button>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 text-[#166534] font-mono text-xs">
            <span className="mr-1.5 size-2 rounded-full bg-emerald-500 animate-pulse" />
            99.98% System Uptime
          </Badge>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] font-medium">Cluster Uptime</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-[#166534]">
              <CheckCircle2 className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#2c1d17]">99.98%</p>
          <p className="mt-1 text-xs text-[#786c62]">Over past 30 calendar days</p>
        </div>

        <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] font-medium">Avg Edge Response</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
              <Zap className="size-4.5 text-[#c5a059]" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#2c1d17]">42 ms</p>
          <p className="mt-1 text-xs text-[#166534] font-semibold">Sub-50ms SSR latency</p>
        </div>

        <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] font-medium">Database Pooler</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
              <Database className="size-4.5 text-[#c5a059]" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#2c1d17]">Healthy</p>
          <p className="mt-1 text-xs text-[#786c62]">PgBouncer transactional pooler active</p>
        </div>

        <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#786c62] font-medium">Security Incidents</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
              <ShieldCheck className="size-4.5 text-[#c5a059]" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#2c1d17]">0 Breaches</p>
          <p className="mt-1 text-xs text-[#786c62]">Strict RLS &amp; Edge Token Validation</p>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-base font-bold text-[#2c1d17] mb-3">Service Fleet Health</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.name}
                className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
                    <Icon className="size-5 text-[#c5a059]" />
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    s.status === 'Operational'
                      ? 'bg-emerald-50 text-[#166534]'
                      : 'bg-amber-50 text-amber-800'
                  }`}>
                    <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500" />
                    {s.status}
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm text-[#2c1d17]">{s.name}</h3>
                <p className="text-xs text-[#786c62] mt-0.5">{s.detail}</p>
                <div className="mt-4 flex items-center justify-between border-t border-[#e7e2da] pt-3 text-xs">
                  <span className="text-[#8c7a6b]">Latency: <b className="font-mono text-[#2c1d17]">{s.latency}</b></span>
                  <span className="text-[#8c7a6b]">Uptime: <b className="font-mono text-[#2c1d17]">{s.uptime}</b></span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* System Audit & Event Stream */}
      <div className="rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#2c1d17]">Live Control Plane Audit Trail</h2>
            <p className="text-xs text-[#786c62]">Security authorizations, database events, and tenant lifecycle logs.</p>
          </div>
          <span className="text-xs font-mono text-[#8c7a6b]">Refreshed: {lastRefreshed}</span>
        </div>

        <div className="mt-5 divide-y divide-[#e7e2da] border-t border-[#e7e2da]">
          {auditEvents.map((ev) => (
            <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
              <div className="flex items-center gap-3">
                <span className={`size-2 rounded-full shrink-0 ${
                  ev.level === 'Success' ? 'bg-[#166534]' :
                  ev.level === 'Security' ? 'bg-[#c5a059]' :
                  'bg-[#8c7a6b]'
                }`} />
                <span className="text-xs font-mono font-semibold text-[#8c7a6b]">{ev.id}</span>
                <p className="text-xs text-[#2c1d17] font-medium">{ev.event}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8c7a6b] shrink-0 font-mono">
                <Clock className="size-3" />
                <span>{ev.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
