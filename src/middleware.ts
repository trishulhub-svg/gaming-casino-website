import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from './lib/auth-edge'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/games',
  '/promotions',
  '/support',
]

const PUBLIC_PREFIXES = [
  '/api/auth/',
  '/api/games',
  '/api/public/',
  '/api/health',
  '/_next/',
  '/favicon.ico',
  '/logo.svg',
  '/icons/',
  '/manifest.json',
  '/sw.js',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check session token
  const token = req.cookies.get('tc_session')?.value
  const payload = token ? await verifyTokenEdge(token) : null

  // Admin route protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!payload || payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/login?next=' + encodeURIComponent(pathname), req.url))
    }
  }

  // Any other protected path requires auth
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login?next=' + encodeURIComponent(pathname), req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
