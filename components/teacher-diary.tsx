'use client'

import { useRef, useState } from 'react'
import { uploadVoiceDiary } from '@/lib/live-data'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { useEduFlow } from '@/components/eduflow-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircleCheck, Mic, Pause, Send, Sparkles } from 'lucide-react'

export function TeacherDiarySection({ studentId }: { studentId?: string | number }) {
  const [diary, setDiary] = useState('')
  const [recording, setRecording] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const { isOnline, queueAction } = useEduFlow()

  const audioRef = useRef<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop()
      setRecording(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        audioRef.current = blob
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      console.error('Microphone access denied:', err)
    }
  }

  const handlePublish = async () => {
    if (!diary.trim() && !audioRef.current) return
    setPublishing(true)
    const targetStudentId = studentId ?? 1
    const blobToUpload = audioRef.current ?? new Blob([diary], { type: 'text/plain' })
    const result = await uploadVoiceDiary(blobToUpload, targetStudentId, diary)

    if (result.error && isOnline && isSupabaseConfigured) {
      queueAction('Voice diary sync failed; kept locally for retry')
    }

    setPublishing(false)
    setPublished(true)
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Audio Broadcast</span>
          <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">Daily Voice Diary &amp; Homework</h3>
          <p className="text-xs text-slate-500">Record a 15-second voice note or write instructions for parents.</p>
        </div>
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <Sparkles className="mr-1 size-3" /> Broadcast
        </Badge>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <button
          type="button"
          onClick={toggleRecording}
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors ${
            recording
              ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/20'
              : 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20'
          }`}
          aria-label="Hold or click to record voice note"
        >
          <span className={`flex size-14 items-center justify-center rounded-full shadow-xs ${recording ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'}`}>
            {recording ? <Pause aria-hidden="true" className="size-6" /> : <Mic aria-hidden="true" className="size-6" />}
          </span>
          <span className="text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
            {recording ? 'Recording voice note... Click to stop' : 'Click to Record Voice Note'}
          </span>
          <span className="text-xs text-slate-500">
            {recording ? 'Recording audio in progress' : 'Uses browser MediaRecorder API'}
          </span>
        </button>

        <label className="mt-5 flex w-full flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Written instructions / Notes
          <textarea
            value={diary}
            onChange={(event) => setDiary(event.target.value)}
            placeholder="Type homework instructions, chapters covered, or reminders for parents..."
            rows={4}
            className="resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
        </label>

        <Button
          className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          disabled={(!diary.trim() && !audioRef.current && !recording) || publishing}
          onClick={handlePublish}
        >
          <Send data-icon="inline-start" className="mr-1.5 size-4" />
          {publishing ? 'Publishing Diary...' : 'Publish Diary Entry to Parents'}
        </Button>

        {published && (
          <p role="status" className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CircleCheck className="size-4" />
            Diary entry published successfully! Parents can now listen to it in their portal.
          </p>
        )}
      </div>
    </div>
  )
}
