import { NextRequest, NextResponse } from 'next/server'
import { recordEvent } from '@/lib/agentfix-store'

// Public endpoint — receives batched events from agentfix.js client.
// No auth required (the client script can't authenticate), but we rate-limit
// by accepting max 50 events per request.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const events = Array.isArray(body?.events) ? body.events : []

    if (events.length === 0) {
      return NextResponse.json({ ok: true, recorded: 0 })
    }

    // Cap at 50 events per request to prevent abuse
    const capped = events.slice(0, 50)

    for (const event of capped) {
      if (!event || typeof event !== 'object') continue
      recordEvent({
        id: 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        type: String(event.type || 'unknown'),
        message: event.message ? String(event.message).slice(0, 2000) : undefined,
        url: event.url ? String(event.url) : undefined,
        session: event.session ? String(event.session) : undefined,
        timestamp: event.timestamp || new Date().toISOString(),
        userAgent: event.userAgent ? String(event.userAgent).slice(0, 500) : undefined,
        // Preserve extra fields (filename, line, stack, status, duration, etc.)
        ...Object.fromEntries(
          Object.entries(event).filter(([k]) =>
            !['type', 'message', 'url', 'session', 'timestamp', 'userAgent'].includes(k)
          )
        ),
      })
    }

    return NextResponse.json({ ok: true, recorded: capped.length })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
  }
}
