import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse, UserBonus } from '@/lib/types'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const bonuses = await queryMany<UserBonus & { name?: string; bonus_amount?: number; wagering_requirement?: number }>(
    `SELECT ub.*, b.name, b.bonus_amount, b.wagering_requirement
     FROM user_bonuses ub
     JOIN bonuses b ON ub.bonus_id = b.id
     WHERE ub.user_id = ? AND ub.is_completed = 0
     ORDER BY ub.claimed_at DESC`,
    [user.id]
  )
  return NextResponse.json<ApiResponse<UserBonus[]>>({ ok: true, data: bonuses })
}
