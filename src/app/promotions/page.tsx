'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToastStore, useAuthStore } from '@/lib/store'
import { formatINR } from '@/lib/types'
import { STATIC_PROMOTIONS, type StaticPromotion } from '@/lib/static-data'
import { Gift, Crown, Calendar, TrendingUp, Users, Sparkles, TrendingDown, Check } from 'lucide-react'

const PROMO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Gift, Crown, Calendar, TrendingUp, Users, Sparkles, TrendingDown,
}

export default function PromotionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black mb-2">
          <span className="gradient-text">Promotions</span> & Bonuses
        </h1>
        <p className="text-muted-foreground">Boost your bankroll with our generous bonuses.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {STATIC_PROMOTIONS.map(b => <PromoCard key={b.id} bonus={b} />)}
      </div>

      <section className="mt-12 p-6 bg-card rounded-lg border border-violet-500/20">
        <h2 className="text-2xl font-bold mb-3">Terms & Conditions</h2>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>All bonuses are subject to wagering requirements before withdrawal.</li>
          <li>Wagering requirement = bonus amount × multiplier, played through on eligible games.</li>
          <li>Maximum bet while playing with an active bonus is ₹500 per spin/round.</li>
          <li>Bonus funds expire 30 days after being claimed.</li>
          <li>TrishulCasino reserves the right to void bonuses and winnings in case of bonus abuse.</li>
          <li>18+ only. Please gamble responsibly.</li>
        </ul>
      </section>
    </div>
  )
}

function PromoCard({ bonus }: { bonus: StaticPromotion }) {
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { push } = useToastStore()
  const Icon = PROMO_ICONS[bonus.icon] || Gift

  const handleClaim = async () => {
    if (!isAuthenticated) {
      push({ type: 'info', message: 'Please login to claim bonuses' })
      window.location.href = '/login?next=/promotions'
      return
    }
    setClaiming(true)
    try {
      const r = await fetch('/api/bonuses/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bonus_id: bonus.id }),
      })
      const j = await r.json()
      if (j.ok) {
        setClaimed(true)
        push({ type: 'success', message: `Bonus claimed: ${formatINR(bonus.bonus_amount)}` })
      } else {
        push({ type: 'error', message: j.error || 'Failed to claim' })
      }
    } catch {
      push({ type: 'error', message: 'Network error' })
    } finally {
      setClaiming(false)
    }
  }

  return (
    <Card className={`relative p-6 bg-gradient-to-br ${bonus.color} border-0 hover:scale-[1.02] transition-transform text-white overflow-hidden`}>
      {/* Background image */}
      <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bonus.image} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">{bonus.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 capitalize">{bonus.bonus_type}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{formatINR(bonus.bonus_amount)}</div>
          </div>
        </div>
        <p className="text-sm opacity-90 mb-4">{bonus.description}</p>
      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="bg-white/10 rounded-md p-2">
          <div className="opacity-80">Min Deposit</div>
          <div className="font-bold">{formatINR(bonus.min_deposit)}</div>
        </div>
        <div className="bg-white/10 rounded-md p-2">
          <div className="opacity-80">Wagering</div>
          <div className="font-bold">{bonus.wagering_requirement}x</div>
        </div>
      </div>
      <Button
        onClick={handleClaim}
        disabled={claiming || claimed}
        className="w-full bg-white text-slate-900 hover:bg-white/90 font-bold"
      >
        {claimed ? (
          <><Check className="h-4 w-4 mr-1" /> Claimed</>
        ) : claiming ? 'Claiming...' : 'Claim Bonus'}
      </Button>
      </div>
    </Card>
  )
}
