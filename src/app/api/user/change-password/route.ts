import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const { current_password, new_password } = (await req.json()) as { current_password: string; new_password: string }
    if (!current_password || !new_password) return NextResponse.json<ApiResponse>({ ok: false, error: 'Missing fields' }, { status: 400 })
    if (new_password.length < 6) return NextResponse.json<ApiResponse>({ ok: false, error: 'New password too short' }, { status: 400 })

    const full = await execute('SELECT password_hash FROM users WHERE id = ?', [user.id])
    const stored = (full.rows[0] as { password_hash: string })?.password_hash
    if (!stored || !verifyPassword(current_password, stored)) {
      return NextResponse.json<ApiResponse>({ ok: false, error: 'Current password is incorrect' }, { status: 400 })
    }
    await execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(new_password), user.id])
    return NextResponse.json<ApiResponse>({ ok: true })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
