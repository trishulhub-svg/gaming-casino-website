'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '@/components/ui/dialog'
import { useToastStore } from '@/lib/store'
import { STATIC_GAMES, STATIC_PROMOTIONS } from '@/lib/static-data'
import { Users, Gamepad2, IndianRupee, Clock, Check, X, Plus, Edit, Trash2, LayoutDashboard, TrendingUp } from 'lucide-react'

type Tab = 'overview' | 'users' | 'transactions' | 'games' | 'promotions'

interface User {
  id: number
  username: string
  email: string
  phone: string | null
  balance: number
  role: string
  is_active: number
  created_at: string
}

interface Transaction {
  id: number
  user_id: number
  username: string
  type: string
  amount: number
  status: string
  payment_method: string | null
  notes: string | null
  created_at: string
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [totals, setTotals] = useState({ users: 1, games: STATIC_GAMES.length, pending_wd: 0, revenue: 0, bets: 0 })
  const [recentTx, setRecentTx] = useState<Transaction[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [txs, setTxs] = useState<Transaction[]>([])
  const [games, setGames] = useState(STATIC_GAMES.map(g => ({ ...g, is_popular: g.is_popular ? 1 : 0, is_active: g.is_active ? 1 : 0 })))
  const [promotions] = useState(STATIC_PROMOTIONS)
  const { push } = useToastStore()

  const loadAll = async () => {
    try {
      const [dash, usersRes, tx] = await Promise.all([
        fetch('/api/admin/dashboard').then(r => r.json()).catch(() => null),
        fetch('/api/admin/users').then(r => r.json()).catch(() => null),
        fetch('/api/admin/transactions?limit=50').then(r => r.json()).catch(() => null),
      ])
      if (dash?.ok && dash.data?.totals) setTotals(dash.data.totals)
      if (dash?.ok && dash.data?.recentTx) setRecentTx(dash.data.recentTx)
      if (usersRes?.ok) setUsers(usersRes.data || [])
      if (tx?.ok) setTxs(tx.data || [])
    } catch (e) {
      // API may fail if env not configured; static data still shows
    }
  }

  useEffect(() => { loadAll() }, [])

  const approveTx = async (id: number, action: 'approve' | 'reject', userId: number, amount: number) => {
    try {
      const r = await fetch('/api/admin/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, user_id: userId, amount }),
      })
      const j = await r.json()
      if (j.ok) {
        push({ type: 'success', message: `Withdrawal ${action}d` })
        loadAll()
      } else push({ type: 'error', message: j.error || 'Failed' })
    } catch {
      push({ type: 'error', message: 'Network error' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <LayoutDashboard className="h-7 w-7 text-violet-400" /> Admin Panel
      </h1>
      <p className="text-muted-foreground mb-6">Platform management dashboard.</p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['overview', 'users', 'transactions', 'games', 'promotions'] as Tab[]).map(t => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)}
            className={tab === t ? 'gradient-primary border-0 hover:opacity-90 capitalize' : 'capitalize'}>
            {t}
          </Button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat icon={<Users className="h-5 w-5" />} label="Total Users" value={String(totals.users)} color="text-violet-400" />
            <Stat icon={<Gamepad2 className="h-5 w-5" />} label="Total Games" value={String(totals.games)} color="text-pink-400" />
            <Stat icon={<IndianRupee className="h-5 w-5" />} label="Total Deposits" value={`₹${totals.revenue.toLocaleString('en-IN')}`} color="text-emerald-400" />
            <Stat icon={<Clock className="h-5 w-5" />} label="Pending WD" value={String(totals.pending_wd)} color="text-amber-400" />
            <Stat icon={<TrendingUp className="h-5 w-5" />} label="Total Bets" value={String(totals.bets)} color="text-blue-400" />
          </div>
          <Card className="p-4 border-violet-500/20">
            <h3 className="font-bold mb-3">Recent Transactions</h3>
            <TxTable rows={recentTx} />
          </Card>
        </div>
      )}

