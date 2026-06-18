'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WinnerTicker } from '@/components/casino/winner-ticker'
import { Leaderboard } from '@/components/casino/leaderboard'
import { CategoryCard } from '@/components/casino/category-card'
import { GameCard } from '@/components/casino/game-card'
import { GAME_CATEGORIES } from '@/lib/types'
import {
  STATIC_GAMES, STATIC_PROMOTIONS, STATIC_WINNERS, STATIC_LEADERBOARD, CATEGORY_COUNTS,
  getPopularGames, getGamesByCategory, type StaticGame, type StaticPromotion
} from '@/lib/static-data'
import { Sparkles, Wallet, Users, Shield, Zap, ArrowRight, TrendingUp, Trophy, Gift, ChevronRight, Crown, Calendar, TrendingDown } from 'lucide-react'

const PROMO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Gift, Crown, Calendar, TrendingUp, Users, Sparkles, TrendingDown,
}

export default function HomePage() {
  // Use static data IMMEDIATELY so the page is never blank.
  // API calls only refresh in the background.
  const popular = getPopularGames(12)
  const [byCategory] = useState<Record<string, StaticGame[]>>(() => {
    const map: Record<string, StaticGame[]> = {}
    GAME_CATEGORIES.filter(c => c.key !== 'popular').forEach(c => {
      map[c.key] = getGamesByCategory(c.key).slice(0, 6)
    })
    return map
  })

  return (
    <div className="min-h-screen">
      <WinnerTicker />

      {/* HERO */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero/casino-hero.png" alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-hero-glow" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/30 rounded-full px-4 py-1.5 text-xs text-violet-300">
                <Sparkles className="h-3 w-3" />
                <span>100% Welcome Bonus up to ₹10,000</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                India&apos;s Premier{' '}
                <span className="gradient-text">Gaming</span>{' '}
                Destination
              </h1>
              <p className="text-muted-foreground text-lg max-w-md">
                Play 500+ games — Slots, Lottery, Live Casino, Sports & more. Instant UPI deposits, fast withdrawals, 24/7 support.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="gradient-primary border-0 hover:opacity-90 font-bold">
                  <Link href="/register">
                    <Zap className="h-4 w-4 mr-1" /> Get Started
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-violet-500/30 hover:bg-violet-500/10">
                  <Link href="/games/popular">Browse Games</Link>
                </Button>
              </div>
              <div className="flex gap-6 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-500" /> Secure & Fair
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-violet-400" /> Instant UPI
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-pink-400" /> 50k+ Players
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                {popular.slice(0, 6).map((g, i) => (
                  <Link
                    key={g.id}
                    href={`/game/${g.id}`}
                    className={`aspect-[3/4] rounded-xl overflow-hidden bg-card border border-violet-500/20 hover:border-violet-500/50 transition-all hover:scale-105 ${i === 0 ? 'animate-float' : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.thumbnail_url} alt={g.name} className="w-full h-full object-cover" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Game Categories</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {GAME_CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.key}
              category={cat.key}
              label={cat.label}
              color={cat.color}
              icon={cat.icon}
              count={CATEGORY_COUNTS[cat.key]}
            />
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-violet-400" /> Popular Games
          </h2>
          <Link href="/games/popular" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Gift className="h-6 w-6 text-pink-400" /> Promotions
            </h2>
            <Link href="/promotions" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {STATIC_PROMOTIONS.slice(0, 3).map(b => {
            const Icon = PROMO_ICONS[b.icon] || Gift
            return (
              <Card key={b.id} className={`relative p-5 bg-gradient-to-r ${b.color} border-0 hover:scale-[1.02] transition-transform overflow-hidden`}>
                {/* Background image */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-bold text-lg">{b.name}</h3>
                    </div>
                    <p className="text-sm opacity-90 line-clamp-2">{b.description}</p>
                    <div className="mt-2 text-2xl font-black">
                      ₹{b.bonus_amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <Button asChild className="bg-white text-slate-900 hover:bg-white/90 flex-shrink-0 font-bold">
                    <Link href="/promotions">Claim</Link>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CATEGORY PREVIEWS */}
      {GAME_CATEGORIES.filter(c => c.key !== 'popular').map(cat => {
        const games = byCategory[cat.key] || []
        if (games.length === 0) return null
        return (
          <section key={cat.key} className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold capitalize flex items-center gap-2">
                {cat.label}
              </h2>
              <Link href={`/games/${cat.key}`} className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
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
      <section className="container mx-auto px-4 py-16">
        <Card className="p-10 bg-gradient-to-br from-violet-500/20 via-pink-500/10 to-transparent border-violet-500/30 text-center card-glow">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl md:text-4xl font-black mb-3">Ready to Win Big?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Sign up today and claim your 100% welcome bonus up to ₹10,000.</p>
          <div className="flex gap-3 justify-center">
            <Button asChild size="lg" className="gradient-primary border-0 hover:opacity-90 font-bold">
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-violet-500/30 hover:bg-violet-500/10">
              <Link href="/games/popular">Browse Games <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* 18+ warning */}
      <section className="container mx-auto px-4 py-8 text-center">
        <Card className="p-4 bg-red-950/20 border-red-500/30">
          <p className="text-sm text-red-300">
            ⚠ <strong>18+ Only.</strong> Gambling can be addictive. Play responsibly. This is a demo platform for educational purposes — no real-money transactions occur.
          </p>
        </Card>
      </section>
    </div>
  )
}
