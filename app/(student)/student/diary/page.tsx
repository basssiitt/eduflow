'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  Pause,
  Play,
  Volume2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ZeroDataEmptyState } from '@/components/zero-data-empty-state'
import { DashboardSkeleton } from '@/components/skeleton-cards'
import { fetchCurrentStudentData } from '@/lib/live-data'

export default function StudentDiaryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentStudentData().then(({ data: resData }) => {
      if (resData) setData(resData)
      setLoading(false)
    })
  }, [])

  if (loading) return <DashboardSkeleton />

  const diaries = data?.diaries ?? []

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/student" className="hover:text-[#2c1d17] transition flex items-center gap-1 text-slate-600">
            <ArrowLeft className="size-3.5" /> Student Workspace
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Homework &amp; Voice Diaries</span>
        </div>
      </nav>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Daily Class Diaries
        </h1>
        <p className="text-slate-500">
          Listen to teacher voice instructions and read daily homework assignments.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {diaries.length > 0 ? (
          diaries.map((item: any, idx: number) => (
            <article
              key={item.id || idx}
              className="rounded-2xl border border-[#e7e2da] bg-white p-6 shadow-xs"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e7e2da] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#faf9f5] text-[#2c1d17] border border-[#e7e2da]">
                    <Headphones className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Class Daily Instruction
                    </h2>
                    <time className="text-xs text-slate-400">
                      Posted {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today'}
                    </time>
                  </div>
                </div>

                {item.audio_url && (
                  <Button
                    onClick={() => setPlayingId(playingId === item.id ? null : item.id)}
                    className="gap-2 bg-[#2c1d17] hover:bg-[#1e130f] text-white font-semibold shadow-xs"
                  >
                    {playingId === item.id ? <Pause className="size-4" /> : <Play className="size-4" />}
                    <span>{playingId === item.id ? 'Pause Voice Note' : 'Play Voice Recording'}</span>
                  </Button>
                )}
              </div>

              <div className="pt-4">
                <p className="text-sm leading-relaxed text-slate-700">
                  {item.note || 'No written homework text provided.'}
                </p>
              </div>
            </article>
          ))
        ) : (
          <ZeroDataEmptyState
            icon={BookOpen}
            title="No class diaries recorded yet"
            description="When your classroom teacher posts today's audio note or homework diary, it will appear here."
          />
        )}
      </div>
    </div>
  )
}
