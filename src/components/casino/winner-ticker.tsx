'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { formatINR, timeAgo } from '@/lib/types'
import { STATIC_WINNERS } from '@/lib/static-data'

interface TickerItem {
  id: number
  amount: number
  notes: string | null
  created_at: string
  username: string
}

export function WinnerTicker() {
  // Start with static data so ticker is NEVER blank
  const [items, setItems] = useState<TickerItem[]>(STATIC_WINNERS)

  useEffect(() => {
    // Try to refresh from API; if it fails, keep static data
    const load = () => {
      fetch('/api/public/ticker')
        .then(r => r.json())
        .then(j => {
          if (j?.ok && j.data && j.data.length > 0) setItems(j.data)
        })
        .catch(() => {})
    }
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  if (items.length === 0) return null

  const doubled = [...items, ...items]

  return (
    <div className="bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-violet-500/10 border-y border-violet-500/20 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center gap-3 py-2">
        <div className="flex items-center gap-1.5 text-violet-400 font-bold text-sm flex-shrink-0">
          <Trophy className="h-4 w-4" />
          <span className="hidden sm:inline">LIVE WINS</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex gap-6 animate-marquee whitespace-nowrap">
            {doubled.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{item.username}</span>
                <span className="text-emerald-400 font-semibold">won {formatINR(item.amount)}</span>
                <span className="text-xs text-muted-foreground">on {item.notes?.replace('Win on ', '') || 'a game'}</span>
                <span className="text-xs text-muted-foreground">· {timeAgo(item.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
