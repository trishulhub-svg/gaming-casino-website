import { NextRequest, NextResponse } from 'next/server'
import { execute, queryOne } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const { bonus_id } = (await req.json()) as { bonus_id: number }
    const bonus = await queryOne<{ id: number; bonus_amount: number; is_active: number }>('SELECT * FROM bonuses WHERE id = ? AND is_active = 1', [bonus_id])
    if (!bonus) return NextResponse.json<ApiResponse>({ ok: false, error: 'Bonus not available' }, { status: 404 })

    const existing = await queryOne('SELECT id FROM user_bonuses WHERE user_id = ? AND bonus_id = ?', [user.id, bonus_id])
    if (existing) return NextResponse.json<ApiResponse>({ ok: false, error: 'Already claimed' }, { status: 400 })

    await execute('INSERT INTO user_bonuses (user_id, bonus_id, claimed_at, wagering_completed, is_completed) VALUES (?, ?, CURRENT_TIMESTAMP, 0, 0)', [user.id, bonus_id])
    await execute('UPDATE users SET balance = balance + ? WHERE id = ?', [bonus.bonus_amount, user.id])
    await execute(
      "INSERT INTO transactions (user_id, type, amount, status, payment_method, notes, created_at) VALUES (?, 'bonus', ?, 'completed', 'BONUS', ?, CURRENT_TIMESTAMP)",
      [user.id, bonus.bonus_amount, `Bonus claimed: ${bonus_id}`]
    )
    const updated = await queryOne<{ balance: number }>('SELECT balance FROM users WHERE id = ?', [user.id])
    return NextResponse.json<ApiResponse>({ ok: true, data: { balance: updated?.balance ?? user.balance } })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
