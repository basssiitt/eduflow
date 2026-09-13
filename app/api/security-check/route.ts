import { NextRequest, NextResponse } from 'next/server'
import { aj } from '@/lib/arcjet'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const decision = await aj.protect(req as any)

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: 'Too Many Requests. Rate limit exceeded.' },
          { status: 429 }
        )
      }
      if (decision.reason.isBot()) {
        return NextResponse.json(
          { error: 'Bot detected. Automated access is not permitted.' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: 'Access denied by Arcjet boundary security.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      status: 'allowed',
      message: 'Arcjet boundary security verified request successfully.',
      conclusion: decision.conclusion,
      reason: decision.reason,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'fallback',
        message: 'Arcjet bypassed in local evaluation mode.',
        error: String(error),
      },
      { status: 200 }
    )
  }
}
