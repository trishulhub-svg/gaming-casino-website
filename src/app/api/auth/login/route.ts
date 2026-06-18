import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import { verifyPassword, setSessionCookie } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = (await req.json()) as { identifier: string; password: string }
    if (!identifier || !password) {
      return NextResponse.json<ApiResponse>({ ok: false, error: 'Missing credentials' }, { status: 400 })
    }
    const user = await queryOne<{ id: number; username: string; email: string; password_hash: string; role: string; is_active: number }>(
      'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    )
    if (!user || !user.is_active) {
      return NextResponse.json<ApiResponse>({ ok: false, error: 'Invalid credentials' }, { status: 401 })
    }
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json<ApiResponse>({ ok: false, error: 'Invalid credentials' }, { status: 401 })
    }
    await execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id])
    await setSessionCookie({ sub: String(user.id), username: user.username, role: user.role })

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: { id: user.id, username: user.username, email: user.email, role: user.role },
    })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error: ' + (e as Error).message }, { status: 500 })
  }
}
