import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const isValidHttpUrl = (val?: string): boolean => {
  if (!val) return false
  try {
    const parsed = new URL(val)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || !isValidHttpUrl(url)) {
    throw new Error(
      'Supabase server client configuration missing or invalid: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be valid HTTP/HTTPS credentials.'
    )
  }

  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {}
      },
    },
  })
}
