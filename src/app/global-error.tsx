'use client'

// Bare-minimum global error boundary.
// Must be a Client Component per Next.js docs.
// Cannot use any hooks (useEffect, useState) because they require React's
// hook dispatcher which is null during the synthetic prerender of /_global-error.
export default function GlobalError() {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0A0B1E', color: '#FFFFFF', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: '1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>
            Please refresh the page or try again later.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              fontWeight: 600,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: '#FFFFFF',
            }}
          >
            Back to Home
          </a>
        </div>
      </body>
    </html>
  )
}
