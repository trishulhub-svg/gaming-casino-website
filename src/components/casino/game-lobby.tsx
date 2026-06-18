'use client'

import { useEffect, useState } from 'react'
import { GameCard } from '@/components/casino/game-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Game } from '@/lib/types'

export function GameLobby({ category, title, description }: { category: string; title: string; description: string }) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [provider, setProvider] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    const url = category === 'popular'
      ? '/api/games?popular=1&limit=100'
      : `/api/games?category=${category}&limit=100`
    fetch(url)
      .then(r => r.json())
      .then(j => {
        setGames(j?.ok ? (j.data || []) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  const providers = Array.from(new Set(games.map(g => g.provider).filter(Boolean))) as string[]
  const filtered = provider === 'all' ? games : games.filter(g => g.provider === provider)

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </header>

      {providers.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Provider:</span>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              {providers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No games found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(g => <GameCard key={g.id} game={g} />)}
        </div>
      )}
    </div>
  )
}
