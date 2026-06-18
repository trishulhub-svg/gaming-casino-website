import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { execute, queryOne } from './db'

// ========== Password Hashing (scrypt) ==========

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const hashBuf = Buffer.from(scryptSync(password, salt, 64))
  const keyBuf = Buffer.from(key, 'hex')
  if (hashBuf.length !== keyBuf.length) return false
  return timingSafeEqual(hashBuf, keyBuf)
}

// ========== JWT (HS256 using Node crypto) ==========

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64url')
}

function base64urlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url')
}

export interface JWTPayload {
  sub: string
  username: string
  role: string
  iat?: number
  exp?: number
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresInDays = 7): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + expiresInDays * 24 * 60 * 60
  const fullPayload: JWTPayload = { ...payload, iat: now, exp }
  const headerB64 = base64url(JSON.stringify(header))
  const payloadB64 = base64url(JSON.stringify(fullPayload))
  const data = `${headerB64}.${payloadB64}`
  const signature = createHmac('sha256', SECRET).update(data).digest()
  const sigB64 = base64url(signature)
  return `${data}.${sigB64}`
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, sigB64] = parts
    const data = `${headerB64}.${payloadB64}`
    const expectedSig = createHmac('sha256', SECRET).update(data).digest()
    const actualSig = base64urlDecode(sigB64)
    if (expectedSig.length !== actualSig.length) return null
    if (!timingSafeEqual(expectedSig, actualSig)) return null
    const payload = JSON.parse(base64urlDecode(payloadB64).toString()) as JWTPayload
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

// ========== Session helpers (cookie-based) ==========

const COOKIE_NAME = 'tc_session'

export async function setSessionCookie(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  const token = signToken(payload)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return token
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  const user = await queryOne<{
    id: number
    username: string
    email: string
    phone: string | null
    balance: number
    avatar_url: string | null
    role: string
    referral_code: string
    referred_by: string | null
    is_active: number
  }>('SELECT id, username, email, phone, balance, avatar_url, role, referral_code, referred_by, is_active FROM users WHERE id = ?', [Number(session.sub)])
  if (!user || !user.is_active) return null
  return user
}

// ========== Referral code generator ==========

export function generateReferralCode(username: string): string {
  const base = username.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4).padEnd(4, 'X')
  const suffix = randomBytes(3).toString('hex').toUpperCase()
  return `${base}${suffix}`
}

// ========== Validation ==========

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^[+]?[\d\s\-()]{10,15}$/.test(phone)
}
