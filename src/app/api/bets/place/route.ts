import { NextRequest, NextResponse } from 'next/server'
import { execute, queryOne, queryMany, lastInsertId } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ApiResponse, Bet } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const { game_id, bet_amount, game_data } = (await req.json()) as { game_id: number; bet_amount: number; game_data?: string }

    if (!game_id || !bet_amount || bet_amount <= 0) {
      return NextResponse.json<ApiResponse>({ ok: false, error: 'Invalid bet' }, { status: 400 })
    }
    if (bet_amount > user.balance) {
      return NextResponse.json<ApiResponse>({ ok: false, error: 'Insufficient balance' }, { status: 400 })
    }

    const game = await queryOne<{ id: number; min_bet: number; max_bet: number }>('SELECT id, min_bet, max_bet FROM games WHERE id = ? AND is_active = 1', [game_id])
    if (!game) return NextResponse.json<ApiResponse>({ ok: false, error: 'Game not found' }, { status: 404 })
    if (bet_amount < game.min_bet || bet_amount > game.max_bet) {
      return NextResponse.json<ApiResponse>({ ok: false, error: `Bet must be between ${game.min_bet} and ${game.max_bet}` }, { status: 400 })
    }

    // Deduct bet
    await execute('UPDATE users SET balance = balance - ? WHERE id = ?', [bet_amount, user.id])
    await execute(
      "INSERT INTO transactions (user_id, type, amount, status, payment_method, notes, created_at) VALUES (?, 'bet', ?, 'completed', 'GAME', ?, CURRENT_TIMESTAMP)",
      [user.id, bet_amount, `Bet on game #${game_id}`]
    )

    // Simple RNG outcome — 47% win chance with 2x payout (RTP ~94%)
    const win = Math.random() < 0.47
    let winAmount = 0
    let result = 'loss'
    if (win) {
      winAmount = bet_amount * 2
      result = 'win'
      await execute('UPDATE users SET balance = balance + ? WHERE id = ?', [winAmount, user.id])
      await execute(
        "INSERT INTO transactions (user_id, type, amount, status, payment_method, notes, created_at) VALUES (?, 'win', ?, 'completed', 'GAME', ?, CURRENT_TIMESTAMP)",
        [user.id, winAmount, `Win on game #${game_id}`]
      )
    }

    const result2 = await execute(
      "INSERT INTO bets (user_id, game_id, bet_amount, win_amount, result, game_data, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
      [user.id, game_id, bet_amount, winAmount, result, game_data || null]
    )
    const betId = lastInsertId(result2 as { lastInsertRowid?: bigint | number })

    const updated = await queryOne<{ balance: number }>('SELECT balance FROM users WHERE id = ?', [user.id])
    return NextResponse.json<ApiResponse<{ bet_id: number; result: string; win_amount: number; balance: number }>>({
      ok: true,
      data: { bet_id: betId, result, win_amount: winAmount, balance: updated?.balance ?? user.balance },
    })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ ok: false, error: 'Server error: ' + (e as Error).message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json<ApiResponse>({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 200)
  const bets = await queryMany<Bet & { game_name?: string }>(
    'SELECT b.*, g.name as game_name FROM bets b LEFT JOIN games g ON b.game_id = g.id WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT ?',
    [user.id, limit]
  )
  return NextResponse.json<ApiResponse<Bet[]>>({ ok: true, data: bets })
}
