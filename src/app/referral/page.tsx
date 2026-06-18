'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore, useToastStore } from '@/lib/store'
import { formatINR } from '@/lib/types'
import { Copy, Users, Gift, Share2 } from 'lucide-react'
import { LoginRequired } from '@/components/casino/login-required'

export default function ReferralPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { push } = useToastStore()
  const [stats, setStats] = useState<{ referral_code: string; total_referrals: number; total_commission: number; active_referrals: number } | null>(null)
  const [list, setList] = useState<{ id: number; username: string; commission_earned: number; created_at: string; is_active: number }[]>([])

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/referrals/stats').then(r => r.json()).then(j => j?.ok && setStats(j.data))
    fetch('/api/referrals/list').then(r => r.json()).then(j => j?.ok && setList(j.data || []))
  }, [isAuthenticated])

  if (!isAuthenticated || !user) {
    return <LoginRequired next="/referral" title="Login to Access Referrals" />
  }

  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user.referral_code}`

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    push({ type: 'success', message: `${label} copied!` })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Referral Program</h1>

      <Card className="p-6 mb-6 bg-gradient-to-br from-amber-500/15 to-transparent border-amber-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Gift className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Earn ₹500 per friend!</h2>
            <p className="text-sm text-muted-foreground">Get ₹500 when your friend deposits ₹1,000.</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Your Referral Code</label>
            <div className="flex gap-2">
              <Input value={user.referral_code} readOnly className="bg-background font-mono" />
              <Button onClick={() => copy(user.referral_code, 'Code')} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Your Referral Link</label>
            <div className="flex gap-2">
              <Input value={link} readOnly className="bg-background text-xs" />
              <Button onClick={() => copy(link, 'Link')} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={() => copy(link, 'Link')} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
            <Share2 className="h-4 w-4 mr-1" /> Share Link
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 text-center">
          <Users className="h-5 w-5 text-amber-500 mx-auto mb-1" />
          <div className="text-2xl font-bold">{stats?.total_referrals ?? 0}</div>
          <div className="text-xs text-muted-foreground">Total Referrals</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{formatINR(stats?.total_commission ?? 0)}</div>
          <div className="text-xs text-muted-foreground">Commission Earned</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{stats?.active_referrals ?? 0}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-bold mb-3">Referred Users</h3>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No referrals yet. Share your link!</p>
        ) : (
          <div className="divide-y divide-border">
            {list.map(r => (
              <div key={r.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{r.username}</div>
                  <div className="text-[10px] text-muted-foreground">Joined {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-amber-500 font-semibold">{formatINR(r.commission_earned)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
