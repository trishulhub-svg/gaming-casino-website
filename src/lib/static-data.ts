// Static game catalog — embedded directly in the bundle.
// Pages use this as the primary data source so they NEVER appear blank.
// The API is only used to refresh counts/popularity at runtime.

export interface StaticGame {
  id: number
  name: string
  category: 'slots' | 'lottery' | 'sports' | 'casino' | 'card' | 'fishing' | 'mini'
  provider: string
  thumbnail_url: string
  game_url: string
  is_popular: boolean
  is_active: boolean
  min_bet: number
  max_bet: number
  rtp_percentage: number
}

// Helper: generate a vibrant thumbnail URL using placehold.co with category-specific colors
function thumb(name: string, category: string, id: number): string {
  const colors: Record<string, string> = {
    slots: '8B5CF6/EC4899',
    lottery: 'FBBF24/F59E0B',
    sports: '10B981/059669',
    casino: 'EF4444/DC2626',
    card: '6366F1/4F46E5',
    fishing: '06B6D4/0891B2',
    mini: 'A855F7/7C3AED',
  }
  const c = colors[category] || '8B5CF6/EC4899'
  const text = encodeURIComponent(name)
  return `https://placehold.co/300x400/${c}/FFFFFF/png?text=${text}`
}

export const STATIC_GAMES: StaticGame[] = [
  // === SLOTS (15) ===
  { id: 1, name: 'Sweet Bonanza', category: 'slots', provider: 'Pragmatic', is_popular: true, min_bet: 10, max_bet: 5000, rtp_percentage: 96.48, thumbnail_url: '', game_url: '' },
  { id: 2, name: 'Gates of Olympus', category: 'slots', provider: 'Pragmatic', is_popular: true, min_bet: 10, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 3, name: 'Sugar Rush', category: 'slots', provider: 'Pragmatic', is_popular: false, min_bet: 10, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 4, name: 'Wild West Gold', category: 'slots', provider: 'Pragmatic', is_popular: false, min_bet: 10, max_bet: 5000, rtp_percentage: 96.51, thumbnail_url: '', game_url: '' },
  { id: 5, name: 'Super Ace', category: 'slots', provider: 'JILI', is_popular: true, min_bet: 10, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 6, name: 'Golden Empire', category: 'slots', provider: 'JILI', is_popular: false, min_bet: 10, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 7, name: 'Fortune Gems', category: 'slots', provider: 'JILI', is_popular: true, min_bet: 10, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 8, name: 'Boxing King', category: 'slots', provider: 'JILI', is_popular: false, min_bet: 10, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 9, name: 'Crazy Hunter', category: 'slots', provider: 'JILI', is_popular: false, min_bet: 10, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 10, name: 'Money Coming', category: 'slots', provider: 'JILI', is_popular: true, min_bet: 10, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 11, name: 'Wild Spell', category: 'slots', provider: 'PG Soft', is_popular: false, min_bet: 10, max_bet: 5000, rtp_percentage: 96.75, thumbnail_url: '', game_url: '' },
  { id: 12, name: 'Mahjong Ways', category: 'slots', provider: 'PG Soft', is_popular: true, min_bet: 10, max_bet: 5000, rtp_percentage: 96.95, thumbnail_url: '', game_url: '' },
  { id: 13, name: 'Lucky Neko', category: 'slots', provider: 'PG Soft', is_popular: false, min_bet: 10, max_bet: 5000, rtp_percentage: 96.85, thumbnail_url: '', game_url: '' },
  { id: 14, name: 'Bonanza Gold', category: 'slots', provider: 'BGaming', is_popular: false, min_bet: 10, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 15, name: 'Elvis Frog', category: 'slots', provider: 'BGaming', is_popular: false, min_bet: 10, max_bet: 5000, rtp_percentage: 96.51, thumbnail_url: '', game_url: '' },

  // === LOTTERY (8) ===
  { id: 20, name: 'Win Go 30s', category: 'lottery', provider: 'TC Gaming', is_popular: true, min_bet: 10, max_bet: 10000, rtp_percentage: 95.00, thumbnail_url: '', game_url: '' },
  { id: 21, name: 'Win Go 1Min', category: 'lottery', provider: 'TC Gaming', is_popular: true, min_bet: 10, max_bet: 10000, rtp_percentage: 95.00, thumbnail_url: '', game_url: '' },
  { id: 22, name: 'Win Go 3Min', category: 'lottery', provider: 'TC Gaming', is_popular: false, min_bet: 10, max_bet: 10000, rtp_percentage: 95.00, thumbnail_url: '', game_url: '' },
  { id: 23, name: 'Win Go 5Min', category: 'lottery', provider: 'TC Gaming', is_popular: false, min_bet: 10, max_bet: 10000, rtp_percentage: 95.00, thumbnail_url: '', game_url: '' },
  { id: 24, name: 'K3 Lotre', category: 'lottery', provider: 'TC Gaming', is_popular: true, min_bet: 10, max_bet: 10000, rtp_percentage: 95.00, thumbnail_url: '', game_url: '' },
  { id: 25, name: '5D Lotre', category: 'lottery', provider: 'TC Gaming', is_popular: false, min_bet: 10, max_bet: 10000, rtp_percentage: 95.00, thumbnail_url: '', game_url: '' },
  { id: 26, name: 'Daily Lottery', category: 'lottery', provider: 'India Lotto', is_popular: true, min_bet: 10, max_bet: 50000, rtp_percentage: 92.00, thumbnail_url: '', game_url: '' },
  { id: 27, name: 'Kerala Lottery', category: 'lottery', provider: 'India Lotto', is_popular: false, min_bet: 10, max_bet: 50000, rtp_percentage: 92.00, thumbnail_url: '', game_url: '' },

  // === SPORTS (8) ===
  { id: 30, name: 'Cricket Live', category: 'sports', provider: 'SABA', is_popular: true, min_bet: 50, max_bet: 50000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 31, name: 'Football Live', category: 'sports', provider: 'SABA', is_popular: true, min_bet: 50, max_bet: 50000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 32, name: 'Tennis Live', category: 'sports', provider: 'SABA', is_popular: false, min_bet: 50, max_bet: 50000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 33, name: 'Kabaddi Live', category: 'sports', provider: 'SABA', is_popular: false, min_bet: 50, max_bet: 50000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 34, name: 'Horse Racing', category: 'sports', provider: 'SABA', is_popular: false, min_bet: 50, max_bet: 50000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 35, name: 'Basketball', category: 'sports', provider: 'SABA', is_popular: false, min_bet: 50, max_bet: 50000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 36, name: 'Badminton', category: 'sports', provider: 'SABA', is_popular: false, min_bet: 50, max_bet: 50000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 37, name: 'Esports CS2', category: 'sports', provider: 'SABA', is_popular: true, min_bet: 50, max_bet: 50000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },

  // === CASINO / LIVE (8) ===
  { id: 40, name: 'Live Roulette', category: 'casino', provider: 'Evolution', is_popular: true, min_bet: 100, max_bet: 100000, rtp_percentage: 97.30, thumbnail_url: '', game_url: '' },
  { id: 41, name: 'Live Blackjack', category: 'casino', provider: 'Evolution', is_popular: true, min_bet: 100, max_bet: 100000, rtp_percentage: 99.29, thumbnail_url: '', game_url: '' },
  { id: 42, name: 'Live Baccarat', category: 'casino', provider: 'Evolution', is_popular: false, min_bet: 100, max_bet: 100000, rtp_percentage: 98.94, thumbnail_url: '', game_url: '' },
  { id: 43, name: 'Live Andar Bahar', category: 'casino', provider: 'Ezugi', is_popular: true, min_bet: 50, max_bet: 50000, rtp_percentage: 97.85, thumbnail_url: '', game_url: '' },
  { id: 44, name: 'Live Teen Patti', category: 'casino', provider: 'Ezugi', is_popular: true, min_bet: 50, max_bet: 50000, rtp_percentage: 97.04, thumbnail_url: '', game_url: '' },
  { id: 45, name: 'Live Poker', category: 'casino', provider: 'Evolution', is_popular: false, min_bet: 100, max_bet: 100000, rtp_percentage: 98.00, thumbnail_url: '', game_url: '' },
  { id: 46, name: 'Dragon Tiger Live', category: 'casino', provider: 'Ezugi', is_popular: false, min_bet: 50, max_bet: 50000, rtp_percentage: 96.27, thumbnail_url: '', game_url: '' },
  { id: 47, name: 'Sic Bo Live', category: 'casino', provider: 'Evolution', is_popular: false, min_bet: 100, max_bet: 100000, rtp_percentage: 97.22, thumbnail_url: '', game_url: '' },

  // === CARD (6) ===
  { id: 50, name: 'Rummy 20-20', category: 'card', provider: 'JILI', is_popular: false, min_bet: 20, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 51, name: 'Poker Texas', category: 'card', provider: 'JILI', is_popular: false, min_bet: 20, max_bet: 5000, rtp_percentage: 96.50, thumbnail_url: '', game_url: '' },
  { id: 52, name: 'Dragon Tiger', category: 'card', provider: 'JILI', is_popular: true, min_bet: 20, max_bet: 5000, rtp_percentage: 96.27, thumbnail_url: '', game_url: '' },
  { id: 53, name: 'Blackjack VIP', category: 'card', provider: 'BGaming', is_popular: false, min_bet: 20, max_bet: 5000, rtp_percentage: 99.29, thumbnail_url: '', game_url: '' },
  { id: 54, name: 'Baccarat Pro', category: 'card', provider: 'BGaming', is_popular: false, min_bet: 20, max_bet: 5000, rtp_percentage: 98.94, thumbnail_url: '', game_url: '' },
  { id: 55, name: 'Teen Patti 3D', category: 'card', provider: 'JILI', is_popular: true, min_bet: 20, max_bet: 5000, rtp_percentage: 97.04, thumbnail_url: '', game_url: '' },

  // === FISHING (5) ===
  { id: 60, name: 'Fish Hunter', category: 'fishing', provider: 'JILI', is_popular: true, min_bet: 10, max_bet: 1000, rtp_percentage: 96.00, thumbnail_url: '', game_url: '' },
  { id: 61, name: 'Ocean King', category: 'fishing', provider: 'JILI', is_popular: false, min_bet: 10, max_bet: 1000, rtp_percentage: 96.00, thumbnail_url: '', game_url: '' },
  { id: 62, name: 'Dragon Fishing', category: 'fishing', provider: 'JILI', is_popular: false, min_bet: 10, max_bet: 1000, rtp_percentage: 96.00, thumbnail_url: '', game_url: '' },
  { id: 63, name: 'Golden Toad', category: 'fishing', provider: 'JILI', is_popular: false, min_bet: 10, max_bet: 1000, rtp_percentage: 96.00, thumbnail_url: '', game_url: '' },
  { id: 64, name: 'Crazy Hunter 2', category: 'fishing', provider: 'JILI', is_popular: false, min_bet: 10, max_bet: 1000, rtp_percentage: 96.00, thumbnail_url: '', game_url: '' },

  // === MINI (8) ===
  { id: 70, name: 'Aviator', category: 'mini', provider: 'Spribe', is_popular: true, min_bet: 10, max_bet: 10000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 71, name: 'Dice', category: 'mini', provider: 'Spribe', is_popular: false, min_bet: 10, max_bet: 10000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 72, name: 'Plinko', category: 'mini', provider: 'Spribe', is_popular: true, min_bet: 10, max_bet: 10000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 73, name: 'Mines', category: 'mini', provider: 'Spribe', is_popular: false, min_bet: 10, max_bet: 10000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 74, name: 'Crash', category: 'mini', provider: 'Spribe', is_popular: true, min_bet: 10, max_bet: 10000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 75, name: 'Limbo', category: 'mini', provider: 'Spribe', is_popular: false, min_bet: 10, max_bet: 10000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 76, name: 'Wheel', category: 'mini', provider: 'Spribe', is_popular: false, min_bet: 10, max_bet: 10000, rtp_percentage: 97.00, thumbnail_url: '', game_url: '' },
  { id: 77, name: 'Keno', category: 'mini', provider: 'Spribe', is_popular: false, min_bet: 10, max_bet: 10000, rtp_percentage: 96.00, thumbnail_url: '', game_url: '' },
].map(g => ({
  ...g,
  thumbnail_url: g.thumbnail_url || thumb(g.name, g.category, g.id),
  game_url: `/game/${g.id}`,
  is_active: true,
}))

