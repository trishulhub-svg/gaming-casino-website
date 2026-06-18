import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const stats = await queryOne<{ total_referrals: number; total_commission: number; active_referrals: number }>(
    `SELECT
       COUNT(*) as total_referrals,
       COALESCE(SUM(commission_earned), 0) as total_commission,
       SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END) as active_referrals
     FROM referrals r
     LEFT JOIN users u ON r.referred_id = u.id
     WHERE r.referrer_id = ?`,
    [user.id]
  )
  return NextResponse.json<ApiResponse>({
    ok: true,
    data: {
      referral_code: user.referral_code,
      total_referrals: stats?.total_referrals ?? 0,
      total_commission: stats?.total_commission ?? 0,
      active_referrals: stats?.active_referrals ?? 0,
    },
  })
}
