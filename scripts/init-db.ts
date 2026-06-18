// Initialize Turso database schema + seed data
// Run with: bun run scripts/init-db.ts

import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { scryptSync, randomBytes } from 'crypto'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function run() {
  console.log('[init-db] Reading schema.sql...')
  const schemaPath = join(process.cwd(), 'prisma', 'schema.sql')
  const schema = readFileSync(schemaPath, 'utf-8')

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)

  console.log(`[init-db] Executing ${statements.length} statements...`)
  for (const stmt of statements) {
    try {
      await db.execute(stmt)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('already exists')) {
        // OK
      } else {
        console.error('[init-db] Statement failed:', stmt.slice(0, 60), '—', msg)
      }
    }
  }
  console.log('[init-db] Schema applied.')

  console.log('[init-db] Seeding admin user...')
  const adminExists = await db.execute("SELECT id FROM users WHERE username = 'admin'")
  if (adminExists.rows.length === 0) {
    await db.execute({
      sql: "INSERT INTO users (username, email, password_hash, phone, role, balance, referral_code) VALUES (?, ?, ?, ?, 'admin', 0, ?)",
      args: ['admin', 'admin@trishulcasino.io', hashPassword('Admin@2026'), '+919999999999', 'ADMINXX'],
    })
    console.log('[init-db] Admin created: admin / Admin@2026')
  } else {
    console.log('[init-db] Admin already exists.')
  }

  console.log('[init-db] Seeding games...')
  const gamesCount = await db.execute('SELECT COUNT(*) as c FROM games')
  if (Number((gamesCount.rows[0] as { c: number }).c) === 0) {
    const games: { name: string; category: string; provider: string; is_popular: number; min_bet: number; max_bet: number; rtp: number }[] = [
      { name: 'Sweet Bonanza', category: 'slots', provider: 'Pragmatic', is_popular: 1, min_bet: 10, max_bet: 5000, rtp: 96.48 },
      { name: 'Gates of Olympus', category: 'slots', provider: 'Pragmatic', is_popular: 1, min_bet: 10, max_bet: 5000, rtp: 96.50 },
      { name: 'Sugar Rush', category: 'slots', provider: 'Pragmatic', is_popular: 0, min_bet: 10, max_bet: 5000, rtp: 96.50 },
      { name: 'Wild West Gold', category: 'slots', provider: 'Pragmatic', is_popular: 0, min_bet: 10, max_bet: 5000, rtp: 96.51 },
      { name: 'Super Ace', category: 'slots', provider: 'JILI', is_popular: 1, min_bet: 10, max_bet: 5000, rtp: 96.50 },
      { name: 'Golden Empire', category: 'slots', provider: 'JILI', is_popular: 0, min_bet: 10, max_bet: 5000, rtp: 96.50 },
      { name: 'Fortune Gems', category: 'slots', provider: 'JILI', is_popular: 1, min_bet: 10, max_bet: 5000, rtp: 96.50 },
      { name: 'Boxing King', category: 'slots', provider: 'JILI', is_popular: 0, min_bet: 10, max_bet: 5000, rtp: 96.50 },
      { name: 'Win Go 30s', category: 'lottery', provider: 'TC Gaming', is_popular: 1, min_bet: 10, max_bet: 10000, rtp: 95.00 },
      { name: 'Win Go 1Min', category: 'lottery', provider: 'TC Gaming', is_popular: 1, min_bet: 10, max_bet: 10000, rtp: 95.00 },
      { name: 'Win Go 3Min', category: 'lottery', provider: 'TC Gaming', is_popular: 0, min_bet: 10, max_bet: 10000, rtp: 95.00 },
      { name: 'Win Go 5Min', category: 'lottery', provider: 'TC Gaming', is_popular: 0, min_bet: 10, max_bet: 10000, rtp: 95.00 },
      { name: 'K3 Lotre', category: 'lottery', provider: 'TC Gaming', is_popular: 1, min_bet: 10, max_bet: 10000, rtp: 95.00 },
      { name: '5D Lotre', category: 'lottery', provider: 'TC Gaming', is_popular: 0, min_bet: 10, max_bet: 10000, rtp: 95.00 },
      { name: 'Cricket Live', category: 'sports', provider: 'SABA', is_popular: 1, min_bet: 50, max_bet: 50000, rtp: 97.00 },
      { name: 'Football Live', category: 'sports', provider: 'SABA', is_popular: 1, min_bet: 50, max_bet: 50000, rtp: 97.00 },
      { name: 'Tennis Live', category: 'sports', provider: 'SABA', is_popular: 0, min_bet: 50, max_bet: 50000, rtp: 97.00 },
      { name: 'Kabaddi Live', category: 'sports', provider: 'SABA', is_popular: 0, min_bet: 50, max_bet: 50000, rtp: 97.00 },
      { name: 'Live Roulette', category: 'casino', provider: 'Evolution', is_popular: 1, min_bet: 100, max_bet: 100000, rtp: 97.30 },
      { name: 'Live Blackjack', category: 'casino', provider: 'Evolution', is_popular: 1, min_bet: 100, max_bet: 100000, rtp: 99.29 },
      { name: 'Live Baccarat', category: 'casino', provider: 'Evolution', is_popular: 0, min_bet: 100, max_bet: 100000, rtp: 98.94 },
      { name: 'Live Andar Bahar', category: 'casino', provider: 'Ezugi', is_popular: 1, min_bet: 50, max_bet: 50000, rtp: 97.85 },
      { name: 'Live Teen Patti', category: 'casino', provider: 'Ezugi', is_popular: 1, min_bet: 50, max_bet: 50000, rtp: 97.04 },
      { name: 'Rummy 20-20', category: 'card', provider: 'JILI', is_popular: 0, min_bet: 20, max_bet: 5000, rtp: 96.50 },
      { name: 'Poker Texas', category: 'card', provider: 'JILI', is_popular: 0, min_bet: 20, max_bet: 5000, rtp: 96.50 },
      { name: 'Dragon Tiger', category: 'card', provider: 'JILI', is_popular: 1, min_bet: 20, max_bet: 5000, rtp: 96.27 },
      { name: 'Fish Hunter', category: 'fishing', provider: 'JILI', is_popular: 1, min_bet: 10, max_bet: 1000, rtp: 96.00 },
      { name: 'Ocean King', category: 'fishing', provider: 'JILI', is_popular: 0, min_bet: 10, max_bet: 1000, rtp: 96.00 },
      { name: 'Dragon Fishing', category: 'fishing', provider: 'JILI', is_popular: 0, min_bet: 10, max_bet: 1000, rtp: 96.00 },
      { name: 'Aviator', category: 'mini', provider: 'Spribe', is_popular: 1, min_bet: 10, max_bet: 10000, rtp: 97.00 },
      { name: 'Dice', category: 'mini', provider: 'Spribe', is_popular: 0, min_bet: 10, max_bet: 10000, rtp: 97.00 },
      { name: 'Plinko', category: 'mini', provider: 'Spribe', is_popular: 1, min_bet: 10, max_bet: 10000, rtp: 97.00 },
      { name: 'Mines', category: 'mini', provider: 'Spribe', is_popular: 0, min_bet: 10, max_bet: 10000, rtp: 97.00 },
    ]

    for (const g of games) {
      await db.execute({
        sql: "INSERT INTO games (name, category, provider, thumbnail_url, game_url, is_popular, is_active, min_bet, max_bet, rtp_percentage) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)",
        args: [
          g.name,
          g.category,
          g.provider,
          `https://placehold.co/300x400/0F172A/F59E0B/png?text=${encodeURIComponent(g.name)}`,
          `/game/play/${encodeURIComponent(g.name.toLowerCase().replace(/\s+/g, '-'))}`,
          g.is_popular,
          g.min_bet,
          g.max_bet,
          g.rtp,
        ],
      })
    }
    console.log(`[init-db] Seeded ${games.length} games.`)
  } else {
    console.log(`[init-db] Games already seeded.`)
  }

  console.log('[init-db] Seeding bonuses...')
  const bonusCount = await db.execute('SELECT COUNT(*) as c FROM bonuses')
  if (Number((bonusCount.rows[0] as { c: number }).c) === 0) {
    const bonuses = [
      { name: 'Welcome Bonus', description: 'Get 100% bonus on your first deposit up to ₹10,000', bonus_type: 'welcome', bonus_amount: 10000, wagering_requirement: 10, min_deposit: 500 },
      { name: 'Daily Deposit Bonus', description: '5% bonus on every daily deposit up to ₹1,000', bonus_type: 'daily', bonus_amount: 1000, wagering_requirement: 5, min_deposit: 100 },
      { name: 'Referral Bonus', description: 'Earn ₹500 for every friend who deposits ₹1000', bonus_type: 'referral', bonus_amount: 500, wagering_requirement: 3, min_deposit: 0 },
      { name: 'Weekly Cashback', description: '10% cashback on net weekly losses up to ₹5,000', bonus_type: 'daily', bonus_amount: 5000, wagering_requirement: 2, min_deposit: 0 },
    ]
    for (const b of bonuses) {
      await db.execute({
        sql: "INSERT INTO bonuses (name, description, bonus_type, bonus_amount, wagering_requirement, min_deposit, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
        args: [b.name, b.description, b.bonus_type, b.bonus_amount, b.wagering_requirement, b.min_deposit],
      })
    }
    console.log(`[init-db] Seeded ${bonuses.length} bonuses.`)
  }

  console.log('[init-db] Seeding demo wins for ticker...')
  const demoUsers = await db.execute("SELECT id, username FROM users WHERE username = 'admin'")
  const adminRow = demoUsers.rows[0] as { id: number; username: string } | undefined
  if (adminRow) {
    const demoNames = ['Raj***', 'Priya***', 'Amit***', 'Sneha***', 'Vik***', 'Pooja***', 'Arjun***', 'Neha***', 'Sanjay***', 'Divya***', 'Karan***', 'Meena***', 'Rohit***', 'Anita***', 'Suresh***']
    const gameNames = ['Aviator', 'Win Go 1Min', 'Sweet Bonanza', 'Live Andar Bahar', 'Super Ace', 'Plinko', 'Cricket Live', 'Gates of Olympus']
    for (let i = 0; i < 20; i++) {
      const gname = gameNames[i % gameNames.length]
      const amount = Math.floor(Math.random() * 50000) + 500
      await db.execute({
        sql: "INSERT INTO transactions (user_id, type, amount, status, payment_method, notes, created_at) VALUES (?, 'win', ?, 'completed', 'GAME', ?, datetime('now', ?))",
        args: [adminRow.id, amount, `Win on ${gname}`, `-${i} minutes`],
      })
    }
    console.log('[init-db] Seeded 20 demo wins.')
  }

  console.log('[init-db] Done.')
  process.exit(0)
}

run().catch(e => {
  console.error('[init-db] FAILED:', e)
  process.exit(1)
})
