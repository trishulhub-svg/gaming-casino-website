'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, useToastStore } from '@/lib/store'
import { User as UserIcon, Lock, Banknote } from 'lucide-react'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore()
  const { push } = useToastStore()
  const [tab, setTab] = useState<'profile' | 'password' | 'bank'>('profile')

  if (!isAuthenticated || !user) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Please log in.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <div className="flex gap-2 mb-6">
        <Button variant={tab === 'profile' ? 'default' : 'outline'} onClick={() => setTab('profile')} className={tab === 'profile' ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : ''}>
          <UserIcon className="h-4 w-4 mr-1" /> Profile
        </Button>
        <Button variant={tab === 'password' ? 'default' : 'outline'} onClick={() => setTab('password')} className={tab === 'password' ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : ''}>
          <Lock className="h-4 w-4 mr-1" /> Password
        </Button>
        <Button variant={tab === 'bank' ? 'default' : 'outline'} onClick={() => setTab('bank')} className={tab === 'bank' ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : ''}>
          <Banknote className="h-4 w-4 mr-1" /> Bank
        </Button>
      </div>

      {tab === 'profile' && <ProfileForm user={user} push={push} />}
      {tab === 'password' && <PasswordForm push={push} />}
      {tab === 'bank' && <BankForm push={push} />}
    </div>
  )
}

function ProfileForm({ user, push }: { user: { username: string; email: string; phone: string | null }; push: (t: { type: 'success' | 'error' | 'info'; message: string }) => void }) {
  const [form, setForm] = useState({ username: user.username, email: user.email, phone: user.phone || '' })
  const [loading, setLoading] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const j = await r.json()
      if (j.ok) push({ type: 'success', message: 'Profile updated' })
      else push({ type: 'error', message: j.error || 'Failed' })
    } finally { setLoading(false) }
  }
  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="u">Username</Label>
          <Input id="u" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="bg-background" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e">Email</Label>
          <Input id="e" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-background" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p">Phone</Label>
          <Input id="p" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-background" />
        </div>
        <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Card>
  )
}

function PasswordForm({ push }: { push: (t: { type: 'success' | 'error' | 'info'; message: string }) => void }) {
  const [form, setForm] = useState({ current_password: '', new_password: '' })
  const [loading, setLoading] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const j = await r.json()
      if (j.ok) { push({ type: 'success', message: 'Password changed' }); setForm({ current_password: '', new_password: '' }) }
      else push({ type: 'error', message: j.error || 'Failed' })
    } finally { setLoading(false) }
  }
  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cp">Current Password</Label>
          <Input id="cp" type="password" value={form.current_password} onChange={e => setForm({ ...form, current_password: e.target.value })} required className="bg-background" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="np">New Password</Label>
          <Input id="np" type="password" value={form.new_password} onChange={e => setForm({ ...form, new_password: e.target.value })} required minLength={6} className="bg-background" />
        </div>
        <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </form>
    </Card>
  )
}

function BankForm({ push }: { push: (t: { type: 'success' | 'error' | 'info'; message: string }) => void }) {
  const [form, setForm] = useState({ account_name: '', account_number: '', ifsc: '', upi_id: '' })
  const [loading, setLoading] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/user/update-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const j = await r.json()
      if (j.ok) { push({ type: 'success', message: 'Bank details saved' }); setForm({ account_name: '', account_number: '', ifsc: '', upi_id: '' }) }
      else push({ type: 'error', message: j.error || 'Failed' })
    } finally { setLoading(false) }
  }
  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="an">Account Holder Name</Label>
          <Input id="an" value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })} className="bg-background" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="acc">Account Number</Label>
            <Input id="acc" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} className="bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifsc">IFSC</Label>
            <Input id="ifsc" value={form.ifsc} onChange={e => setForm({ ...form, ifsc: e.target.value })} className="bg-background" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="upi">UPI ID</Label>
          <Input id="upi" value={form.upi_id} onChange={e => setForm({ ...form, upi_id: e.target.value })} placeholder="name@upi" className="bg-background" />
        </div>
        <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
          {loading ? 'Saving...' : 'Save Bank Details'}
        </Button>
      </form>
    </Card>
  )
}
