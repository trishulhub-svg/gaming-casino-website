import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { hashPassword, getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const { new_password } = (await req.json()) as { new_password: string }
    if (!new_password || new_password.length < 6) {
      return NextResponse.json<ApiResponse>({ ok: false, error: 'Password must be at least 6 chars' }, { status: 400 })
    }
    const hash = hashPassword(new_password)
    await execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id])
    return NextResponse.json<ApiResponse>({ ok: true })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
