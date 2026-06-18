'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

interface Props {
  title?: string
  description?: string
  next?: string
}

export function LoginRequired({
  title = 'Login Required',
  description = 'This area is for registered members only. Browse our games and promotions freely — login only when you want to play, deposit, or withdraw.',
  next,
}: Props) {
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login'
  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <Lock className="h-7 w-7 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div className="space-y-2">
          <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
            <Link href={loginHref}>Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
        <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
          Want to keep browsing?{' '}
          <Link href="/games/popular" className="text-amber-500 hover:underline">View all games</Link>
        </div>
      </Card>
    </div>
  )
}
