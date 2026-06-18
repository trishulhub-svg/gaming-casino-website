import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { ApiResponse, Game } from '@/lib/types'

export async function GET() {
  const games = await queryMany<Game>('SELECT * FROM games WHERE is_active = 1 AND is_popular = 1 ORDER BY name ASC LIMIT 20')
  return NextResponse.json<ApiResponse<Game[]>>({ ok: true, data: games })
}
