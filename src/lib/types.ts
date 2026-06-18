export interface Game {
  id: number
  name: string
  category: string
  provider: string | null
  thumbnail_url: string | null
  game_url: string | null
  is_popular: number
  is_active: number
  min_bet: number
  max_bet: number
  rtp_percentage: number
}

export interface Transaction {
  id: number
  user_id: number
  type: string
  amount: number
  status: string
  payment_method: string | null
  transaction_ref: string | null
  notes: string | null
  created_at: string
}

export interface Bet {
  id: number
  user_id: number
  game_id: number
  bet_amount: number
  win_amount: number
  result: string
  game_data: string | null
  created_at: string
}

export interface Bonus {
  id: number
  name: string
  description: string | null
  bonus_type: string
  bonus_amount: number
  wagering_requirement: number
  min_deposit: number
  is_active: number
}

export interface UserBonus {
  id: number
  user_id: number
  bonus_id: number
  claimed_at: string
  wagering_completed: number
  is_completed: number
}

export interface Referral {
  id: number
  referrer_id: number
  referred_id: number
  commission_earned: number
  created_at: string
}

export interface SupportTicket {
  id: number
  user_id: number
  subject: string
  message: string
  status: string
  admin_response: string | null
  created_at: string
}

export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

export const GAME_CATEGORIES = [
  { key: 'popular', label: 'Popular', icon: 'Flame', color: 'from-orange-500 to-red-500' },
  { key: 'slots', label: 'Slots', icon: 'Cherry', color: 'from-pink-500 to-rose-500' },
  { key: 'lottery', label: 'Lottery', icon: 'Ticket', color: 'from-amber-500 to-yellow-500' },
  { key: 'sports', label: 'Sports', icon: 'Trophy', color: 'from-emerald-500 to-green-500' },
  { key: 'casino', label: 'Live Casino', icon: 'Spade', color: 'from-red-500 to-rose-700' },
  { key: 'card', label: 'Card Games', icon: 'Club', color: 'from-purple-500 to-violet-500' },
  { key: 'fishing', label: 'Fishing', icon: 'Fish', color: 'from-cyan-500 to-blue-500' },
  { key: 'mini', label: 'Mini Games', icon: 'Gamepad2', color: 'from-indigo-500 to-purple-500' },
] as const

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

export function maskUsername(name: string): string {
  if (name.length <= 3) return name + '***'
  return name.slice(0, 3) + '***'
}

export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z')
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}
