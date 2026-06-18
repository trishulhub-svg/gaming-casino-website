import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function POST() {
  await clearSessionCookie()
  return NextResponse.json<ApiResponse>({ ok: true })
}
