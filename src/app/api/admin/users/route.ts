import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Admin access required' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 200)
  const users = await queryMany(
    `SELECT id, username, email, phone, balance, role, referral_code, is_active, created_at, last_login
     FROM users ORDER BY created_at DESC LIMIT ?`,
    [limit]
  )
  return NextResponse.json<ApiResponse>({ ok: true, data: users })
}
