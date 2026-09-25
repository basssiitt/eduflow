import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isValidHttpUrl = (val?: string): boolean => {
  if (!val) return false
  try {
    const parsed = new URL(val)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const isSupabaseConfigured: boolean = Boolean(url && key && isValidHttpUrl(url))

let browserClientInstance: SupabaseClient | null = null

export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured || !url || !key) {
    return null
  }
  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient(url, key)
  }
  return browserClientInstance
}

export const supabaseClient: SupabaseClient | null = isSupabaseConfigured && url && key
  ? createClient()
  : null

export function isBackendError(error: unknown) {
  return error instanceof Error ? error.message : Boolean(error)
}