// Helper accessors
export function getGamesByCategory(category: string): StaticGame[] {
  if (category === 'popular') return STATIC_GAMES.filter(g => g.is_popular)
  return STATIC_GAMES.filter(g => g.category === category)
}

export function getPopularGames(limit = 12): StaticGame[] {
  return STATIC_GAMES.filter(g => g.is_popular).slice(0, limit)
}

export function getGameById(id: number): StaticGame | undefined {
  return STATIC_GAMES.find(g => g.id === id)
}

export function getAllProviders(): string[] {
  return Array.from(new Set(STATIC_GAMES.map(g => g.provider)))
}

export const CATEGORY_COUNTS: Record<string, number> = {
  popular: STATIC_GAMES.filter(g => g.is_popular).length,
  slots: STATIC_GAMES.filter(g => g.category === 'slots').length,
  lottery: STATIC_GAMES.filter(g => g.category === 'lottery').length,
  sports: STATIC_GAMES.filter(g => g.category === 'sports').length,
  casino: STATIC_GAMES.filter(g => g.category === 'casino').length,
  card: STATIC_GAMES.filter(g => g.category === 'card').length,
  fishing: STATIC_GAMES.filter(g => g.category === 'fishing').length,
  mini: STATIC_GAMES.filter(g => g.category === 'mini').length,
}

