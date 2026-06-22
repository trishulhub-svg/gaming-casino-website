// In-memory event store for AgentFix.
// Events are kept for the lifetime of the serverless function instance.
// On Vercel, each function instance has its own memory — for production
// you'd want to persist to Turso/Sentry/Logflare, but this gives a real-time
// view during a session.

interface AgentFixEvent {
  id: string
  type: string
  message?: string
  url?: string
  session?: string
  timestamp: string
  userAgent?: string
  [key: string]: unknown
}

declare global {
  // eslint-disable-next-line no-var
  var __AGENTFIX_EVENTS__: AgentFix[] | undefined
  // eslint-disable-next-line no-var
  var __AGENTFIX_SESSIONS__: Map<string, { firstSeen: string; lastSeen: string; eventCount: number; url: string }> | undefined
}

interface AgentFix {
  events: AgentFixEvent[]
  sessions: Map<string, { firstSeen: string; lastSeen: string; eventCount: number; url: string }>
}

function getStore(): AgentFix {
  if (!globalThis.__AGENTFIX_EVENTS__) {
    globalThis.__AGENTFIX_EVENTS__ = []
  }
  if (!globalThis.__AGENTFIX_SESSIONS__) {
    globalThis.__AGENTFIX_SESSIONS__ = new Map()
  }
  return {
    events: globalThis.__AGENTFIX_EVENTS__,
    sessions: globalThis.__AGENTFIX_SESSIONS__,
  }
}

const MAX_EVENTS = 500 // Keep last 500 events

export function recordEvent(event: AgentFixEvent): void {
  const store = getStore()

  // Record event
  store.events.unshift(event) // newest first
  if (store.events.length > MAX_EVENTS) {
    store.events.length = MAX_EVENTS
  }

  // Update session tracking
  if (event.session) {
    const existing = store.sessions.get(event.session)
    if (existing) {
      existing.lastSeen = event.timestamp
      existing.eventCount++
      if (event.url) existing.url = event.url
    } else {
      store.sessions.set(event.session, {
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        eventCount: 1,
        url: event.url || '',
      })
    }
    // Cap sessions map size
    if (store.sessions.size > 100) {
      const oldestKey = store.sessions.keys().next().value
      if (oldestKey) store.sessions.delete(oldestKey)
    }
  }
}

export function getEvents(filter?: { type?: string; session?: string; limit?: number }): AgentFixEvent[] {
  const store = getStore()
  let events = store.events
  if (filter?.type) events = events.filter(e => e.type === filter.type)
  if (filter?.session) events = events.filter(e => e.session === filter.session)
  if (filter?.limit) events = events.slice(0, filter.limit)
  return events
}

export function getSessions() {
  const store = getStore()
  return Array.from(store.sessions.entries()).map(([id, s]) => ({ id, ...s }))
}

export function getStats() {
  const store = getStore()
  const events = store.events
  const byType: Record<string, number> = {}
  for (const e of events) {
    byType[e.type] = (byType[e.type] || 0) + 1
  }
  return {
    totalEvents: events.length,
    totalSessions: store.sessions.size,
    byType,
    errorCount: events.filter(e =>
      e.type === 'js_error' ||
      e.type === 'promise_rejection' ||
      e.type === 'console_error' ||
      e.type === 'fetch_error' ||
      e.type === 'fetch_failed'
    ).length,
    oldestEvent: events.length > 0 ? events[events.length - 1].timestamp : null,
    newestEvent: events.length > 0 ? events[0].timestamp : null,
  }
}

export function clearEvents(): void {
  const store = getStore()
  store.events.length = 0
  store.sessions.clear()
}
