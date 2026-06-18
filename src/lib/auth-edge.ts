// Edge-runtime-safe JWT verification for use in middleware.
// Uses Web Crypto API (SubtleCrypto) — no Node `crypto` module.
// Only does HS256 signature + expiry check. Full token creation
// happens server-side in `auth.ts` using Node `crypto`.

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
}

function base64UrlToBytes(input: string): Uint8Array {
  // Convert base64url to base64, then decode
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export interface EdgeJWTPayload {
  sub: string
  username: string
  role: string
  iat?: number
  exp?: number
}

export async function verifyTokenEdge(token: string): Promise<EdgeJWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, sigB64] = parts
    const data = `${headerB64}.${payloadB64}`
    const key = await getKey()
    const dataBytes = new TextEncoder().encode(data)
    const sigBytes = base64UrlToBytes(sigB64)
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes)
    if (!valid) return null
    const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64))
    const payload = JSON.parse(payloadJson) as EdgeJWTPayload
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
