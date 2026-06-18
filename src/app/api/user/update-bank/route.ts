import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

// Store bank details as JSON-encoded notes in a transaction row (since the schema doesn't have a bank_details table).
// In production, you'd add a dedicated table; for demo we keep it lightweight.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const { account_name, account_number, ifsc, upi_id } = (await req.json()) as {
      account_name?: string; account_number?: string; ifsc?: string; upi_id?: string
    }
    const payload = JSON.stringify({ account_name, account_number, ifsc, upi_id })
    await execute(
      "INSERT INTO transactions (user_id, type, amount, status, payment_method, notes, created_at) VALUES (?, 'bonus', 0, 'completed', 'BANK_UPDATE', ?, CURRENT_TIMESTAMP)",
      [user.id, payload]
    )
    return NextResponse.json<ApiResponse>({ ok: true, data: { message: 'Bank details updated' } })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
