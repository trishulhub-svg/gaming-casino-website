import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute, lastInsertId } from '@/lib/db'
import { hashPassword, setSessionCookie, generateReferralCode, isValidEmail, isValidPhone } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, phone, password, referral_code } = body as {
      username: string; email: string; phone: string; password: string; referral_code?: string
    }

    if (!username || !email || !password) {
      return NextResponse.json<ApiResponse>({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }
    if (username.length < 3) return NextResponse.json<ApiResponse>({ ok: false, error: 'Username must be at least 3 chars' }, { status: 400 })
    if (!isValidEmail(email)) return NextResponse.json<ApiResponse>({ ok: false, error: 'Invalid email' }, { status: 400 })
    if (password.length < 6) return NextResponse.json<ApiResponse>({ ok: false, error: 'Password must be at least 6 chars' }, { status: 400 })
    if (phone && !isValidPhone(phone)) return NextResponse.json<ApiResponse>({ ok: false, error: 'Invalid phone' }, { status: 400 })

    const existing = await queryOne('SELECT id FROM users WHERE username = ? OR email = ?', [username, email])
    if (existing) return NextResponse.json<ApiResponse>({ ok: false, error: 'Username or email already exists' }, { status: 409 })

    const hash = hashPassword(password)
    const myReferralCode = generateReferralCode(username)
    let referredBy: string | null = null
    if (referral_code) {
      const ref = await queryOne<{ id: number }>('SELECT id FROM users WHERE referral_code = ?', [referral_code])
      if (ref) referredBy = referral_code
    }

    const result = await execute(
      `INSERT INTO users (username, email, password_hash, phone, balance, role, referral_code, referred_by, created_at, is_active)
       VALUES (?, ?, ?, ?, 0, 'user', ?, ?, CURRENT_TIMESTAMP, 1)`,
      [username, email, hash, phone || null, myReferralCode, referredBy]
    )
    const newId = lastInsertId(result as { lastInsertRowid?: bigint | number })

    if (referredBy) {
      const ref = await queryOne<{ id: number }>('SELECT id FROM users WHERE referral_code = ?', [referredBy])
      if (ref) {
        await execute('INSERT INTO referrals (referrer_id, referred_id, commission_earned, created_at) VALUES (?, ?, 0, CURRENT_TIMESTAMP)', [ref.id, newId])
      }
    }

    await setSessionCookie({ sub: String(newId), username, role: 'user' })

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: { id: newId, username, email, role: 'user', balance: 0, referral_code: myReferralCode },
    })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error: ' + (e as Error).message }, { status: 500 })
  }
}
