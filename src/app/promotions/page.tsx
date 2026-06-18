'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { BonusCard } from '@/components/casino/bonus-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Bonus } from '@/lib/types'

export default function PromotionsPage() {
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bonuses').then(r => r.json()).then(j => { setBonuses(j?.ok ? j.data || [] : []); setLoading(false) })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black mb-2">Promotions & Bonuses</h1>
        <p className="text-muted-foreground">Boost your bankroll with our generous bonuses.</p>
      </header>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {bonuses.map(b => <BonusCard key={b.id} bonus={b} />)}
        </div>
      )}

      <section className="mt-12 p-6 bg-card rounded-lg border border-border">
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
