'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToastStore } from '@/lib/store'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { MessageSquare, Send } from 'lucide-react'

interface Ticket { id: number; subject: string; message: string; status: string; admin_response: string | null; created_at: string }

export default function SupportPage() {
  const { push } = useToastStore()
  const [form, setForm] = useState({ subject: '', message: '' })
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)

  const load = () => {
    fetch('/api/support/ticket').then(r => r.json()).then(j => j?.ok && setTickets(j.data || []))
  }
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const j = await r.json()
      if (j.ok) {
        push({ type: 'success', message: 'Ticket submitted' })
        setForm({ subject: '', message: '' })
        load()
      } else push({ type: 'error', message: j.error || 'Failed' })
    } finally { setLoading(false) }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Support & Help</h1>
      <p className="text-muted-foreground mb-6">Get help with your account, payments, or gameplay.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-amber-500" /> Submit a Ticket</h2>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="s">Subject</Label>
              <Input id="s" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m">Message</Label>
              <Textarea id="m" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={4} className="bg-background" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Send className="h-4 w-4 mr-1" /> {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Card>

        <div>
          <Card className="p-4">
            <h2 className="font-bold mb-3">FAQ</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="q1">
                <AccordionTrigger>How do I deposit?</AccordionTrigger>
                <AccordionContent>Go to Wallet → Deposit, choose UPI/Bank/USDT, enter amount and reference. Deposits are instant in demo mode.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>How long do withdrawals take?</AccordionTrigger>
                <AccordionContent>UPI: 5-30 min · Bank: 1-24 hours · USDT: 15-60 min. All withdrawals are reviewed before approval.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Is my account safe?</AccordionTrigger>
                <AccordionContent>Yes. Passwords are hashed with scrypt. All sessions use signed JWT cookies with httpOnly flag.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger>What are wagering requirements?</AccordionTrigger>
                <AccordionContent>Before withdrawing bonus winnings, you must bet bonus × wagering multiplier on eligible games.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q5">
                <AccordionTrigger>How do referrals work?</AccordionTrigger>
                <AccordionContent>Share your referral link. When a friend signs up and deposits ₹1,000, you earn ₹500 commission.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          <Card className="p-4 mt-4">
            <h2 className="font-bold mb-2">Contact</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>📧 support@trishulcasino.io</div>
              <div>💬 Live chat: 24/7</div>
              <div>📱 Telegram: @TrishulCasinoSupport</div>
            </div>
          </Card>
        </div>
      </div>

      {tickets.length > 0 && (
        <Card className="p-4 mt-6">
          <h2 className="font-bold mb-3">Your Tickets</h2>
          <div className="divide-y divide-border">
            {tickets.map(t => (
              <div key={t.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{t.subject}</div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    t.status === 'open' ? 'bg-amber-500/20 text-amber-400' :
                    t.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>{t.status}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t.message}</p>
                {t.admin_response && (
                  <div className="mt-2 p-2 bg-background rounded text-sm">
                    <strong>Support:</strong> {t.admin_response}
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(t.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 mt-6 bg-red-950/20 border-red-500/30">
        <p className="text-xs text-red-300 text-center">
          ⚠ If gambling is affecting your life, seek help. 18+ only. Play responsibly.
        </p>
      </Card>
    </div>
  )
}
