import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

// Public diagnostic endpoint — returns whether env vars are configured
// and whether the DB is reachable. Does NOT expose secrets.
export async function GET() {
  const checks: { name: string; ok: boolean; detail?: string }[] = []

  // 1. Check env vars are set
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  const jwtSecret = process.env.JWT_SECRET

  checks.push({
    name: 'TURSO_DATABASE_URL',
    ok: !!tursoUrl,
    detail: tursoUrl ? `Set (${tursoUrl.slice(0, 30)}...)` : 'MISSING',
  })
  checks.push({
    name: 'TURSO_AUTH_TOKEN',
    ok: !!tursoToken,
    detail: tursoToken ? `Set (${tursoToken.length} chars)` : 'MISSING',
  })
  checks.push({
    name: 'JWT_SECRET',
    ok: !!jwtSecret && jwtSecret.length >= 16,
    detail: jwtSecret ? `Set (${jwtSecret.length} chars)` : 'MISSING or too short',
  })

  // 2. Try DB connection (only if URL + token are set)
  let dbReachable = false
  let dbError = ''
  let userCount = 0
  let adminExists = false

  if (tursoUrl && tursoToken) {
    try {
      const db = createClient({ url: tursoUrl, authToken: tursoToken })
      const r = await db.execute('SELECT 1 as ok')
      dbReachable = r.rows.length > 0
      checks.push({ name: 'DB connection', ok: dbReachable })

      // Count users
      const c = await db.execute('SELECT COUNT(*) as c FROM users')
      userCount = Number((c.rows[0] as { c: number }).c)
      checks.push({ name: 'Users in DB', ok: userCount > 0, detail: `${userCount} users` })

      // Check admin exists
      const a = await db.execute("SELECT id, username, role FROM users WHERE username = 'admin'")
      adminExists = a.rows.length > 0
      checks.push({
        name: 'Admin user exists',
        ok: adminExists,
        detail: adminExists ? JSON.stringify(a.rows[0]) : 'MISSING — run `bun run scripts/init-db.ts`',
      })
    } catch (e) {
      dbError = e instanceof Error ? e.message : String(e)
      checks.push({ name: 'DB connection', ok: false, detail: dbError })
    }
  }

  const allOk = checks.every(c => c.ok)

  return NextResponse.json({
    ok: allOk,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelRegion: process.env.VERCEL_REGION || 'local',
    checks,
    nextSteps: allOk
      ? null
      : [
          '1. Go to Vercel → Project → Settings → Environment Variables',
          '2. Add the missing variables (see README.md)',
          '3. Redeploy (Deployments → ⋯ → Redeploy → uncheck "Use existing Build Cache")',
        ],
  })
}
