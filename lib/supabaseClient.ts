import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtchdghzlkiemwtzyduo.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_KmiVb1kw1LiOskGkpDkLpw_gapmgN09'

const isValidHttpUrl = (val?: string): boolean => {
  if (!val) return false
  try {
    const parsed = new URL(val)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const isSupabaseConfigured = Boolean(url && key && isValidHttpUrl(url))

export const supabaseClient: SupabaseClient | null = isSupabaseConfigured
  ? createBrowserClient(url!, key!)
  : null

export function isBackendError(error: unknown) {
  return error instanceof Error ? error.message : Boolean(error)
}
