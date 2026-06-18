import { NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Admin access required' }, { status: 403 })
  }
  const totals = await queryOne<{ users: number; games: number; pending_wd: number; revenue: number; bets: number }>(
    `SELECT
       (SELECT COUNT(*) FROM users) as users,
       (SELECT COUNT(*) FROM games) as games,
       (SELECT COUNT(*) FROM transactions WHERE type = 'withdrawal' AND status = 'pending') as pending_wd,
       (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit' AND status = 'completed') as revenue,
       (SELECT COUNT(*) FROM bets) as bets`
  )
  const recentTx = await queryMany(
    `SELECT t.*, u.username FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT 10`
  )
  return NextResponse.json<ApiResponse>({ ok: true, data: { totals, recentTx } })
}
