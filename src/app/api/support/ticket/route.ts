import { NextRequest, NextResponse } from 'next/server'
import { execute, lastInsertId } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse, SupportTicket } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const { subject, message } = (await req.json()) as { subject: string; message: string }
    if (!subject || !message) return NextResponse.json<ApiResponse>({ ok: false, error: 'Subject and message required' }, { status: 400 })
    const r = await execute(
      "INSERT INTO support_tickets (user_id, subject, message, status, created_at) VALUES (?, ?, ?, 'open', CURRENT_TIMESTAMP)",
      [user.id, subject, message]
    )
    return NextResponse.json<ApiResponse>({ ok: true, data: { id: lastInsertId(r as { lastInsertRowid?: bigint | number }) } })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const tickets = await execute(
    'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
    [user.id]
  )
  return NextResponse.json<ApiResponse<SupportTicket[]>>({ ok: true, data: tickets.rows as SupportTicket[] })
}
