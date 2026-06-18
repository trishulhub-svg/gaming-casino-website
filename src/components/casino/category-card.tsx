'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { LucideIcon, Flame, Cherry, Ticket, Trophy, Spade, Club, Fish, Gamepad2 } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Flame, Cherry, Ticket, Trophy, Spade, Club, Fish, Gamepad2,
}

export function CategoryCard({ category, label, color, icon, count }: {
  category: string
  label: string
  color: string
  icon: string
  count?: number
}) {
  const Icon = ICONS[icon] || Gamepad2
  return (
    <Link href={`/games/${category}`} className="block">
      <Card className={`relative overflow-hidden p-0 bg-gradient-to-br ${color} border-0 hover:scale-105 transition-transform`}>
        <div className="aspect-square flex flex-col items-center justify-center text-white p-4">
          <Icon className="h-8 w-8 mb-2 drop-shadow-lg" />
          <div className="text-sm font-bold text-center">{label}</div>
          {typeof count === 'number' && (
            <div className="text-[10px] opacity-80">{count} games</div>
          )}
        </div>
      </Card>
    </Link>
  )
}
