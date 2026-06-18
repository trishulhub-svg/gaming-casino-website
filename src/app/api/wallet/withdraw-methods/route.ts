import { NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

const WITHDRAW_METHODS = [
  { id: 'upi', name: 'UPI', min: 200, max: 50000, fee: 0, eta: '5-30 min', icon: '📱' },
  { id: 'bank', name: 'Bank Transfer', min: 500, max: 500000, fee: 0, eta: '1-24 hours', icon: '🏦' },
  { id: 'usdt', name: 'USDT (TRC20)', min: 500, max: 1000000, fee: 0, eta: '15-60 min', icon: '₮' },
]

export async function GET() {
  return NextResponse.json<ApiResponse>({ ok: true, data: WITHDRAW_METHODS })
}
