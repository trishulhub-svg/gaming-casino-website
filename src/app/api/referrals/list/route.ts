import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const refs = await queryMany<{ id: number; referred_id: number; username: string; commission_earned: number; created_at: string; is_active: number }>(
    `SELECT r.id, r.referred_id, u.username, r.commission_earned, r.created_at, u.is_active
     FROM referrals r
     JOIN users u ON r.referred_id = u.id
     WHERE r.referrer_id = ?
     ORDER BY r.created_at DESC`,
    [user.id]
  )
  return NextResponse.json<ApiResponse>({ ok: true, data: refs })
}
