import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from './lib/auth-edge'

// Public site — no login required to browse.
// Only /admin routes (and /api/admin/*) require admin authentication.
const ADMIN_PREFIXES = ['/admin', '/api/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only enforce auth on admin routes
  if (!ADMIN_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check session token for admin routes
  const token = req.cookies.get('tc_session')?.value
  const payload = token ? await verifyTokenEdge(token) : null

  if (!payload || payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/login?next=' + encodeURIComponent(pathname) + '&admin=1', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
