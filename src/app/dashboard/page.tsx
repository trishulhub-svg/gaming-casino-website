'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BalanceDisplay } from '@/components/casino/balance-display'
import { LoginRequired } from '@/components/casino/login-required'
import { useAuthStore, useToastStore } from '@/lib/store'
import { formatINR, type Transaction, type Bet } from '@/lib/types'
import { Wallet, TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine, Users, Gift, History, Trophy } from 'lucide-react'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { push } = useToastStore()
  const [stats, setStats] = useState<{ total_bets: number; total_wagered: number; total_won: number; wins: number; losses: number }>({
    total_bets: 0, total_wagered: 0, total_won: 0, wins: 0, losses: 0,
  })
  const [txs, setTxs] = useState<Transaction[]>([])
  const [recentBets, setRecentBets] = useState<(Bet & { game_name?: string })[]>([])

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/bets/stats').then(r => r.json()).then(j => j?.ok && setStats(j.data))
    fetch('/api/wallet/transactions?limit=5').then(r => r.json()).then(j => j?.ok && setTxs(j.data || []))
    fetch('/api/bets/history?limit=5').then(r => r.json()).then(j => j?.ok && setRecentBets(j.data || []))
  }, [isAuthenticated])

  if (!isAuthenticated || !user) {
    return <LoginRequired next="/dashboard" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.username} 👋</h1>
          <p className="text-muted-foreground text-sm">Here&apos;s your account overview.</p>
        </div>
        <BalanceDisplay balance={user.balance} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-slate-900 h-auto py-4 flex flex-col">
          <Link href="/wallet/deposit"><ArrowDownToLine className="h-5 w-5 mb-1" /> Deposit</Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
          <Link href="/wallet/withdraw"><ArrowUpFromLine className="h-5 w-5 mb-1" /> Withdraw</Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
          <Link href="/referral"><Users className="h-5 w-5 mb-1" /> Invite</Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
          <Link href="/promotions"><Gift className="h-5 w-5 mb-1" /> Bonuses</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total Bets</div>
          <div className="text-2xl font-bold">{stats.total_bets}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total Wagered</div>
          <div className="text-2xl font-bold">{formatINR(stats.total_wagered)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /> Total Won</div>
          <div className="text-2xl font-bold text-green-400">{formatINR(stats.total_won)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-500" /> Net P/L</div>
          <div className={`text-2xl font-bold ${stats.total_won - stats.total_wagered >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatINR(stats.total_won - stats.total_wagered)}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><History className="h-4 w-4 text-amber-500" /> Recent Transactions</h3>
            <Link href="/wallet/transactions" className="text-xs text-amber-500 hover:underline">View all</Link>
          </div>
          {txs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {txs.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div>
                    <div className="font-medium capitalize">{t.type} · <span className="text-muted-foreground">{t.status}</span></div>
                    <div className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                  </div>
                  <div className={t.type === 'deposit' || t.type === 'win' || t.type === 'bonus' || t.type === 'referral' ? 'text-green-400' : 'text-red-400'}>
                    {t.type === 'deposit' || t.type === 'win' || t.type === 'bonus' || t.type === 'referral' ? '+' : '-'}{formatINR(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Recent Bets</h3>
            <Link href="/games/popular" className="text-xs text-amber-500 hover:underline">Play more</Link>
          </div>
          {recentBets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No bets yet.</p>
          ) : (
            <div className="space-y-2">
              {recentBets.map(b => (
                <div key={b.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div>
                    <div className="font-medium">{(b as Bet & { game_name?: string }).game_name || `Game #${b.game_id}`}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(b.created_at).toLocaleString()}</div>
                  </div>
                  <div className={b.result === 'win' ? 'text-green-400' : 'text-red-400'}>
                    {b.result === 'win' ? `+${formatINR(b.win_amount)}` : `-${formatINR(b.bet_amount)}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
