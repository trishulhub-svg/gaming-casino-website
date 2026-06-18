import { NextRequest, NextResponse } from 'next/server'
import { execute, queryMany, lastInsertId } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse, Game } from '@/lib/types'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Admin access required' }, { status: 403 })
  }
  const games = await queryMany<Game>('SELECT * FROM games ORDER BY created_at DESC')
  return NextResponse.json<ApiResponse<Game[]>>({ ok: true, data: games })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Admin access required' }, { status: 403 })
  }
  const g = (await req.json()) as Partial<Game>
  const r = await execute(
    `INSERT INTO games (name, category, provider, thumbnail_url, game_url, is_popular, is_active, min_bet, max_bet, rtp_percentage)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [g.name, g.category, g.provider || null, g.thumbnail_url || null, g.game_url || null, g.is_popular ?? 0, g.is_active ?? 1, g.min_bet ?? 10, g.max_bet ?? 10000, g.rtp_percentage ?? 96]
  )
  return NextResponse.json<ApiResponse>({ ok: true, data: { id: lastInsertId(r as { lastInsertRowid?: bigint | number }) } })
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Admin access required' }, { status: 403 })
  }
  const g = (await req.json()) as Partial<Game> & { id: number }
  await execute(
    `UPDATE games SET name = ?, category = ?, provider = ?, thumbnail_url = ?, game_url = ?, is_popular = ?, is_active = ?, min_bet = ?, max_bet = ?, rtp_percentage = ? WHERE id = ?`,
    [g.name, g.category, g.provider || null, g.thumbnail_url || null, g.game_url || null, g.is_popular ?? 0, g.is_active ?? 1, g.min_bet ?? 10, g.max_bet ?? 10000, g.rtp_percentage ?? 96, g.id]
  )
  return NextResponse.json<ApiResponse>({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Admin access required' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json<ApiResponse>({ ok: false, error: 'Missing id' }, { status: 400 })
  await execute('DELETE FROM games WHERE id = ?', [id])
  return NextResponse.json<ApiResponse>({ ok: true })
}
