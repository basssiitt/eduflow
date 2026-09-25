'use client'

import { useEffect } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  itemName?: string
  itemDetails?: string
  confirmText?: string
  loading?: boolean
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Removal',
  message = 'Are you sure you want to remove this faculty member / student? This action will archive their attendance records and revoke portal access.',
  itemName,
  itemDetails,
  confirmText = 'Yes, Remove',
  loading = false,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, loading])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <Trash2 className="size-5" />
          </div>
          <div>
            <h3
              id="confirm-delete-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {title}
            </h3>
            <p className="text-xs text-slate-500">Destructive operation requires confirmation</p>
          </div>
        </div>

        {itemName && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {itemName}
            </p>
            {itemDetails && (
              <p className="mt-0.5 text-xs text-slate-500">
                {itemDetails}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertTriangle className="size-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <p className="leading-relaxed">
            {message}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-rose-600 font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-95"
          >
            {loading ? 'Removing…' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
