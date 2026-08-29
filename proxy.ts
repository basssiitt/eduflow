import { updateSession } from '@/lib/supabase/proxy'
import type { NextRequest } from 'next/server'
export async function proxy(request: NextRequest) { return updateSession(request) }
export const config = { matcher: ['/admin/:path*', '/teacher/:path*', '/parent/:path*', '/super-admin/:path*'] }
