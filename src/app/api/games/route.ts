import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { ApiResponse, Game } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const provider = searchParams.get('provider')
  const popular = searchParams.get('popular')
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 200)

  let sql = 'SELECT * FROM games WHERE is_active = 1'
  const args: unknown[] = []
  if (category && category !== 'popular') {
    sql += ' AND category = ?'
    args.push(category)
  }
  if (provider) {
    sql += ' AND provider = ?'
    args.push(provider)
  }
  if (popular === '1' || category === 'popular') {
    sql += ' AND is_popular = 1'
  }
  sql += ' ORDER BY is_popular DESC, name ASC LIMIT ?'
  args.push(limit)

  const games = await queryMany<Game>(sql, args)
  return NextResponse.json<ApiResponse<Game[]>>({ ok: true, data: games })
}