// === STATIC PROMOTIONS ===
export interface StaticPromotion {
  id: number
  name: string
  description: string
  bonus_type: 'welcome' | 'deposit' | 'referral' | 'daily' | 'weekly' | 'vip'
  bonus_amount: number
  wagering_requirement: number
  min_deposit: number
  is_active: boolean
  color: string
  icon: string
}

export const STATIC_PROMOTIONS: StaticPromotion[] = [
  {
    id: 1,
    name: 'Welcome Bonus 100%',
    description: 'Get 100% bonus on your first deposit up to ₹10,000. New players only. Wager 10x before withdrawal.',
    bonus_type: 'welcome',
    bonus_amount: 10000,
    wagering_requirement: 10,
    min_deposit: 500,
    is_active: true,
    color: 'from-violet-500 to-purple-600',
    icon: 'Gift',
  },
  {
    id: 2,
    name: 'Daily Deposit Bonus 5%',
    description: 'Get 5% bonus on every daily deposit up to ₹1,000. Valid once per day. Wager 5x.',
    bonus_type: 'daily',
    bonus_amount: 1000,
    wagering_requirement: 5,
    min_deposit: 100,
    is_active: true,
    color: 'from-pink-500 to-rose-600',
    icon: 'Calendar',
  },
  {
    id: 3,
    name: 'Referral Bonus ₹500',
    description: 'Earn ₹500 for every friend who signs up using your referral code and deposits ₹1,000. Unlimited referrals!',
    bonus_type: 'referral',
    bonus_amount: 500,
    wagering_requirement: 3,
    min_deposit: 0,
    is_active: true,
    color: 'from-emerald-500 to-green-600',
    icon: 'Users',
  },
  {
    id: 4,
    name: 'Weekly Cashback 10%',
    description: 'Get 10% cashback on your net weekly losses up to ₹5,000. Credited every Monday. Wager 2x.',
    bonus_type: 'weekly',
    bonus_amount: 5000,
    wagering_requirement: 2,
    min_deposit: 0,
    is_active: true,
    color: 'from-amber-500 to-yellow-600',
    icon: 'TrendingUp',
  },
  {
    id: 5,
    name: 'VIP High Roller Bonus',
    description: 'Deposit ₹50,000+ in a single transaction and get 150% bonus up to ₹50,000. Wager 15x. VIPs only.',
    bonus_type: 'vip',
    bonus_amount: 50000,
    wagering_requirement: 15,
    min_deposit: 50000,
    is_active: true,
    color: 'from-yellow-400 to-amber-600',
    icon: 'Crown',
  },
  {
    id: 6,
    name: 'Weekend Special 50%',
    description: 'Every Saturday & Sunday get 50% bonus on deposits up to ₹5,000. Wager 8x. Weekend only!',
    bonus_type: 'deposit',
    bonus_amount: 5000,
    wagering_requirement: 8,
    min_deposit: 500,
    is_active: true,
    color: 'from-indigo-500 to-violet-600',
    icon: 'Sparkles',
  },
]

