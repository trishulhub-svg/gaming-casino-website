import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { message, status } = (await req.json()) as { message?: string; status?: string }
  if (message) {
    await execute('UPDATE support_tickets SET message = ? WHERE id = ? AND user_id = ?', [message, Number(id), user.id])
  }
  if (status) {
    await execute('UPDATE support_tickets SET status = ? WHERE id = ? AND user_id = ?', [status, Number(id), user.id])
  }
  return NextResponse.json<ApiResponse>({ ok: true })
}
