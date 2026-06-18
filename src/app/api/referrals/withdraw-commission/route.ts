import { NextRequest, NextResponse } from 'next/server'
import { execute, queryOne } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const { amount } = (await req.json()) as { amount: number }
    const stats = await queryOne<{ total_commission: number }>(
      'SELECT COALESCE(SUM(commission_earned), 0) as total_commission FROM referrals WHERE referrer_id = ?',
      [user.id]
    )
    const commission = stats?.total_commission ?? 0
    if (!amount || amount <= 0 || amount > commission) {
      return NextResponse.json<ApiResponse>({ ok: false, error: 'Invalid amount' }, { status: 400 })
    }
    await execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, user.id])
    await execute(
      "INSERT INTO transactions (user_id, type, amount, status, payment_method, notes, created_at) VALUES (?, 'referral', ?, 'completed', 'SYSTEM', 'Referral commission withdrawal', CURRENT_TIMESTAMP)",
      [user.id, amount]
    )
    const updated = await queryOne<{ balance: number }>('SELECT balance FROM users WHERE id = ?', [user.id])
    return NextResponse.json<ApiResponse>({ ok: true, data: { balance: updated?.balance ?? user.balance } })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
