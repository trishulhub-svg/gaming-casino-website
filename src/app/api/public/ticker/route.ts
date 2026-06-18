import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { ApiResponse } from '@/lib/types'

// Public: recent wins ticker
export async function GET() {
  const rows = await queryMany<{ id: number; amount: number; notes: string | null; created_at: string; username?: string }>(
    `SELECT t.id, t.amount, t.notes, t.created_at, u.username
     FROM transactions t
     JOIN users u ON t.user_id = u.id
     WHERE t.type = 'win' AND t.status = 'completed'
     ORDER BY t.created_at DESC
     LIMIT 30`
  )
  // Mask usernames for public ticker
  const masked = rows.map(r => ({
    ...r,
    username: r.username ? (r.username.slice(0, 2) + '***' + r.username.slice(-1)) : 'Anon',
  }))
  return NextResponse.json<ApiResponse>({ ok: true, data: masked })
}
