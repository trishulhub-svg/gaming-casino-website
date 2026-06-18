'use client'

import dynamic from 'next/dynamic'

// Client wrappers that load Zustand-dependent components only on the client.
// Avoids SSR crashes from React context not being available during prerender.

const SiteHeader = dynamic(
  () => import('./site-header').then(m => ({ default: m.SiteHeader })),
  {
    ssr: false,
    loading: () => <div className="h-16 bg-background border-b border-border" />,
  }
)

const BottomNav = dynamic(
  () => import('./bottom-nav').then(m => ({ default: m.BottomNav })),
  { ssr: false }
)

const ToastViewport = dynamic(
  () => import('./toast-viewport').then(m => ({ default: m.ToastViewport })),
  { ssr: false }
)

export function ClientChrome() {
  return (
    <>
      <SiteHeader />
      <BottomNav />
      <ToastViewport />
    </>
  )
}
