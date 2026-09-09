'use client'

import React from 'react'

export function AcademicCrest({ className = 'size-8', size }: { className?: string; size?: number }) {
  const customStyle = size ? { width: size, height: size } : undefined
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-xs select-none ${className}`}
      style={customStyle}
      aria-hidden="true"
    >
      <span className="font-black text-[65%] leading-none tracking-normal">E</span>
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
