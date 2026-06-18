import { NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

const DEPOSIT_METHODS = [
  { id: 'upi', name: 'UPI', min: 100, max: 50000, fee: 0, eta: 'Instant', icon: '📱' },
  { id: 'bank', name: 'Bank Transfer', min: 500, max: 500000, fee: 0, eta: '5-30 min', icon: '🏦' },
  { id: 'usdt', name: 'USDT (TRC20)', min: 500, max: 1000000, fee: 0, eta: '5-15 min', icon: '₮' },
  { id: 'paytm', name: 'Paytm Wallet', min: 100, max: 10000, fee: 0, eta: 'Instant', icon: '💳' },
]

export async function GET() {
  return NextResponse.json<ApiResponse>({ ok: true, data: DEPOSIT_METHODS })
}
