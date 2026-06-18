'use client'

import { useState } from 'react'
import { GameCard } from '@/components/casino/game-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getGamesByCategory, getAllProviders } from '@/lib/static-data'

export function GameLobby({ category, title, description }: { category: string; title: string; description: string }) {
  // Use static data — page is never blank
  const allGames = getGamesByCategory(category)
  const [provider, setProvider] = useState<string>('all')

  // Get providers available in this category
  const providersInCategory = Array.from(new Set(allGames.map(g => g.provider).filter(Boolean))) as string[]
  const filtered = provider === 'all' ? allGames : allGames.filter(g => g.provider === provider)

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
        <p className="text-xs text-violet-400 mt-2">{allGames.length} games available</p>
      </header>

      {providersInCategory.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Provider:</span>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              {providersInCategory.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map(g => <GameCard key={g.id} game={g} />)}
      </div>
    </div>
  )
}
