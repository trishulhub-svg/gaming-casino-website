import { NextRequest, NextResponse } from 'next/server'
import { execute, queryMany } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Admin access required' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  let sql = `SELECT t.*, u.username FROM transactions t JOIN users u ON t.user_id = u.id`
  const args: unknown[] = []
  if (status) {
    sql += ' WHERE t.status = ?'
    args.push(status)
  }
  sql += ' ORDER BY t.created_at DESC LIMIT 100'
  const txs = await queryMany(sql, args)
  return NextResponse.json<ApiResponse>({ ok: true, data: txs })
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Admin access required' }, { status: 403 })
  }
  const { id, action, user_id, amount } = (await req.json()) as { id?: number; action: 'approve' | 'reject'; user_id: number; amount: number }
  if (action === 'approve') {
    await execute("UPDATE transactions SET status = 'completed' WHERE id = ?", [id])
  } else if (action === 'reject') {
    await execute("UPDATE transactions SET status = 'failed' WHERE id = ?", [id])
    // refund held funds
    await execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, user_id])
  }
  return NextResponse.json<ApiResponse>({ ok: true })
}
