'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { LucideIcon, Flame, Cherry, Ticket, Trophy, Spade, Club, Fish, Gamepad2 } from 'lucide-react'
import { getCategoryImage } from '@/lib/static-data'

const ICONS: Record<string, LucideIcon> = {
  Flame, Cherry, Ticket, Trophy, Spade, Club, Fish, Gamepad2,
}

const CATEGORY_COLORS: Record<string, string> = {
  popular: 'from-orange-500 to-red-500',
  slots: 'from-pink-500 to-rose-500',
  lottery: 'from-yellow-400 to-amber-500',
  sports: 'from-emerald-500 to-green-500',
  casino: 'from-red-500 to-rose-700',
  card: 'from-violet-500 to-purple-500',
  fishing: 'from-cyan-500 to-blue-500',
  mini: 'from-indigo-500 to-violet-500',
}

export function CategoryCard({ category, label, color, icon, count }: {
  category: string
  label: string
  color: string
  icon: string
  count?: number
}) {
  const Icon = ICONS[icon] || Gamepad2
  const gradient = CATEGORY_COLORS[category] || color
  const image = getCategoryImage(category)
  return (
    <Link href={`/games/${category}`} className="block group">
      <Card className={`relative overflow-hidden p-0 bg-gradient-to-br ${gradient} border-0 hover:scale-105 hover:shadow-lg transition-all duration-300`}>
        {/* Background image */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={label} className="w-full h-full object-cover" />
        </div>
        <div className="relative aspect-square flex flex-col items-center justify-center text-white p-4">
          <Icon className="h-8 w-8 mb-2 drop-shadow-lg" />
          <div className="text-sm font-bold text-center">{label}</div>
          {typeof count === 'number' && (
            <div className="text-[10px] opacity-90 mt-0.5">{count} games</div>
          )}
        </div>
      </Card>
    </Link>
  )
}
