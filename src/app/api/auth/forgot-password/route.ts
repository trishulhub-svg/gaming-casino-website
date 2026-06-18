import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import { ApiResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string }
    if (!email) return NextResponse.json<ApiResponse>({ ok: false, error: 'Email required' }, { status: 400 })
    const user = await queryOne<{ id: number }>('SELECT id FROM users WHERE email = ?', [email])
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'No account with that email' }, { status: 404 })
    // In production: email a token. Here we just acknowledge.
    await execute("INSERT INTO transactions (user_id, type, amount, status, payment_method, notes) VALUES (?, 'bonus', 0, 'pending', 'SYSTEM', 'Password reset requested')", [user.id])
    return NextResponse.json<ApiResponse>({ ok: true, data: { message: 'Reset link sent (demo)' } })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
