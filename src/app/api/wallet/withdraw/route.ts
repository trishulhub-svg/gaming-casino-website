import { NextRequest, NextResponse } from 'next/server'
import { execute, queryOne } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

const METHODS = [
  { id: 'upi', name: 'UPI', min: 200, max: 50000, fee: 0, eta: '5-30 min' },
  { id: 'bank', name: 'Bank Transfer (IMPS/NEFT)', min: 500, max: 500000, fee: 0, eta: '1-24 hours' },
  { id: 'usdt', name: 'USDT (TRC20)', min: 500, max: 1000000, fee: 0, eta: '15-60 min' },
]

export async function GET() {
  return NextResponse.json<ApiResponse>({ ok: true, data: METHODS })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const { amount, method, account } = (await req.json()) as { amount: number; method: string; account?: string }
    if (!amount || amount <= 0) return NextResponse.json<ApiResponse>({ ok: false, error: 'Invalid amount' }, { status: 400 })
    const m = METHODS.find(x => x.id === method)
    if (!m) return NextResponse.json<ApiResponse>({ ok: false, error: 'Invalid method' }, { status: 400 })
    if (amount < m.min) return NextResponse.json<ApiResponse>({ ok: false, error: `Min withdrawal: ${m.min}` }, { status: 400 })
    if (amount > user.balance) return NextResponse.json<ApiResponse>({ ok: false, error: 'Insufficient balance' }, { status: 400 })

    const txRef = `WDN${Date.now()}${Math.floor(Math.random() * 1000)}`
    await execute(
      "INSERT INTO transactions (user_id, type, amount, status, payment_method, transaction_ref, notes, created_at) VALUES (?, 'withdrawal', ?, 'pending', ?, ?, ?, CURRENT_TIMESTAMP)",
      [user.id, amount, method, txRef, `Withdrawal to ${account || method}`]
    )
    // Hold the funds — deduct now, refund if rejected
    await execute('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, user.id])
    const updated = await queryOne<{ balance: number }>('SELECT balance FROM users WHERE id = ?', [user.id])

    return NextResponse.json<ApiResponse>({ ok: true, data: { balance: updated?.balance ?? user.balance, ref: txRef, status: 'pending' } })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error: ' + (e as Error).message }, { status: 500 })
  }
}
