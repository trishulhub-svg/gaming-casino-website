'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { BalanceDisplay } from './balance-display'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Wallet, LogOut, User, LayoutDashboard, Gift, Users, LifeBuoy, Shield, Menu, X
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/games/slots', label: 'Slots' },
  { href: '/games/lottery', label: 'Lottery' },
  { href: '/games/sports', label: 'Sports' },
  { href: '/games/casino', label: 'Casino' },
  { href: '/games/mini', label: 'Mini' },
  { href: '/promotions', label: 'Promos' },
]

export function SiteHeader() {
  const router = useRouter()
  const { user, isAuthenticated, logout, setUser } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    // Fetch current user once on mount (silent — no error if not logged in)
    fetch('/api/user/profile', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(j => j?.ok && j.data && setUser({
        id: j.data.id, username: j.data.username, email: j.data.email,
        phone: j.data.phone, balance: j.data.balance, avatar_url: j.data.avatar_url,
        role: j.data.role, referral_code: j.data.referral_code,
      }))
      .catch(() => {})
  }, [setUser])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-900">
              T
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline">
              Trishul<span className="text-amber-500">Casino</span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card rounded-md transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {hydrated && isAuthenticated && user ? (
            <>
              <BalanceDisplay balance={user.balance} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-card transition-colors">
                    <Avatar className="w-8 h-8 border border-amber-500/30">
                      <AvatarFallback className="bg-amber-500 text-slate-900 text-xs font-bold">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/wallet')}>
                    <Wallet className="mr-2 h-4 w-4" /> Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/promotions')}>
                    <Gift className="mr-2 h-4 w-4" /> Promotions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/referral')}>
                    <Users className="mr-2 h-4 w-4" /> Referrals
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/support')}>
                    <LifeBuoy className="mr-2 h-4 w-4" /> Support
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}

          <button className="lg:hidden p-2 rounded-md hover:bg-card" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-card/95 backdrop-blur">
          <div className="container mx-auto px-4 py-3 grid grid-cols-2 gap-2">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-md">
                {l.label}
              </Link>
            ))}
            {/* Discreet admin/staff login link at bottom of mobile nav */}
            <Link href="/login?admin=1"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-xs text-muted-foreground/50 hover:text-amber-500 col-span-2 border-t border-border mt-2 pt-3">
              Staff Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
