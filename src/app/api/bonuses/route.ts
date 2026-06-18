import { NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'
import { ApiResponse, Bonus } from '@/lib/types'

export async function GET() {
  const bonuses = await queryMany<Bonus>('SELECT * FROM bonuses WHERE is_active = 1 ORDER BY bonus_amount DESC')
  return NextResponse.json<ApiResponse<Bonus[]>>({ ok: true, data: bonuses })
}
