import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json<ApiResponse<{ balance: number; id: number; username: string }>>({
    ok: true,
    data: { balance: user.balance, id: user.id, username: user.username },
  })
}
