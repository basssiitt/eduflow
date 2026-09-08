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
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e7e2da] bg-[#faf9f5] p-10 md:p-14 text-center shadow-xs transition-all duration-200',
        className
      )}
    >
      <div className="relative flex size-14 items-center justify-center rounded-2xl bg-[#2c1d17]/5 text-[#2c1d17] border border-[#e7e2da]">
        <Icon className="size-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-[#2c1d17]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-stone-500 leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              disabled={disabled}
              className="bg-[#2c1d17] hover:bg-[#1e130f] text-white shadow-xs font-semibold"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              disabled={disabled}
              className="border-[#e7e2da] bg-white text-[#2c1d17] hover:bg-[#faf9f5] hover:border-[#c5a059]"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
