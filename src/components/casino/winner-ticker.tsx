'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { formatINR, timeAgo } from '@/lib/types'

interface TickerItem {
  id: number
  amount: number
  notes: string | null
  created_at: string
  username: string
}

export function WinnerTicker() {
  const [items, setItems] = useState<TickerItem[]>([])

  useEffect(() => {
    fetch('/api/public/ticker')
      .then(r => r.json())
      .then(j => j?.ok && setItems(j.data || []))
      .catch(() => {})
    const id = setInterval(() => {
      fetch('/api/public/ticker')
        .then(r => r.json())
        .then(j => j?.ok && setItems(j.data || []))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [])

  if (items.length === 0) return null

  const doubled = [...items, ...items]

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-y border-amber-500/20 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center gap-3 py-2">
        <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm flex-shrink-0">
          <Trophy className="h-4 w-4" />
          <span className="hidden sm:inline">LIVE WINS</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex gap-6 animate-marquee whitespace-nowrap">
            {doubled.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{item.username}</span>
                <span className="text-amber-500 font-semibold">won {formatINR(item.amount)}</span>
                <span className="text-xs text-muted-foreground">on {item.notes?.replace('Win on ', '')}</span>
                <span className="text-xs text-muted-foreground">· {timeAgo(item.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
