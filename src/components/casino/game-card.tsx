'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'
import type { Game } from '@/lib/types'

export function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/game/${game.id}`} className="group block">
      <Card className="overflow-hidden p-0 bg-card border-border hover:border-amber-500/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10">
        <div className="relative aspect-[3/4] bg-slate-800 overflow-hidden">
          {game.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={game.thumbnail_url}
              alt={game.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-500/40 text-4xl font-bold">
              {game.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          {game.is_popular ? (
            <Badge className="absolute top-2 left-2 bg-amber-500 text-slate-900 text-[10px] px-1.5 py-0.5 font-bold">
              HOT
            </Badge>
          ) : null}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 animate-pulse-glow">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
        </div>
        <div className="p-2.5">
          <h3 className="text-sm font-semibold truncate">{game.name}</h3>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] text-muted-foreground">{game.provider}</span>
            <span className="text-[10px] text-amber-500/80">RTP {game.rtp_percentage}%</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
