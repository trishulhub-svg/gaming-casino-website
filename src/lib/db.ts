import { createClient, type Client } from '@libsql/client'

const globalForDb = globalThis as unknown as {
  tursoClient: Client | undefined
}

function createTursoClient(): Client {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set')
  }

  return createClient({
    url,
    authToken: token,
  })
}

// Lazy initializer — only connects on first use, NOT at module load.
// This prevents build-time failures when env vars aren't set during `next build`.
function getDb(): Client {
  if (!globalForDb.tursoClient) {
    globalForDb.tursoClient = createTursoClient()
  }
  return globalForDb.tursoClient
}

// Backward-compatible `db` export — uses a Proxy so the client is created lazily
// on first method call, not at import time.
export const db: Client = new Proxy({} as Client, {
  get(_target, prop: string) {
    const client = getDb()
    const value = (client as unknown as Record<string, unknown>)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

if (process.env.NODE_ENV !== 'production') {
  // Keep the global reference warm in dev
}

// Helper types
export type Row = Record<string, unknown>

export async function execute(sql: string, args: unknown[] = []) {
  return getDb().execute({ sql, args })
}

export async function batch(statements: { sql: string; args: unknown[] }[]) {
  return getDb().batch(statements.map(s => ({ sql: s.sql, args: s.args as never })))
}

export async function queryOne<T = Row>(sql: string, args: unknown[] = []): Promise<T | null> {
  const result = await getDb().execute({ sql, args })
  return (result.rows[0] as T) ?? null
}

export async function queryMany<T = Row>(sql: string, args: unknown[] = []): Promise<T[]> {
  const result = await getDb().execute({ sql, args })
  return result.rows as T[]
}

// Helper: extract last insert ID as number (libsql returns bigint|undefined)
export function lastInsertId(result: { lastInsertRowid?: bigint | number }): number {
  const v = result.lastInsertRowid
  if (v === undefined || v === null) return 0
  return typeof v === 'bigint' ? Number(v) : v
}
