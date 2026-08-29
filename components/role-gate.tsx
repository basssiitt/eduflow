'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'

export function RoleGate({ role, children }: { role: 'super-admin' | 'school-admin' | 'teacher' | 'parent'; children: React.ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(!isSupabaseConfigured)
  useEffect(() => { if (!isSupabaseConfigured || !supabaseClient) return; supabaseClient.auth.getUser().then(({ data }) => { const userRole = data.user?.app_metadata?.role ?? data.user?.user_metadata?.role; if (userRole && userRole !== role && !(role === 'school-admin' && userRole === 'admin')) router.replace('/login'); else setAllowed(Boolean(data.user)) }) }, [role, router])
  if (!allowed) return <main className="min-h-screen grid place-items-center bg-background"><p className="text-sm text-muted-foreground">Checking workspace access…</p></main>
  return children
}
