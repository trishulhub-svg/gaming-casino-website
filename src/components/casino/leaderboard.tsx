'use client'

import { useEffect, useState } from 'react'
import { Crown, Medal, Trophy } from 'lucide-react'
import { formatINR } from '@/lib/types'
import { Card } from '@/components/ui/card'

interface LeaderRow {
  rank: number
  username: string
  total_won: number
}

export function Leaderboard() {
  const [rows, setRows] = useState<LeaderRow[]>([])

  useEffect(() => {
    fetch('/api/public/leaderboard')
      .then(r => r.json())
      .then(j => j?.ok && setRows(j.data || []))
      .catch(() => {})
  }, [])

  if (rows.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Leaderboard refreshes every midnight.
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-slate-900" />
        <h3 className="font-bold text-slate-900">Today&apos;s Top Winners</h3>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row, i) => (
          <div key={row.rank} className="flex items-center gap-3 p-3 hover:bg-card/50">
            <div className="w-7 flex justify-center">
              {i === 0 ? <Crown className="h-5 w-5 text-amber-500" /> :
               i === 1 ? <Medal className="h-5 w-5 text-slate-300" /> :
               i === 2 ? <Medal className="h-5 w-5 text-amber-700" /> :
               <span className="text-sm font-bold text-muted-foreground">{row.rank}</span>}
            </div>
            <div className="flex-1 text-sm font-medium">{row.username}</div>
            <div className="text-sm font-bold text-amber-500">{formatINR(row.total_won)}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
