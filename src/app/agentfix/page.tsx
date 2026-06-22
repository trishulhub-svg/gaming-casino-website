'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertTriangle, Users, Trash2, RefreshCw, Clock, Zap, Terminal, Shield } from 'lucide-react'

interface AgentFixEvent {
  id: string
  type: string
  message?: string
  url?: string
  session?: string
  timestamp: string
  [key: string]: unknown
}

interface Stats {
  totalEvents: number
  totalSessions: number
  byType: Record<string, number>
  errorCount: number
  oldestEvent: string | null
  newestEvent: string | null
}

interface Session {
  id: string
  firstSeen: string
  lastSeen: string
  eventCount: number
  url: string
}

const TYPE_COLORS: Record<string, string> = {
  js_error: 'border-red-500/40 text-red-400',
  promise_rejection: 'border-red-500/40 text-red-400',
  console_error: 'border-orange-500/40 text-orange-400',
  fetch_error: 'border-amber-500/40 text-amber-400',
  fetch_failed: 'border-red-500/40 text-red-400',
  fetch_slow: 'border-yellow-500/40 text-yellow-400',
  page_load: 'border-emerald-500/40 text-emerald-400',
  session_start: 'border-violet-500/40 text-violet-400',
}

export default function AgentFixDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [events, setEvents] = useState<AgentFixEvent[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const load = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fetch('/api/agentfix/stats'),
        fetch(`/api/agentfix/events${filter !== 'all' ? `?type=${filter}&limit=100` : '?limit=100'}`),
      ])
      const s = await statsRes.json()
      const e = await eventsRes.json()
      if (s.ok) {
        setStats(s.stats)
        setSessions(s.sessions || [])
      }
      if (e.ok) setEvents(e.events || [])
    } catch (err) {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    if (!autoRefresh) return
    const id = setInterval(load, 5000) // refresh every 5s
    return () => clearInterval(id)
  }, [filter, autoRefresh])

  const clearEvents = async () => {
    if (!confirm('Clear all AgentFix events? This cannot be undone.')) return
    await fetch('/api/agentfix/clear', { method: 'POST' })
    load()
  }

  const errorRate = stats && stats.totalEvents > 0
    ? ((stats.errorCount / stats.totalEvents) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-7 w-7 text-violet-400" /> AgentFix Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">Real-time monitoring for TrishulCasino</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'gradient-primary border-0' : ''}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Live (5s)' : 'Paused'}
            </Button>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={clearEvents} className="text-red-400">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Total Events"
          value={stats?.totalEvents ?? 0}
          color="text-violet-400"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Errors"
          value={stats?.errorCount ?? 0}
          color="text-red-400"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Active Sessions"
          value={stats?.totalSessions ?? 0}
          color="text-emerald-400"
        />
        <StatCard
          icon={<Terminal className="h-5 w-5" />}
          label="Error Rate"
          value={`${errorRate}%`}
          color="text-amber-400"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Latest"
          value={stats?.newestEvent ? new Date(stats.newestEvent).toLocaleTimeString() : '—'}
          color="text-blue-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Events feed */}
        <div className="lg:col-span-2">
          <Card className="p-4 border-violet-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Live Events</h2>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-card border border-border rounded px-2 py-1 text-sm"
              >
                <option value="all">All types</option>
                <option value="js_error">JS Errors</option>
                <option value="promise_rejection">Promise Rejections</option>
                <option value="console_error">Console Errors</option>
                <option value="fetch_error">Fetch Errors</option>
                <option value="fetch_failed">Fetch Failed</option>
                <option value="fetch_slow">Slow Fetch</option>
                <option value="page_load">Page Load</option>
                <option value="session_start">Session Start</option>
              </select>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading events...</p>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-emerald-500/50 mb-3" />
                <p className="text-muted-foreground">No events yet. The dashboard updates in real time.</p>
                <p className="text-xs text-muted-foreground mt-2">Visit your site to start collecting events.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {events.map(e => (
                  <div key={e.id} className="p-3 bg-background/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="outline" className={`text-[10px] ${TYPE_COLORS[e.type] || 'border-border'}`}>
                        {e.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(e.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {e.message && (
                      <p className="text-sm font-medium truncate">{e.message}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                      {e.url && (
                        <span className="truncate max-w-[300px]">
                          URL: {e.url.replace(/^https?:\/\/[^/]+/, '')}
                        </span>
                      )}
                      {typeof e.status === 'number' && <span>HTTP {e.status}</span>}
                      {typeof e.duration === 'number' && <span>{e.duration}ms</span>}
                      {typeof e.line === 'number' && <span>L{e.line}:{e.column}</span>}
                      {e.filename && <span className="truncate max-w-[200px]">{(e.filename as string).split('/').pop()}</span>}
                    </div>
                    {e.session && (
                      <div className="text-[10px] text-violet-400/60 mt-1 font-mono">
                        sess: {e.session.slice(0, 20)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sessions panel */}
        <div>
          <Card className="p-4 border-violet-500/20">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-400" /> Active Sessions ({sessions.length})
            </h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No sessions yet.</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {sessions.map(s => (
                  <div key={s.id} className="p-2 bg-background/50 rounded border border-border">
                    <div className="font-mono text-[10px] text-violet-400/80 truncate">{s.id}</div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">{s.eventCount} events</span>
                      <span className="text-muted-foreground">{new Date(s.lastSeen).toLocaleTimeString()}</span>
                    </div>
                    {s.url && (
                      <div className="text-[10px] text-muted-foreground truncate mt-1">
                        {s.url.replace(/^https?:\/\/[^/]+/, '')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Health check */}
          <Card className="p-4 border-violet-500/20 mt-4">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" /> Site Health
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endpoint</span>
                <code className="text-violet-400">/api/agentfix/health</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-emerald-400">● Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent</span>
                <span className="text-violet-400">v1.0 active</span>
              </div>
              <div className="pt-2 border-t border-border mt-2">
                <p className="text-muted-foreground text-[10px]">
                  Use this URL with UptimeRobot or Vercel Cron for uptime monitoring:
                </p>
                <code className="block text-[10px] text-violet-400 mt-1 p-1.5 bg-background rounded break-all">
                  https://your-domain.vercel.app/api/agentfix/health
                </code>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card className="p-4 border-violet-500/20">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  )
}
