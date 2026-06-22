import { NextResponse } from 'next/server'
import { getStats, getSessions } from '@/lib/agentfix-store'

// Admin endpoint — returns summary stats + active sessions
export async function GET() {
  return NextResponse.json({
    ok: true,
    stats: getStats(),
    sessions: getSessions().slice(0, 50),
  })
}
