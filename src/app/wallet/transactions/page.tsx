'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatINR, type Transaction } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TransactionsPage({ filterType }: { filterType?: string }) {
  const [txs, setTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<string>(filterType || 'all')

  useEffect(() => {
    setLoading(true)
    const url = type === 'all' ? '/api/wallet/transactions?limit=100' : `/api/wallet/transactions?type=${type}&limit=100`
    fetch(url).then(r => r.json()).then(j => { setTxs(j?.ok ? j.data || [] : []); setLoading(false) })
  }, [type])

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{filterType ? `${filterType} history` : 'Transactions'}</h1>
        {!filterType && (
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="bet">Bets</SelectItem>
              <SelectItem value="win">Wins</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      {loading ? (
        <Card className="p-6 text-center text-muted-foreground">Loading...</Card>
      ) : txs.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">No transactions found.</Card>
      ) : (
        <Card className="divide-y divide-border p-0">
          {txs.map(t => (
            <div key={t.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{t.type}</span>
                  <Badge variant="outline" className={`text-[10px] ${
                    t.status === 'completed' ? 'border-green-500/40 text-green-500' :
                    t.status === 'pending' ? 'border-amber-500/40 text-amber-500' :
                    'border-red-500/40 text-red-500'
                  }`}>{t.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{t.notes || '—'}</div>
                <div className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
              </div>
              <div className={`text-lg font-bold ${
                ['deposit', 'win', 'bonus', 'referral'].includes(t.type) ? 'text-green-400' : 'text-red-400'
              }`}>
                {['deposit', 'win', 'bonus', 'referral'].includes(t.type) ? '+' : '-'}{formatINR(t.amount)}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
