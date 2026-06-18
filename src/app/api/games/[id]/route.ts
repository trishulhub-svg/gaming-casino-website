import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { ApiResponse, Game } from '@/lib/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const game = await queryOne<Game>('SELECT * FROM games WHERE id = ? AND is_active = 1', [Number(id)])
  if (!game) return NextResponse.json<ApiResponse>({ ok: false, error: 'Game not found' }, { status: 404 })
  return NextResponse.json<ApiResponse<Game>>({ ok: true, data: game })
}
