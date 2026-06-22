import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from './lib/auth-edge'

// Public site — no login required to browse.
// Only these routes require admin authentication:
//   /admin, /api/admin/*, /agentfix (dashboard), /api/agentfix/events, /api/agentfix/stats, /api/agentfix/clear
// Public agentfix routes (no auth): /api/agentfix/report, /api/agentfix/health
const ADMIN_PROTECTED_PREFIXES = [
  '/admin',
  '/api/admin',
  '/agentfix',
]
const ADMIN_PROTECTED_EXACT = [
  '/api/agentfix/events',
  '/api/agentfix/stats',
  '/api/agentfix/clear',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected =
    ADMIN_PROTECTED_PREFIXES.some(p => pathname.startsWith(p)) ||
    ADMIN_PROTECTED_EXACT.some(p => pathname === p)

  if (!isProtected) {
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
