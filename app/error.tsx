'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('EduFlow Global Error Boundary caught exception:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 sm:p-8 shadow-xl text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-xs">
          <AlertTriangle className="size-7" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-slate-900">
          Database or Service Error
        </h1>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          {error.message || 'An unexpected error occurred while communicating with the database. Please verify your connection or try again.'}
        </p>
        {error.digest && (
          <p className="mt-2 text-[10px] font-mono text-slate-400">
            Digest: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 shadow-xs transition"
          >
            <RefreshCcw className="size-3.5" /> Retry Request
          </Button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl px-4 py-2.5 transition"
          >
            <Home className="size-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
