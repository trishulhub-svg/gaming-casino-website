'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Load Agentation only on the client and only when explicitly enabled.
// Per Agentation docs, it's intended for development use, but we also allow
// enabling in production via NEXT_PUBLIC_AGENTATION=1 (useful for live QA).
//
// Docs: https://www.agentation.com/install
// Requirements: React 18+, client-side only, desktop only.
const Agentation = dynamic(
  () => import('agentation').then(m => ({ default: m.Agentation })),
  {
    ssr: false,
    loading: () => null,
  }
)

export function AgentationProvider() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Enable in development by default
    // Also allow explicit enable via NEXT_PUBLIC_AGENTATION=1 for production QA
    const isDev = process.env.NODE_ENV === 'development'
    const explicitEnable = process.env.NEXT_PUBLIC_AGENTATION === '1'
    if (isDev || explicitEnable) {
      setEnabled(true)
    }
  }, [])

  if (!enabled) return null

  return (
    <Agentation
      // Optional: point to a local MCP server (npx agentation-mcp server, default port 4747)
      // endpoint="http://localhost:4747"
      // Auto-copy annotations to clipboard when added
      copyToClipboard
      onAnnotationAdd={(annotation: unknown) => {
        console.log('[Agentation] Annotation added:', annotation)
      }}
      onAnnotationDelete={(id: string) => {
        console.log('[Agentation] Annotation deleted:', id)
      }}
      onCopy={(markdown: string) => {
        console.log('[Agentation] Annotations copied as markdown')
      }}
      onSubmit={(payload: unknown) => {
        console.log('[Agentation] Annotations submitted:', payload)
      }}
    />
  )
}
