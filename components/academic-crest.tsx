'use client'

import React from 'react'

export function AcademicCrest({ className = 'size-8' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Shield with Espresso Fill & Hairline Gold Border */}
      <path
        d="M18 2.5L5.5 6.8V17.2C5.5 24.8 10.8 31.8 18 33.5C25.2 31.8 30.5 24.8 30.5 17.2V6.8L18 2.5Z"
        fill="#2c1d17"
        stroke="#c5a059"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Inner Inset Shield Border */}
      <path
        d="M18 4.8L7.5 8.4V16.8C7.5 23.2 12 29.2 18 30.8C24 29.2 28.5 23.2 28.5 16.8V8.4L18 4.8Z"
        stroke="#c5a059"
        strokeWidth="0.75"
        strokeOpacity="0.5"
        strokeLinejoin="round"
      />
      {/* Academic Open Book Motif in Rich Gold */}
      <path
        d="M18 20.8C16.2 19.5 13.5 19.2 11.2 19.2V11.5C13.5 11.5 16.2 11.8 18 13.1C19.8 11.8 22.5 11.5 24.8 11.5V19.2C22.5 19.2 19.8 19.5 18 20.8Z"
        stroke="#c5a059"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 13.1V20.8"
        stroke="#c5a059"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Heraldic 4-Point Academic Star at Top */}
      <path
        d="M18 7.5L18.7 9.1L20.3 9.8L18.7 10.5L18 12.1L17.3 10.5L15.7 9.8L17.3 9.1L18 7.5Z"
        fill="#c5a059"
      />
    </svg>
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
        <span className={`font-black tracking-tight ${titleSize} ${theme === 'light' ? 'text-white' : 'text-[#1e1b18]'}`}>
          EduFlow <span className="font-extrabold text-[#c5a059]">OS</span>
        </span>
        {showTagline && (
          <span className={`text-[10px] font-semibold tracking-wider uppercase ${theme === 'light' ? 'text-[#c5a059]' : 'text-[#786c62]'}`}>
            Institutional Edition
          </span>
        )}
      </div>
    </div>
  )
}
