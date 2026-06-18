// Quick diagnostic: verify admin user exists + password matches
import { createClient } from '@libsql/client'
import { scryptSync, timingSafeEqual } from 'crypto'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const hashBuf = Buffer.from(scryptSync(password, salt, 64))
  const keyBuf = Buffer.from(key, 'hex')
  if (hashBuf.length !== keyBuf.length) return false
  return timingSafeEqual(hashBuf, keyBuf)
}

async function run() {
  console.log('=== TURSO DB DIAGNOSTIC ===\n')

  // 1. Check connection
  try {
    const r = await db.execute('SELECT 1 as ok')
    console.log('✓ DB connection OK')
  } catch (e) {
    console.log('✗ DB connection FAILED:', e)
    process.exit(1)
  }

  // 2. List all tables
  const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  console.log('\nTables in DB:')
  for (const t of tables.rows) {
    console.log('  -', (t as { name: string }).name)
  }

  // 3. Count users
  const count = await db.execute('SELECT COUNT(*) as c FROM users')
  console.log('\nTotal users:', Number((count.rows[0] as { c: number }).c))

  // 4. Look for admin user
  const admin = await db.execute("SELECT id, username, email, role, is_active, password_hash FROM users WHERE username = 'admin' OR email LIKE '%admin%'")
  console.log('\nAdmin users found:', admin.rows.length)
  for (const u of admin.rows) {
    const row = u as { id: number; username: string; email: string; role: string; is_active: number; password_hash: string }
    console.log('  -', JSON.stringify({ id: row.id, username: row.username, email: row.email, role: row.role, is_active: row.is_active }, null, 2))
    console.log('  - password_hash prefix:', row.password_hash?.slice(0, 30) + '...')
    if (row.password_hash) {
      const matches = verifyPassword('Admin@2026', row.password_hash)
      console.log('  - password "Admin@2026" matches:', matches ? '✓ YES' : '✗ NO')
    }
  }

  // 5. Show first 5 users (mask password)
  const all = await db.execute('SELECT id, username, email, role, is_active FROM users LIMIT 5')
  console.log('\nFirst 5 users:')
  for (const u of all.rows) {
    console.log('  -', JSON.stringify(u))
  }

  process.exit(0)
}

run().catch(e => { console.error('FATAL:', e); process.exit(1) })
