'use client'

import { useEffect, useState } from 'react'
import { Crown, Medal, Trophy } from 'lucide-react'
import { formatINR } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { STATIC_LEADERBOARD } from '@/lib/static-data'

interface LeaderRow {
  rank: number
  username: string
  total_won: number
}

export function Leaderboard() {
  // Start with static data so leaderboard is NEVER blank
  const [rows, setRows] = useState<LeaderRow[]>(STATIC_LEADERBOARD)

  useEffect(() => {
    fetch('/api/public/leaderboard')
      .then(r => r.json())
      .then(j => {
        if (j?.ok && j.data && j.data.length > 0) setRows(j.data)
      })
      .catch(() => {})
  }, [])

  return (
    <Card className="overflow-hidden p-0 border-violet-500/20">
      <div className="gradient-primary p-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-white" />
        <h3 className="font-bold text-white">Today&apos;s Top Winners</h3>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row, i) => (
          <div key={row.rank} className="flex items-center gap-3 p-3 hover:bg-violet-500/5">
            <div className="w-7 flex justify-center">
              {i === 0 ? <Crown className="h-5 w-5 text-yellow-400" /> :
               i === 1 ? <Medal className="h-5 w-5 text-slate-300" /> :
               i === 2 ? <Medal className="h-5 w-5 text-yellow-600" /> :
               <span className="text-sm font-bold text-muted-foreground">{row.rank}</span>}
            </div>
            <div className="flex-1 text-sm font-medium">{row.username}</div>
            <div className="text-sm font-bold text-emerald-400">{formatINR(row.total_won)}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
