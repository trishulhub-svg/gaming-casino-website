'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { BalanceDisplay } from '@/components/casino/balance-display'
import { useAuthStore, useToastStore } from '@/lib/store'
import { formatINR, type Game, type Bet } from '@/lib/types'
import { Play, History, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export default function GamePlayPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isAuthenticated, updateBalance } = useAuthStore()
  const { push } = useToastStore()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [betAmount, setBetAmount] = useState(10)
  const [history, setHistory] = useState<Bet[]>([])
  const [playing, setPlaying] = useState(false)
  const [lastResult, setLastResult] = useState<Bet | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?next=/game/${params.id}`)
      return
    }
    fetch(`/api/games/${params.id}`)
      .then(r => r.json())
      .then(j => {
        if (j.ok) {
          setGame(j.data)
          setBetAmount(j.data.min_bet)
        }
        setLoading(false)
      })
    fetch('/api/bets/history?limit=10')
      .then(r => r.json())
      .then(j => j?.ok && setHistory(j.data || []))
  }, [params.id, isAuthenticated, router])

  const play = async () => {
    if (!game) return
    setPlaying(true)
    setLastResult(null)
    try {
      const r = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: game.id, bet_amount: betAmount }),
      })
      const j = await r.json()
      if (j.ok) {
        updateBalance(j.data.balance)
        const newBet: Bet = {
          id: j.data.bet_id,
          user_id: user?.id || 0,
          game_id: game.id,
          bet_amount: betAmount,
          win_amount: j.data.win_amount,
          result: j.data.result,
          game_data: null,
          created_at: new Date().toISOString(),
        }
        setLastResult(newBet)
        setHistory(prev => [newBet, ...prev].slice(0, 10))
        if (j.data.result === 'win') {
          push({ type: 'success', message: `You won ${formatINR(j.data.win_amount)}!` })
        } else {
          push({ type: 'info', message: `Better luck next time!` })
        }
      } else {
        push({ type: 'error', message: j.error || 'Bet failed' })
      }
    } finally {
      setPlaying(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-32 mb-4" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 aspect-video" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Game not found.</p>
        <Button asChild className="mt-4"><Link href="/games/popular">Browse games</Link></Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href={`/games/${game.category}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-amber-500 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to {game.category}
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Game canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-black flex flex-col items-center justify-center relative">
              {game.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={game.thumbnail_url} alt={game.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
              )}
              <div className="relative text-center z-10">
                <h2 className="text-3xl font-black mb-2 text-white">{game.name}</h2>
                <p className="text-sm text-amber-300 mb-4">by {game.provider}</p>
                <div className="flex justify-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-black/50 rounded text-xs">Min: {formatINR(game.min_bet)}</div>
                  <div className="px-3 py-1 bg-black/50 rounded text-xs">Max: {formatINR(game.max_bet)}</div>
                  <div className="px-3 py-1 bg-black/50 rounded text-xs">RTP: {game.rtp_percentage}%</div>
                </div>
                {lastResult && (
                  <div className={`mt-4 px-6 py-3 rounded-lg inline-block ${
                    lastResult.result === 'win' ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
                  }`}>
                    {lastResult.result === 'win' ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-bold">You won {formatINR(lastResult.win_amount)}!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400">
                        <TrendingDown className="h-5 w-5" />
                        <span className="font-bold">You lost {formatINR(lastResult.bet_amount)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              This is a demo simulation. In production, the actual game (provided by {game.provider}) would load inside an iframe here.
              Try placing a bet below to see the win/loss flow.
            </p>
          </Card>
        </div>

        {/* Bet panel */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Place a Bet</h3>
              {user && <BalanceDisplay balance={user.balance} compact />}
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Bet Amount</Label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={e => setBetAmount(Number(e.target.value))}
                  min={game.min_bet}
                  max={game.max_bet}
                  className="bg-background"
                />
                <div className="flex gap-1.5 mt-2">
                  {[10, 50, 100, 500].map(v => (
                    <Button
                      key={v}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setBetAmount(v)}
                      className="flex-1 text-xs"
                    >
                      ₹{v}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={play}
                disabled={playing || betAmount < game.min_bet || betAmount > game.max_bet || (user && betAmount > user.balance)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
              >
                <Play className="h-4 w-4 mr-1 fill-current" />
                {playing ? 'Playing...' : `Play for ${formatINR(betAmount)}`}
              </Button>
              {user && betAmount > user.balance && (
                <p className="text-xs text-red-400 text-center">Insufficient balance. <Link href="/wallet/deposit" className="underline">Deposit</Link></p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold text-sm">Recent Bets</h3>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No bets yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                    <div>
                      <div className="font-medium">{formatINR(b.bet_amount)}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(b.created_at).toLocaleTimeString()}</div>
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
    </div>
  )
}
