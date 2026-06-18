'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatINR } from '@/lib/types'
import { useToastStore } from '@/lib/store'
import { Users, Gamepad2, IndianRupee, Clock, Check, X } from 'lucide-react'

type Tab = 'overview' | 'users' | 'transactions' | 'games'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [data, setData] = useState<{
    totals?: { users: number; games: number; pending_wd: number; revenue: number; bets: number }
    recentTx?: Array<{ id: number; user_id: number; username: string; type: string; amount: number; status: string; created_at: string }>
    users?: Array<{ id: number; username: string; email: string; balance: number; role: string; is_active: number; created_at: string }>
    games?: Array<{ id: number; name: string; category: string; provider: string | null; is_active: number; is_popular: number }>
  }>({})
  const { push } = useToastStore()

  const loadAll = async () => {
    const [dash, users, games, tx] = await Promise.all([
      fetch('/api/admin/dashboard').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/games').then(r => r.json()),
      fetch('/api/admin/transactions?limit=50').then(r => r.json()),
    ])
    setData({
      totals: dash?.data?.totals,
      recentTx: tx?.data,
      users: users?.data,
      games: games?.data,
    })
  }

  useEffect(() => { loadAll() }, [])

  const approveTx = async (id: number, action: 'approve' | 'reject', userId: number, amount: number) => {
    const r = await fetch('/api/admin/transactions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, user_id: userId, amount }),
    })
    const j = await r.json()
    if (j.ok) { push({ type: 'success', message: `Withdrawal ${action}d` }); loadAll() }
    else push({ type: 'error', message: j.error || 'Failed' })
  }

  const toggleGameActive = async (id: number, currentActive: number) => {
    const r = await fetch('/api/admin/games', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: currentActive ? 0 : 1, is_popular: 0, min_bet: 10, max_bet: 10000, rtp_percentage: 96 }),
    })
    const j = await r.json()
    if (j.ok) { push({ type: 'success', message: 'Game updated' }); loadAll() }
    else push({ type: 'error', message: j.error || 'Failed' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
      <p className="text-muted-foreground mb-6">Platform management dashboard.</p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['overview', 'users', 'transactions', 'games'] as Tab[]).map(t => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)}
            className={tab === t ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 capitalize' : 'capitalize'}>
            {t}
          </Button>
        ))}
      </div>

      {tab === 'overview' && data.totals && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat icon={<Users className="h-5 w-5" />} label="Total Users" value={String(data.totals.users)} />
            <Stat icon={<Gamepad2 className="h-5 w-5" />} label="Total Games" value={String(data.totals.games)} />
            <Stat icon={<IndianRupee className="h-5 w-5" />} label="Total Deposits" value={formatINR(data.totals.revenue)} />
            <Stat icon={<Clock className="h-5 w-5" />} label="Pending WD" value={String(data.totals.pending_wd)} />
            <Stat icon={<Gamepad2 className="h-5 w-5" />} label="Total Bets" value={String(data.totals.bets)} />
          </div>
          <Card className="p-4">
            <h3 className="font-bold mb-3">Recent Transactions</h3>
            <TxTable rows={data.recentTx || []} />
          </Card>
        </div>
      )}

      {tab === 'users' && (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left">
              <tr>
                <th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Username</th><th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Balance</th><th className="py-2 pr-3">Role</th><th className="py-2 pr-3">Status</th>
                <th className="py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(data.users || []).map(u => (
                <tr key={u.id} className="border-t border-border">
                  <td className="py-2 pr-3">{u.id}</td>
                  <td className="py-2 pr-3 font-medium">{u.username}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{u.email}</td>
                  <td className="py-2 pr-3 text-amber-500">{formatINR(u.balance)}</td>
                  <td className="py-2 pr-3"><Badge variant="outline">{u.role}</Badge></td>
                  <td className="py-2 pr-3">{u.is_active ? '✅' : '❌'}</td>
                  <td className="py-2 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'transactions' && (
        <Card className="p-4">
          <h3 className="font-bold mb-3">Withdrawals Pending Approval</h3>
          <TxTable
            rows={(data.recentTx || []).filter(t => t.type === 'withdrawal' && t.status === 'pending')}
            onApprove={approveTx}
          />
        </Card>
      )}

      {tab === 'games' && (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left">
              <tr>
                <th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Provider</th><th className="py-2 pr-3">Popular</th><th className="py-2 pr-3">Active</th><th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.games || []).map(g => (
                <tr key={g.id} className="border-t border-border">
                  <td className="py-2 pr-3">{g.id}</td>
                  <td className="py-2 pr-3 font-medium">{g.name}</td>
                  <td className="py-2 pr-3">{g.category}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{g.provider || '—'}</td>
                  <td className="py-2 pr-3">{g.is_popular ? '⭐' : ''}</td>
                  <td className="py-2 pr-3">{g.is_active ? '✅' : '❌'}</td>
                  <td className="py-2">
                    <Button size="sm" variant="outline" onClick={() => toggleGameActive(g.id, g.is_active)}>
                      {g.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-amber-500 mb-1">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  )
}

function TxTable({ rows, onApprove }: {
  rows: Array<{ id: number; user_id: number; username: string; type: string; amount: number; status: string; created_at: string }>
  onApprove?: (id: number, action: 'approve' | 'reject', userId: number, amount: number) => void
}) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground text-center py-6">No transactions.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted-foreground text-left">
          <tr>
            <th className="py-2 pr-3">ID</th><th className="py-2 pr-3">User</th><th className="py-2 pr-3">Type</th>
            <th className="py-2 pr-3">Amount</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Date</th>
            {onApprove && <th className="py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(t => (
            <tr key={t.id} className="border-t border-border">
              <td className="py-2 pr-3">{t.id}</td>
              <td className="py-2 pr-3 font-medium">{t.username}</td>
              <td className="py-2 pr-3 capitalize">{t.type}</td>
              <td className="py-2 pr-3 text-amber-500">{formatINR(t.amount)}</td>
              <td className="py-2 pr-3">
                <Badge variant="outline" className={
                  t.status === 'completed' ? 'border-green-500/40 text-green-500' :
                  t.status === 'pending' ? 'border-amber-500/40 text-amber-500' :
                  'border-red-500/40 text-red-500'
                }>{t.status}</Badge>
              </td>
              <td className="py-2 pr-3 text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
              {onApprove && t.status === 'pending' && (
                <td className="py-2 flex gap-1">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7 px-2" onClick={() => onApprove(t.id, 'approve', t.user_id, t.amount)}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-red-400" onClick={() => onApprove(t.id, 'reject', t.user_id, t.amount)}>
                    <X className="h-3 w-3" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
