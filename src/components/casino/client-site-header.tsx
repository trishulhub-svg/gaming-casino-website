'use client'

import dynamic from 'next/dynamic'

// Client wrapper that loads SiteHeader only on the client.
// The layout is a server component (for metadata/viewport exports),
// so we can't use `dynamic({ ssr: false })` directly there.
const SiteHeader = dynamic(
  () => import('./site-header').then(m => ({ default: m.SiteHeader })),
  {
    ssr: false,
    loading: () => <div className="h-16 bg-background border-b border-border" />,
  }
)

export function ClientSiteHeader() {
  return <SiteHeader />
}
