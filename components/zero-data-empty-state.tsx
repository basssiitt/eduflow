'use client'

import React from 'react'
import { LucideIcon, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ZeroDataEmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  disabled?: boolean
  className?: string
}

export function ZeroDataEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  disabled = false,
  className,
}: ZeroDataEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-900/40 dark:to-slate-900/80 dark:border-slate-800 p-10 md:p-14 text-center shadow-xs transition-all duration-200',
        className
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-sky-100/60 dark:bg-sky-950/40 blur-xl" aria-hidden="true" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 shadow-xs ring-1 ring-sky-500/20">
          <Icon className="size-7" aria-hidden="true" />
        </div>
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              disabled={disabled}
              className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-200 font-semibold"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              disabled={disabled}
              className="border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-700 dark:border-slate-800 dark:text-slate-300"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
