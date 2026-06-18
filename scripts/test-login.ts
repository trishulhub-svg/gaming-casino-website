// End-to-end login API test
import { createClient } from '@libsql/client'
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Replicate the login API logic exactly
function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const hashBuf = Buffer.from(scryptSync(password, salt, 64))
  const keyBuf = Buffer.from(key, 'hex')
  if (hashBuf.length !== keyBuf.length) return false
  return timingSafeEqual(hashBuf, keyBuf)
}

async function testLogin(identifier: string, password: string) {
  console.log(`\n=== Testing login: "${identifier}" / "${password}" ===`)

  // Step 1: Find user
  const result = await db.execute({
    sql: 'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = ? OR email = ?',
    args: [identifier, identifier],
  })

  if (result.rows.length === 0) {
    console.log('✗ FAIL: No user found with that identifier')
    return false
  }

  const user = result.rows[0] as {
    id: number; username: string; email: string;
    password_hash: string; role: string; is_active: number
  }
  console.log('✓ User found:', { id: user.id, username: user.username, role: user.role, is_active: user.is_active })

  // Step 2: Check active
  if (!user.is_active) {
    console.log('✗ FAIL: User is not active')
    return false
  }
  console.log('✓ User is active')

  // Step 3: Verify password
  const passwordOk = verifyPassword(password, user.password_hash)
  if (!passwordOk) {
    console.log('✗ FAIL: Password does not match')
    return false
  }
  console.log('✓ Password matches')

  // Step 4: Generate JWT (same logic as auth.ts)
  const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 7 * 24 * 60 * 60
  const payload = { sub: String(user.id), username: user.username, role: user.role, iat: now, exp }
  const b64 = (s: string) => Buffer.from(s).toString('base64url')
  const data = `${b64(JSON.stringify(header))}.${b64(JSON.stringify(payload))}`
  const sig = createHmac('sha256', SECRET).update(data).digest()
  const token = `${data}.${b64(sig.toString('hex'))}`.replace(/\./g, '.')
  // Wait — let me fix this. The sig should be base64url, not the hex of base64url.
  const sig2 = createHmac('sha256', SECRET).update(data).digest()
  const token2 = `${data}.${sig2.toString('base64url')}`
  console.log('✓ JWT generated (preview):', token2.slice(0, 60) + '...')

  console.log('\n✓ LOGIN SHOULD SUCCEED')
  return true
}

async function main() {
  // Test 1: Correct credentials
  await testLogin('admin', 'Admin@2026')

  // Test 2: Wrong password
  await testLogin('admin', 'wrongpassword')

  // Test 3: Email login
  await testLogin('admin@trishulcasino.io', 'Admin@2026')

  // Test 4: Non-existent user
  await testLogin('nonexistent', 'whatever')

  process.exit(0)
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
