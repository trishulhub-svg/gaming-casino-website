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

export const db: Client =
  globalForDb.tursoClient ?? createTursoClient()

if (process.env.NODE_ENV !== 'production') globalForDb.tursoClient = db

// Helper types
export type Row = Record<string, unknown>

export async function execute(sql: string, args: unknown[] = []) {
  return db.execute({ sql, args })
}

export async function batch(statements: { sql: string; args: unknown[] }[]) {
  return db.batch(statements.map(s => ({ sql: s.sql, args: s.args as never })))
}

export async function queryOne<T = Row>(sql: string, args: unknown[] = []): Promise<T | null> {
  const result = await db.execute({ sql, args })
  return (result.rows[0] as T) ?? null
}

export async function queryMany<T = Row>(sql: string, args: unknown[] = []): Promise<T[]> {
  const result = await db.execute({ sql, args })
  return result.rows as T[]
}

// Helper: extract last insert ID as number (libsql returns bigint|undefined)
export function lastInsertId(result: { lastInsertRowid?: bigint | number }): number {
  const v = result.lastInsertRowid
  if (v === undefined || v === null) return 0
  return typeof v === 'bigint' ? Number(v) : v
}
