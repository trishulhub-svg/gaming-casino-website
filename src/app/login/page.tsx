'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, useToastStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/dashboard'
  const { setUser } = useAuthStore()
  const { push } = useToastStore()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const j = await r.json()
      if (j.ok) {
        // Fetch profile to populate store
        const profRes = await fetch('/api/user/profile')
        const prof = await profRes.json()
        if (prof.ok) {
          setUser({
            id: prof.data.id, username: prof.data.username, email: prof.data.email,
            phone: prof.data.phone, balance: prof.data.balance, avatar_url: prof.data.avatar_url,
            role: prof.data.role, referral_code: prof.data.referral_code,
          })
        }
        push({ type: 'success', message: 'Logged in successfully' })
        router.push(next)
      } else {
        push({ type: 'error', message: j.error || 'Login failed' })
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
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Log in to your account</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="identifier">Username or Email</Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-background"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="hover:text-amber-500">Forgot password?</Link>
        </div>
        <div className="mt-4 pt-4 border-t border-border text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-amber-500 font-semibold hover:underline">Sign up</Link>
        </div>
        <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300">
          <strong>Demo admin:</strong> admin / Admin@2026
        </div>
      </Card>
    </div>
  )
}