// === STATIC WINNER TICKER DATA (used if API fails) ===
export const STATIC_WINNERS: { id: number; amount: number; notes: string; created_at: string; username: string }[] = [
  { id: 1, amount: 45230, notes: 'Win on Aviator', created_at: new Date(Date.now() - 60000).toISOString(), username: 'Ra***j' },
  { id: 2, amount: 18500, notes: 'Win on Win Go 1Min', created_at: new Date(Date.now() - 120000).toISOString(), username: 'Pr***a' },
  { id: 3, amount: 87300, notes: 'Win on Sweet Bonanza', created_at: new Date(Date.now() - 180000).toISOString(), username: 'Am***t' },
  { id: 4, amount: 12400, notes: 'Win on Live Andar Bahar', created_at: new Date(Date.now() - 240000).toISOString(), username: 'Sn***a' },
  { id: 5, amount: 67100, notes: 'Win on Super Ace', created_at: new Date(Date.now() - 300000).toISOString(), username: 'Vi***k' },
  { id: 6, amount: 23800, notes: 'Win on Plinko', created_at: new Date(Date.now() - 360000).toISOString(), username: 'Po***a' },
  { id: 7, amount: 94500, notes: 'Win on Cricket Live', created_at: new Date(Date.now() - 420000).toISOString(), username: 'Ar***n' },
  { id: 8, amount: 31200, notes: 'Win on Gates of Olympus', created_at: new Date(Date.now() - 480000).toISOString(), username: 'Ne***a' },
  { id: 9, amount: 51900, notes: 'Win on Mahjong Ways', created_at: new Date(Date.now() - 540000).toISOString(), username: 'Sa***y' },
  { id: 10, amount: 15700, notes: 'Win on Fortune Gems', created_at: new Date(Date.now() - 600000).toISOString(), username: 'Di***a' },
  { id: 11, amount: 78400, notes: 'Win on Live Teen Patti', created_at: new Date(Date.now() - 660000).toISOString(), username: 'Ka***n' },
  { id: 12, amount: 42600, notes: 'Win on Crash', created_at: new Date(Date.now() - 720000).toISOString(), username: 'Me***a' },
]

// === STATIC LEADERBOARD DATA ===
export const STATIC_LEADERBOARD: { rank: number; username: string; total_won: number }[] = [
  { rank: 1, username: 'Lu***y', total_won: 285400 },
  { rank: 2, username: 'Wi***r', total_won: 187200 },
  { rank: 3, username: 'Ja***k', total_won: 145800 },
  { rank: 4, username: 'Go***n', total_won: 98700 },
  { rank: 5, username: 'Ro***t', total_won: 76500 },
  { rank: 6, username: 'St***r', total_won: 64200 },
  { rank: 7, username: 'Bo***s', total_won: 52800 },
  { rank: 8, username: 'Pl***r', total_won: 43100 },
  { rank: 9, username: 'Az***d', total_won: 38500 },
  { rank: 10, username: 'Kr***n', total_won: 31200 },
]