      {tab === 'users' && (
        <Card className="p-4 overflow-x-auto border-violet-500/20">
          <h3 className="font-bold mb-3">All Users ({users.length})</h3>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No users loaded from API. Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set on Vercel.
              The admin user exists in the database — login with admin / Admin@2026.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-left">
                <tr>
                  <th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Username</th><th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Balance</th><th className="py-2 pr-3">Role</th><th className="py-2 pr-3">Status</th>
                  <th className="py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-2 pr-3">{u.id}</td>
                    <td className="py-2 pr-3 font-medium">{u.username}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{u.email}</td>
                    <td className="py-2 pr-3 text-violet-400">₹{u.balance.toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-3"><Badge variant="outline" className="border-violet-500/40 text-violet-400">{u.role}</Badge></td>
                    <td className="py-2 pr-3">{u.is_active ? '✅' : '❌'}</td>
                    <td className="py-2 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === 'transactions' && (
        <Card className="p-4 border-violet-500/20">
          <h3 className="font-bold mb-3">All Transactions</h3>
          <TxTable rows={txs.length > 0 ? txs : recentTx} onApprove={approveTx} />
        </Card>
      )}

      {tab === 'games' && (
        <GamesManager games={games} setGames={setGames} push={push} />
      )}

      {tab === 'promotions' && (
        <Card className="p-4 border-violet-500/20">
          <h3 className="font-bold mb-3">Promotions ({promotions.length})</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {promotions.map(p => (
              <div key={p.id} className={`p-4 rounded-lg bg-gradient-to-br ${p.color} text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">{p.name}</h4>
                  <Badge className="bg-white/20 text-white border-0 capitalize">{p.bonus_type}</Badge>
                </div>
                <p className="text-sm opacity-90 mb-2">{p.description}</p>
                <div className="text-2xl font-black">₹{p.bonus_amount.toLocaleString('en-IN')}</div>
                <div className="text-xs opacity-80 mt-1">Min: ₹{p.min_deposit} · Wager: {p.wagering_requirement}x</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card className="p-4 border-violet-500/20">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  )
}

function TxTable({ rows, onApprove }: {
  rows: Transaction[]
  onApprove?: (id: number, action: 'approve' | 'reject', userId: number, amount: number) => void
}) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground text-center py-6">No transactions yet.</p>
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
              <td className="py-2 pr-3 font-medium">{t.username || `User #${t.user_id}`}</td>
              <td className="py-2 pr-3 capitalize">{t.type}</td>
              <td className="py-2 pr-3 text-violet-400">₹{t.amount.toLocaleString('en-IN')}</td>
              <td className="py-2 pr-3">
                <Badge variant="outline" className={
                  t.status === 'completed' ? 'border-emerald-500/40 text-emerald-400' :
                  t.status === 'pending' ? 'border-amber-500/40 text-amber-400' :
                  'border-red-500/40 text-red-400'
                }>{t.status}</Badge>
              </td>
              <td className="py-2 pr-3 text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
              {onApprove && t.status === 'pending' && (
                <td className="py-2 flex gap-1">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7 px-2" onClick={() => onApprove(t.id, 'approve', t.user_id, t.amount)}>
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

interface AdminGame {
  id: number
  name: string
  category: string
  provider: string
  is_popular: number
  is_active: number
  min_bet: number
  max_bet: number
  rtp_percentage: number
  thumbnail_url: string
}

function GamesManager({ games, setGames, push }: {
  games: AdminGame[]
  setGames: (g: AdminGame[]) => void
  push: (t: { type: 'success' | 'error' | 'info'; message: string }) => void
}) {
  const [editing, setEditing] = useState<AdminGame | null>(null)
  const [adding, setAdding] = useState(false)

  const toggleActive = async (g: AdminGame) => {
    const updated = { ...g, is_active: g.is_active ? 0 : 1 }
    setGames(games.map(x => x.id === g.id ? updated : x))
    try {
      await fetch('/api/admin/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      push({ type: 'success', message: `${g.name} ${updated.is_active ? 'activated' : 'deactivated'}` })
    } catch {
      push({ type: 'info', message: 'Updated locally (API not reachable)' })
    }
  }

  const togglePopular = async (g: AdminGame) => {
    const updated = { ...g, is_popular: g.is_popular ? 0 : 1 }
    setGames(games.map(x => x.id === g.id ? updated : x))
    try {
      await fetch('/api/admin/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      push({ type: 'success', message: `${g.name} ${updated.is_popular ? 'marked as popular' : 'removed from popular'}` })
    } catch {
      push({ type: 'info', message: 'Updated locally' })
    }
  }

  const deleteGame = async (g: AdminGame) => {
    if (!confirm(`Delete "${g.name}"?`)) return
    setGames(games.filter(x => x.id !== g.id))
    try {
      await fetch(`/api/admin/games?id=${g.id}`, { method: 'DELETE' })
      push({ type: 'success', message: `${g.name} deleted` })
    } catch {
      push({ type: 'info', message: 'Deleted locally' })
    }
  }

  const saveGame = async (g: AdminGame) => {
    if (g.id === 0) {
      // New game
      const newId = Math.max(...games.map(x => x.id), 0) + 1
      const newGame = { ...g, id: newId }
      setGames([newGame, ...games])
      try {
        await fetch('/api/admin/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGame),
        })
      } catch {}
      push({ type: 'success', message: 'Game added' })
    } else {
      setGames(games.map(x => x.id === g.id ? g : x))
      try {
        await fetch('/api/admin/games', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(g),
        })
      } catch {}
      push({ type: 'success', message: 'Game updated' })
    }
    setEditing(null)
    setAdding(false)
  }

  return (
    <Card className="p-4 border-violet-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Games ({games.length})</h3>
        <Button onClick={() => setAdding(true)} className="gradient-primary border-0 hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> Add Game
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-left">
            <tr>
              <th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Provider</th><th className="py-2 pr-3">Popular</th><th className="py-2 pr-3">Active</th>
              <th className="py-2 pr-3">Min/Max</th><th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.slice(0, 50).map(g => (
              <tr key={g.id} className="border-t border-border">
                <td className="py-2 pr-3">{g.id}</td>
                <td className="py-2 pr-3 font-medium">{g.name}</td>
                <td className="py-2 pr-3 capitalize">{g.category}</td>
                <td className="py-2 pr-3 text-muted-foreground">{g.provider}</td>
                <td className="py-2 pr-3">
                  <button onClick={() => togglePopular(g)} className="text-lg">{g.is_popular ? '⭐' : '☆'}</button>
                </td>
                <td className="py-2 pr-3">
                  <button onClick={() => toggleActive(g)}>{g.is_active ? '✅' : '❌'}</button>
                </td>
                <td className="py-2 pr-3 text-xs">₹{g.min_bet}-₹{g.max_bet}</td>
                <td className="py-2 flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setEditing(g)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-red-400" onClick={() => deleteGame(g)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing || adding) && (
        <GameEditor
          game={editing || {
            id: 0, name: '', category: 'slots', provider: '', is_popular: 0, is_active: 1,
            min_bet: 10, max_bet: 5000, rtp_percentage: 96, thumbnail_url: ''
          }}
          onSave={saveGame}
          onClose={() => { setEditing(null); setAdding(false) }}
        />
      )}
    </Card>
  )
}

function GameEditor({ game, onSave, onClose }: {
  game: AdminGame
  onSave: (g: AdminGame) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(game)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-violet-500/30 max-w-lg">
        <DialogHeader>
          <DialogTitle>{form.id === 0 ? 'Add New Game' : `Edit: ${form.name}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label>Game Name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-background" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['slots', 'lottery', 'sports', 'casino', 'card', 'fishing', 'mini'].map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Input value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} className="bg-background" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Min Bet</Label>
              <Input type="number" value={form.min_bet} onChange={e => setForm({ ...form, min_bet: Number(e.target.value) })} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>Max Bet</Label>
              <Input type="number" value={form.max_bet} onChange={e => setForm({ ...form, max_bet: Number(e.target.value) })} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>RTP %</Label>
              <Input type="number" step="0.01" value={form.rtp_percentage} onChange={e => setForm({ ...form, rtp_percentage: Number(e.target.value) })} className="bg-background" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Thumbnail URL</Label>
            <Input value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} className="bg-background" placeholder="https://..." />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.is_popular} onChange={e => setForm({ ...form, is_popular: e.target.checked ? 1 : 0 })} />
              Popular
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />
              Active
            </label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={() => onSave(form)} className="gradient-primary border-0 hover:opacity-90">
            {form.id === 0 ? 'Add Game' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
