import { NextResponse } from 'next/server'
import { getStats } from '@/lib/agentfix-store'

// Public health endpoint — used for uptime monitoring (e.g. UptimeRobot, Vercel checks)
export async function GET() {
  const stats = getStats()
  return NextResponse.json({
    status: 'ok',
    service: 'TrishulCasino',
    timestamp: new Date().toISOString(),
    agentfix: {
      totalEvents: stats.totalEvents,
      errorCount: stats.errorCount,
      activeSessions: stats.totalSessions,
    },
  })
}
