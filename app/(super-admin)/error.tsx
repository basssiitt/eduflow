'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Super Admin Error:', error)
  }, [error])

  return (
    <div className="p-6 md:p-10 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-6 sm:p-8 shadow-lg text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mb-4">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Owner Telemetry &amp; Database Error
        </h2>
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
          {error.message || 'Unable to communicate with the master SaaS tenancy database. Please check Supabase credentials or retry.'}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-xs"
          >
            <RefreshCw className="size-3.5" /> Retry
          </Button>
          <Link
            href="/super-admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ShieldCheck className="size-3.5" /> Super Admin Console
          </Link>
        </div>
      </div>
    </div>
  )
}
