import { NextResponse } from 'next/server'
import { clearEvents } from '@/lib/agentfix-store'

// Admin endpoint — clears all stored events
export async function POST() {
  clearEvents()
  return NextResponse.json({ ok: true, message: 'All events cleared' })
}
