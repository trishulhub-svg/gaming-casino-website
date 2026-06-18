import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { ApiResponse } from '@/lib/types'

// Public: today's top winners
export async function GET() {
  const rows = await queryMany<{ user_id: number; username: string; total_won: number }>(
    `SELECT t.user_id, u.username, SUM(t.amount) as total_won
     FROM transactions t
     JOIN users u ON t.user_id = u.id
     WHERE t.type = 'win' AND t.status = 'completed'
       AND date(t.created_at) = date('now')
     GROUP BY t.user_id
     ORDER BY total_won DESC
     LIMIT 10`
  )
  const masked = rows.map((r, i) => ({
    rank: i + 1,
    user_id: r.user_id,
    username: r.username ? (r.username.slice(0, 2) + '***' + r.username.slice(-1)) : 'Anon',
    total_won: r.total_won,
  }))
  return NextResponse.json<ApiResponse>({ ok: true, data: masked })
}
