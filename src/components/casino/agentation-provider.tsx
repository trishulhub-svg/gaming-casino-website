'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Load Agentation on the client side.
// Per Agentation docs: https://www.agentation.com/install
// Requirements: React 18+, client-side only, desktop only.
//
// We load it on ALL environments (dev + production) so you can use it
// to capture issues on your live Vercel deployment.
// To disable in production, set NEXT_PUBLIC_AGENTATION=0 in Vercel env vars.
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
    // Allow disabling via NEXT_PUBLIC_AGENTATION=0 (defaults to enabled)
    const explicitlyDisabled = process.env.NEXT_PUBLIC_AGENTATION === '0'
    if (!explicitlyDisabled) {
      setEnabled(true)
    }
  }, [])

  if (!enabled) return null

  return (
    <Agentation
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
