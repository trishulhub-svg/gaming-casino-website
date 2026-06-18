import { NextResponse } from 'next/server'
import { GAME_CATEGORIES, ApiResponse } from '@/lib/types'

export async function GET() {
  return NextResponse.json<ApiResponse<typeof GAME_CATEGORIES>>({ ok: true, data: GAME_CATEGORIES as unknown as typeof GAME_CATEGORIES })
}
