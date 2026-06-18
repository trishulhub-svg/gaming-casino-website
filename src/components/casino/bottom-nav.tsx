'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { Home, Gamepad2, Wallet, Gift, User } from 'lucide-react'

// Public items — always shown
const publicItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/games/popular', label: 'Games', icon: Gamepad2 },
  { href: '/promotions', label: 'Promos', icon: Gift },
  { href: '/support', label: 'Support', icon: User },
]

// Authenticated-only items
const authItems = [
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard', label: 'Me', icon: User },
]

export function BottomNav() {
  const { isAuthenticated } = useAuthStore()
  const items = isAuthenticated
    ? [...publicItems.slice(0, 3), ...authItems]
    : publicItems
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border">
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-amber-500 transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
