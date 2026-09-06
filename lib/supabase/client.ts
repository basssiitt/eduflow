import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

export const defaultSupabaseUrl = 'https://mtchdghzlkiemwtzyduo.supabase.co'
export const defaultSupabaseAnonKey = 'sb_publishable_KmiVb1kw1LiOskGkpDkLpw_gapmgN09'

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey
  return createBrowserClient(url, key)
}

export const supabaseClient = createClient()
export const isSupabaseConfigured = true
