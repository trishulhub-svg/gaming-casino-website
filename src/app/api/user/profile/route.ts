import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json<ApiResponse>({ ok: true, data: user })
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const { username, email, phone, avatar_url } = (await req.json()) as {
      username?: string; email?: string; phone?: string; avatar_url?: string
    }
    const fields: string[] = []
    const args: unknown[] = []
    if (username) { fields.push('username = ?'); args.push(username) }
    if (email) { fields.push('email = ?'); args.push(email) }
    if (phone !== undefined) { fields.push('phone = ?'); args.push(phone) }
    if (avatar_url !== undefined) { fields.push('avatar_url = ?'); args.push(avatar_url) }
    if (fields.length === 0) return NextResponse.json<ApiResponse>({ ok: false, error: 'Nothing to update' }, { status: 400 })
    args.push(user.id)
    await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, args)
    return NextResponse.json<ApiResponse>({ ok: true })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error: ' + (e as Error).message }, { status: 500 })
  }
}
