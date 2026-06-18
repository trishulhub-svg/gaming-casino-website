import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse, Bet } from '@/lib/types'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const bets = await queryMany<Bet & { game_name?: string }>(
    'SELECT b.*, g.name as game_name FROM bets b LEFT JOIN games g ON b.game_id = g.id WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 100',
    [user.id]
  )
  return NextResponse.json<ApiResponse<Bet[]>>({ ok: true, data: bets })
}
