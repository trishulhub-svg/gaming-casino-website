'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gift, Check } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore, useToastStore } from '@/lib/store'
import { formatINR } from '@/lib/types'
import { useRouter } from 'next/navigation'
import type { Bonus } from '@/lib/types'

export function BonusCard({ bonus }: { bonus: Bonus }) {
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const { isAuthenticated, updateBalance } = useAuthStore()
  const { push } = useToastStore()
  const router = useRouter()

  const handleClaim = async () => {
    if (!isAuthenticated) {
      router.push('/login?next=/promotions')
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
        updateBalance(j.data.balance)
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
    <Card className="p-5 bg-gradient-to-br from-card to-violet-950/30 border-violet-500/20 hover:border-violet-500/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">{bonus.name}</h3>
            <Badge variant="outline" className="text-[10px] capitalize border-violet-500/40 text-violet-400">
              {bonus.bonus_type}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black gradient-text">{formatINR(bonus.bonus_amount)}</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{bonus.description}</p>
      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="bg-background/50 rounded-md p-2">
          <div className="text-muted-foreground">Min Deposit</div>
          <div className="font-semibold">{formatINR(bonus.min_deposit)}</div>
        </div>
        <div className="bg-background/50 rounded-md p-2">
          <div className="text-muted-foreground">Wagering</div>
          <div className="font-semibold">{bonus.wagering_requirement}x</div>
        </div>
      </div>
      <Button
        onClick={handleClaim}
        disabled={claiming || claimed}
        className="w-full gradient-primary border-0 hover:opacity-90"
      >
        {claimed ? (
          <><Check className="h-4 w-4 mr-1" /> Claimed</>
        ) : claiming ? 'Claiming...' : 'Claim Bonus'}
      </Button>
    </Card>
  )
}
