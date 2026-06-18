import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const stats = await queryOne<{ total_bets: number; total_wagered: number; total_won: number; wins: number; losses: number }>(
    `SELECT
       COUNT(*) as total_bets,
       COALESCE(SUM(bet_amount), 0) as total_wagered,
       COALESCE(SUM(win_amount), 0) as total_won,
       SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
       SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses
     FROM bets WHERE user_id = ?`,
    [user.id]
  )
  return NextResponse.json<ApiResponse>({
    ok: true,
    data: stats || { total_bets: 0, total_wagered: 0, total_won: 0, wins: 0, losses: 0 },
  })
}
