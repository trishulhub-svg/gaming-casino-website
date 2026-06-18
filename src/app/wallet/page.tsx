'use client'
export const dynamic = 'force-dynamic'

import { useAuthStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BalanceDisplay } from '@/components/casino/balance-display'
import { LoginRequired } from '@/components/casino/login-required'
import Link from 'next/link'
import { ArrowDownToLine, ArrowUpFromLine, History } from 'lucide-react'

export default function WalletPage() {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated || !user) {
    return <LoginRequired next="/wallet" title="Login to Access Your Wallet" />
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>
      <Card className="p-6 mb-6 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
        <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
        <div className="text-4xl font-bold text-amber-500 mb-4">{BalanceDisplay ? null : null}</div>
        <BalanceDisplay balance={user.balance} />
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-slate-900">
            <Link href="/wallet/deposit"><ArrowDownToLine className="h-4 w-4 mr-1" /> Deposit</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/wallet/withdraw"><ArrowUpFromLine className="h-4 w-4 mr-1" /> Withdraw</Link>
          </Button>
        </div>
      </Card>
      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="p-4 hover:border-amber-500/50">
          <Link href="/wallet/transactions" className="block">
            <History className="h-5 w-5 text-amber-500 mb-2" />
            <div className="font-semibold">All Transactions</div>
            <div className="text-xs text-muted-foreground">View full history</div>
          </Link>
        </Card>
        <Card className="p-4 hover:border-amber-500/50">
          <Link href="/wallet/deposit-history" className="block">
            <ArrowDownToLine className="h-5 w-5 text-green-500 mb-2" />
            <div className="font-semibold">Deposit History</div>
            <div className="text-xs text-muted-foreground">All deposits</div>
          </Link>
        </Card>
        <Card className="p-4 hover:border-amber-500/50">
          <Link href="/wallet/withdrawal-history" className="block">
            <ArrowUpFromLine className="h-5 w-5 text-red-500 mb-2" />
            <div className="font-semibold">Withdrawal History</div>
            <div className="text-xs text-muted-foreground">All withdrawals</div>
          </Link>
        </Card>
      </div>
    </div>
  )
}
