'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertOctagon, ArrowRight, Eye, ShieldAlert, Sparkles, Terminal, UserX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function GodModeBar() {
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [impersonatedRole, setImpersonatedRole] = useState('')
  const [campusName, setCampusName] = useState('')

  useEffect(() => {
    const checkGodMode = () => {
      if (typeof window === 'undefined') return
      const isGod = sessionStorage.getItem('eduflow-god-mode') === 'true' ||
        document.cookie.includes('eduflow-god-mode=true')
      const role = sessionStorage.getItem('eduflow-god-role') || 'School Admin'
      const campus = sessionStorage.getItem('eduflow-god-campus') || 'All Campuses (Root)'
      setActive(isGod)
      setImpersonatedRole(role)
      setCampusName(campus)
    }

    checkGodMode()
    window.addEventListener('storage', checkGodMode)
    return () => window.removeEventListener('storage', checkGodMode)
  }, [])

  if (!active) return null

  const exitGodMode = () => {
    sessionStorage.removeItem('eduflow-god-mode')
    sessionStorage.removeItem('eduflow-god-role')
    sessionStorage.removeItem('eduflow-god-campus')
    document.cookie = 'eduflow-god-mode=; path=/; max-age=0'
    document.cookie = 'eduflow-demo-role=; path=/; max-age=0'
    router.push('/super-admin')
  }

  const switchContext = (role: string, targetPath: string) => {
    sessionStorage.setItem('eduflow-god-role', role)
    document.cookie = `eduflow-demo-role=${role.toLowerCase().replace(' ', '_')}; path=/; max-age=86400`
    router.push(targetPath)
  }

  return (
    <div
      role="region"
      aria-label="Super Admin God Mode Banner"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/40 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md no-print"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-lg bg-slate-950 text-amber-400 shadow-xs">
          ⚡
        </span>
        <span className="tracking-wide uppercase text-[11px] font-black">
          GOD MODE (ROOT ACCESS)
        </span>
        <span className="hidden md:inline text-amber-950 font-medium">|</span>
        <span className="hidden md:inline font-semibold">
          Acting as <span className="underline decoration-slate-950/40">{impersonatedRole}</span> ({campusName})
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-black text-amber-950 hidden sm:inline mr-1">Switch:</span>
        <button
          onClick={() => switchContext('School Admin', '/admin')}
          className="rounded-lg bg-slate-950/20 px-2 py-1 text-[11px] font-bold text-slate-950 hover:bg-slate-950/30 transition"
        >
          Admin
        </button>
        <button
          onClick={() => switchContext('Teacher', '/teacher')}
          className="rounded-lg bg-slate-950/20 px-2 py-1 text-[11px] font-bold text-slate-950 hover:bg-slate-950/30 transition"
        >
          Teacher
        </button>
        <button
          onClick={() => switchContext('Parent', '/parent')}
          className="rounded-lg bg-slate-950/20 px-2 py-1 text-[11px] font-bold text-slate-950 hover:bg-slate-950/30 transition"
        >
          Parent
        </button>
        <Button
          size="sm"
          onClick={exitGodMode}
          className="ml-2 h-7 bg-slate-950 text-amber-400 hover:bg-slate-900 rounded-lg text-xs font-bold shadow-xs"
        >
          Exit God Mode
        </Button>
      </div>
    </div>
  )
}
