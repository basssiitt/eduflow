'use client'

import React from 'react'

export function AcademicCrest({ className = 'size-8', size }: { className?: string; size?: number }) {
  const customStyle = size ? { width: size, height: size } : undefined
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-white font-black shadow-xs select-none ${className}`}
      style={customStyle}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-3/5"
      >
        <path d="M4 4h16v3H8v5h10v3H8v5h12v3H4V4z" />
      </svg>
    </div>
  )
}

export function EduFlowBrandMark({
  size = 'md',
  showTagline = true,
  theme = 'dark',
}: {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  theme?: 'dark' | 'light'
}) {
  const iconSize = size === 'sm' ? 'size-7' : size === 'lg' ? 'size-10' : 'size-8'
  const titleSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="shrink-0 flex items-center justify-center drop-shadow-xs">
        <AcademicCrest className={iconSize} />
      </div>
      <div className="min-w-0 flex flex-col leading-tight">
        <span className={`font-black tracking-tight ${titleSize} ${theme === 'light' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          EduFlow
        </span>
        {showTagline && (
          <span className={`text-[10px] font-semibold tracking-wider uppercase ${theme === 'light' ? 'text-blue-200' : 'text-slate-500'}`}>
            Educational System
          </span>
        )}
      </div>
    </div>
  )
}
