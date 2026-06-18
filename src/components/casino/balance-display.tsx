'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { formatINR } from '@/lib/types'

export function BalanceDisplay({ balance, compact = false }: { balance: number; compact?: boolean }) {
  const [hidden, setHidden] = useState(false)
  return (
    <div className={`flex items-center gap-1.5 ${compact ? 'px-2' : 'px-3'} py-1.5 rounded-full bg-card border border-violet-500/30`}>
      <div className="text-right">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">Balance</div>
        <div className="text-sm font-bold text-violet-400 leading-tight">
          {hidden ? '₹ ••••' : formatINR(balance)}
        </div>
      </div>
      <button
        onClick={() => setHidden(!hidden)}
        className="p-1 text-muted-foreground hover:text-foreground"
        aria-label="Toggle balance visibility"
      >
        {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
