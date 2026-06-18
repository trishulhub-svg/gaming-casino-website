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
import { Zap, Shield, Trophy } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/dashboard'
  const isAdmin = search.get('admin') === '1'
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
      <Card className="p-8 border-violet-500/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-3">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            {isAdmin ? 'Staff Login' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Admin / staff access only' : 'Log in to your account'}
          </p>
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
              placeholder="admin"
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
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary border-0 hover:opacity-90 font-bold">
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="hover:text-violet-400">Forgot password?</Link>
        </div>
        {!isAdmin && (
          <div className="mt-4 pt-4 border-t border-border text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-violet-400 font-semibold hover:underline">Sign up</Link>
          </div>
        )}
        {isAdmin && (
          <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/30 rounded text-xs text-violet-300">
            <div className="font-bold mb-1">Demo admin credentials:</div>
            <div>Username: <code className="bg-background px-1.5 py-0.5 rounded">admin</code></div>
            <div>Password: <code className="bg-background px-1.5 py-0.5 rounded">Admin@2026</code></div>
          </div>
        )}
      </Card>
      {!isAdmin && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1 p-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Secure</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2">
            <Zap className="h-4 w-4 text-violet-400" />
            <span>Instant</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span>Fair Play</span>
          </div>
        </div>
      )}
    </div>
  )
}
