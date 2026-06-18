'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToastStore } from '@/lib/store'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const { push } = useToastStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const j = await r.json()
      if (j.ok) {
        setSent(true)
        push({ type: 'success', message: 'Reset link sent (demo)' })
      } else {
        push({ type: 'error', message: j.error || 'Failed' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>
        {sent ? (
          <div className="p-3 bg-green-950/30 border border-green-500/30 rounded text-sm text-green-300">
            If an account exists with that email, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-background" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
        <div className="mt-4 pt-4 border-t border-border text-center text-sm">
          <Link href="/login" className="text-amber-500 hover:underline">← Back to login</Link>
        </div>
      </Card>
    </div>
  )
}
