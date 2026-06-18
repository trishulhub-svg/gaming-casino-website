'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WinnerTicker } from '@/components/casino/winner-ticker'
import { Leaderboard } from '@/components/casino/leaderboard'
import { CategoryCard } from '@/components/casino/category-card'
import { GameCard } from '@/components/casino/game-card'
import { GAME_CATEGORIES, type Game, type Bonus } from '@/lib/types'
import { Sparkles, Wallet, Users, Shield, Zap, ArrowRight, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const [popular, setPopular] = useState<Game[]>([])
  const [byCategory, setByCategory] = useState<Record<string, Game[]>>({})
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/games?popular=1&limit=12').then(r => r.json()).then(j => j?.ok && setPopular(j.data || []))
    fetch('/api/bonuses').then(r => r.json()).then(j => j?.ok && setBonuses(j.data || []))
    Promise.all(
      GAME_CATEGORIES.filter(c => c.key !== 'popular').map(c =>
        fetch(`/api/games?category=${c.key}&limit=4`).then(r => r.json()).then(j => [c.key, j?.data || []] as const)
      )
    ).then(results => {
      const map: Record<string, Game[]> = {}
      const countMap: Record<string, number> = {}
      results.forEach(([k, g]) => {
        map[k] = g
        // Use first 4 from full list; estimate count from API later if needed
        countMap[k] = g.length
      })
      setByCategory(map)
      setCounts(countMap)
    })
  }, [])

  return (
    <div className="min-h-screen">
      <WinnerTicker />

      {/* HERO */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-400">
                <Sparkles className="h-3 w-3" />
                <span>100% Welcome Bonus up to ₹10,000</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                India&apos;s Premier <span className="text-amber-500">Gaming</span> Destination
              </h1>
              <p className="text-muted-foreground text-lg max-w-md">
                Play 500+ games — Slots, Lottery, Live Casino, Sports & more. Instant UPI deposits, fast withdrawals, 24/7 support.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
                  <Link href="/register">
                    <Zap className="h-4 w-4 mr-1" /> Get Started
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/games/popular">Browse Games</Link>
                </Button>
              </div>
              <div className="flex gap-6 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-500" /> Secure & Fair
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-amber-500" /> Instant UPI
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-500" /> 50k+ Players
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-3 gap-2">
                {popular.slice(0, 6).map(g => (
                  <Link key={g.id} href={`/game/${g.id}`} className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 hover:scale-105 transition-transform">
                    {g.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.thumbnail_url} alt={g.name} className="w-full h-full object-cover" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Game Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {GAME_CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.key}
              category={cat.key}
              label={cat.label}
              color={cat.color}
              icon={cat.icon}
              count={counts[cat.key]}
            />
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-500" /> Popular Games
          </h2>
          <Link href="/games/popular" className="text-sm text-amber-500 hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {popular.map(g => <GameCard key={g.id} game={g} />)}
        </div>
      </section>

      {/* LEADERBOARD + PROMOS */}
      <section className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Promotions</h2>
          {bonuses.slice(0, 2).map(b => (
            <Card key={b.id} className="p-4 bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">{b.name}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </div>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-slate-900 flex-shrink-0">
                  <Link href="/promotions">Claim</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CATEGORY PREVIEWS */}
      {GAME_CATEGORIES.filter(c => c.key !== 'popular').map(cat => {
        const games = byCategory[cat.key] || []
        if (games.length === 0) return null
        return (
          <section key={cat.key} className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold capitalize">{cat.label}</h2>
              <Link href={`/games/${cat.key}`} className="text-sm text-amber-500 hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {games.map(g => <GameCard key={g.id} game={g} />)}
            </div>
          </section>
        )
      })}

      {/* CTA */}
      <section className="container mx-auto px-4 py-12">
        <Card className="p-8 bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/30 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Win Big?</h2>
          <p className="text-muted-foreground mb-6">Sign up today and claim your 100% welcome bonus up to ₹10,000.</p>
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
            <Link href="/register">Create Free Account</Link>
          </Button>
        </Card>
      </section>

      {/* 18+ warning */}
      <section className="container mx-auto px-4 py-8 text-center">
        <Card className="p-4 bg-red-950/30 border-red-500/30">
          <p className="text-sm text-red-300">
            ⚠ <strong>18+ Only.</strong> Gambling can be addictive. Play responsibly. This is a demo platform for educational purposes — no real-money transactions occur.
          </p>
        </Card>
      </section>
    </div>
  )
}
