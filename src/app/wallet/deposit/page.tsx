'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, useToastStore } from '@/lib/store'
import { formatINR } from '@/lib/types'
import { LoginRequired } from '@/components/casino/login-required'

interface Method { id: string; name: string; min: number; max: number; fee: number; eta: string; icon: string }

export default function DepositPage() {
  const { user, isAuthenticated, updateBalance } = useAuthStore()
  const { push } = useToastStore()
  const [methods, setMethods] = useState<Method[]>([])
  const [selected, setSelected] = useState<string>('upi')
  const [amount, setAmount] = useState(500)
  const [ref, setRef] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/wallet/deposit-methods').then(r => r.json()).then(j => j?.ok && setMethods(j.data || []))
  }, [])

  if (!isAuthenticated || !user) {
    return <LoginRequired next="/wallet/deposit" title="Login to Deposit" />
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: selected, ref }),
      })
      const j = await r.json()
      if (j.ok) {
        updateBalance(j.data.balance)
        push({ type: 'success', message: `Deposited ${formatINR(amount)}! Ref: ${j.data.ref}` })
        setRef('')
      } else {
        push({ type: 'error', message: j.error || 'Deposit failed' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Deposit Funds</h1>
      {user && (
        <Card className="p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Balance</span>
          <span className="text-xl font-bold text-amber-500">{formatINR(user.balance)}</span>
        </Card>
      )}
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Select Method</Label>
            <div className="grid grid-cols-2 gap-2">
              {methods.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selected === m.id ? 'border-amber-500 bg-amber-500/10' : 'border-border hover:border-amber-500/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground">Min {formatINR(m.min)} · Max {formatINR(m.max)}</div>
                  <div className="text-[10px] text-green-500">{m.eta}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required className="bg-background" />
            <div className="flex gap-1.5">
              {[100, 500, 1000, 5000].map(v => (
                <Button key={v} type="button" size="sm" variant="outline" onClick={() => setAmount(v)} className="flex-1 text-xs">₹{v}</Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ref">UTR / Reference (optional)</Label>
            <Input id="ref" value={ref} onChange={e => setRef(e.target.value)} placeholder="Transaction reference" className="bg-background" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
            {loading ? 'Processing...' : `Deposit ${formatINR(amount)}`}
          </Button>
        </form>
      </Card>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Demo mode: deposits are credited instantly. In production, integrate a payment gateway (Razorpay / Cashfree / USDT gateway).
      </p>
    </div>
  )
}
