'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, useToastStore } from '@/lib/store'

export default function RegisterPage() {
  const router = useRouter()
  const search = useSearchParams()
  const referral = search.get('ref') || ''
  const { setUser } = useAuthStore()
  const { push } = useToastStore()
  const [form, setForm] = useState({
    username: '', email: '', phone: '', password: '', confirm: '', referral_code: referral,
  })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      push({ type: 'error', message: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username, email: form.email, phone: form.phone,
          password: form.password, referral_code: form.referral_code || undefined,
        }),
      })
      const j = await r.json()
      if (j.ok) {
        const profRes = await fetch('/api/user/profile')
        const prof = await profRes.json()
        if (prof.ok) {
          setUser({
            id: prof.data.id, username: prof.data.username, email: prof.data.email,
            phone: prof.data.phone, balance: prof.data.balance, avatar_url: prof.data.avatar_url,
            role: prof.data.role, referral_code: prof.data.referral_code,
          })
        }
        push({ type: 'success', message: 'Account created!' })
        router.push('/dashboard')
      } else {
        push({ type: 'error', message: j.error || 'Registration failed' })
      }
    } catch {
      push({ type: 'error', message: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join TrishulCasino & claim 100% welcome bonus</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username *</Label>
            <Input id="username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required minLength={3} className="bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91..." className="bg-background" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm *</Label>
              <Input id="confirm" type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required minLength={6} className="bg-background" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ref">Referral Code (optional)</Label>
            <Input id="ref" value={form.referral_code} onChange={e => setForm({ ...form, referral_code: e.target.value })} className="bg-background" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-4 pt-4 border-t border-border text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-500 font-semibold hover:underline">Log in</Link>
        </div>
        <p className="mt-4 text-[11px] text-center text-muted-foreground">
          By signing up you confirm you are 18+ and agree to our Terms of Service.
        </p>
      </Card>
    </div>
  )
}
