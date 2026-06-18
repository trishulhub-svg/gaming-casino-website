import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse, Transaction } from '@/lib/types'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 200)

  let sql = 'SELECT * FROM transactions WHERE user_id = ?'
  const args: unknown[] = [user.id]
  if (type) { sql += ' AND type = ?'; args.push(type) }
  if (status) { sql += ' AND status = ?'; args.push(status) }
  sql += ' ORDER BY created_at DESC LIMIT ?'
  args.push(limit)

  const txs = await queryMany<Transaction>(sql, args)
  return NextResponse.json<ApiResponse<Transaction[]>>({ ok: true, data: txs })
}
