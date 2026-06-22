import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/agentfix-store'

// Admin endpoint — returns recent events. Protected by middleware (admin role).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || undefined
  const session = searchParams.get('session') || undefined
  const limit = Math.min(Number(searchParams.get('limit') || '100'), 500)

  const events = getEvents({ type, session, limit })
  return NextResponse.json({ ok: true, count: events.length, events })
}
