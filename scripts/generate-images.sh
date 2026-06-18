#!/bin/bash
# Generate all images for TrishulCasino website
# Using z-ai CLI for image generation

set -e

IMG_DIR="/home/z/my-project/public/images"
mkdir -p "$IMG_DIR/games" "$IMG_DIR/categories" "$IMG_DIR/promos" "$IMG_DIR/hero"

echo "🎨 Generating TrishulCasino images..."
echo "========================================"

# === HERO BANNER ===
echo "1/20: Hero banner..."
timeout 90 z-ai image -p "Luxurious online casino hero banner, dark navy background with purple and pink neon glow, golden casino chips, playing cards, slot machine, roulette wheel, dice, premium gaming atmosphere, cinematic lighting, ultra detailed, 4k quality" -o "$IMG_DIR/hero/casino-hero.png" -s 1440x720 2>&1 | tail -1

# === CATEGORY IMAGES (7) ===
echo "2/20: Slots category..."
timeout 90 z-ai image -p "Vibrant slot machine with colorful reels, gold coins spilling out, purple neon lights, casino atmosphere, 3d render, high quality" -o "$IMG_DIR/categories/slots.png" -s 1024x1024 2>&1 | tail -1

echo "3/20: Lottery category..."
timeout 90 z-ai image -p "Golden lottery balls with numbers, sparkling tickets, pink and gold background, luck and fortune theme, 3d render, high quality" -o "$IMG_DIR/categories/lottery.png" -s 1024x1024 2>&1 | tail -1

echo "4/20: Sports category..."
timeout 90 z-ai image -p "Sports betting concept, cricket bat and ball, football, glowing stadium lights, green field, dynamic action, emerald and gold theme, 3d render" -o "$IMG_DIR/categories/sports.png" -s 1024x1024 2>&1 | tail -1

echo "5/20: Casino (live) category..."
timeout 90 z-ai image -p "Live casino table with roulette wheel, playing cards, poker chips, red and gold luxury theme, elegant atmosphere, 3d render, high quality" -o "$IMG_DIR/categories/casino.png" -s 1024x1024 2>&1 | tail -1

echo "6/20: Card games category..."
timeout 90 z-ai image -p "Royal playing cards fan, ace king queen jack, purple and violet background, golden accents, poker chips, 3d render, elegant" -o "$IMG_DIR/categories/card.png" -s 1024x1024 2>&1 | tail -1

echo "7/20: Fishing category..."
timeout 90 z-ai image -p "Underwater ocean scene with colorful tropical fish, golden treasure chest, bubbles, cyan and blue theme, 3d render, vibrant" -o "$IMG_DIR/categories/fishing.png" -s 1024x1024 2>&1 | tail -1

echo "8/20: Mini games category..."
timeout 90 z-ai image -p "Mini casino games collage, dice, plinko board, mines game, crash chart, indigo and violet neon, modern gaming, 3d render" -o "$IMG_DIR/categories/mini.png" -s 1024x1024 2>&1 | tail -1

# === GAME THUMBNAILS (popular games - 8) ===
echo "9/20: Sweet Bonanza..."
timeout 90 z-ai image -p "Candy land slot game thumbnail, colorful lollipops, gummy bears, fruits, pink and purple background, sweet treats, 3d render, vibrant" -o "$IMG_DIR/games/sweet-bonanza.png" -s 768x1344 2>&1 | tail -1

echo "10/20: Gates of Olympus..."
timeout 90 z-ai image -p "Greek mythology slot game, Zeus god of thunder, lightning bolts, golden temple, purple sky, epic, 3d render, detailed" -o "$IMG_DIR/games/gates-of-olympus.png" -s 768x1344 2>&1 | tail -1

echo "11/20: Aviator..."
timeout 90 z-ai image -p "Aviator game thumbnail, red airplane flying upward, multiplier chart, sky background, pink and purple gradient, 3d render" -o "$IMG_DIR/games/aviator.png" -s 768x1344 2>&1 | tail -1

echo "12/20: Win Go..."
timeout 90 z-ai image -p "Lottery dice game thumbnail, colorful dice with numbers, gold and purple background, lucky draw, 3d render, vibrant" -o "$IMG_DIR/games/win-go.png" -s 768x1344 2>&1 | tail -1

echo "13/20: Live Andar Bahar..."
timeout 90 z-ai image -p "Indian card game Andar Bahar, traditional playing cards, red and gold table, live dealer concept, 3d render, elegant" -o "$IMG_DIR/games/andar-bahar.png" -s 768x1344 2>&1 | tail -1

echo "14/20: Cricket Live..."
timeout 90 z-ai image -p "Cricket sports betting thumbnail, cricket ball hitting stumps, stadium lights, green pitch, dynamic action, 3d render" -o "$IMG_DIR/games/cricket.png" -s 768x1344 2>&1 | tail -1

echo "15/20: Plinko..."
timeout 90 z-ai image -p "Plinko game thumbnail, colorful balls dropping through pegs, purple and pink neon, multiplier zones, 3d render, modern" -o "$IMG_DIR/games/plinko.png" -s 768x1344 2>&1 | tail -1

echo "16/20: Super Ace..."
timeout 90 z-ai image -p "Card game Super Ace, ace playing cards, golden poker chips, purple background, luxury casino, 3d render, detailed" -o "$IMG_DIR/games/super-ace.png" -s 768x1344 2>&1 | tail -1

# === PROMOTION BANNERS (3 key ones) ===
echo "17/20: Welcome bonus promo..."
timeout 90 z-ai image -p "Welcome bonus banner, golden gift box with casino chips spilling out, purple and pink gradient, 100 percent bonus text concept, luxury, 3d render" -o "$IMG_DIR/promos/welcome.png" -s 1344x768 2>&1 | tail -1

echo "18/20: Daily bonus promo..."
timeout 90 z-ai image -p "Daily deposit bonus banner, calendar with gold coins, pink and rose gradient, rewards concept, 3d render, vibrant" -o "$IMG_DIR/promos/daily.png" -s 1344x768 2>&1 | tail -1

echo "19/20: Referral promo..."
timeout 90 z-ai image -p "Referral bonus banner, two friends celebrating, gold coins connecting them, emerald green theme, network concept, 3d render" -o "$IMG_DIR/promos/referral.png" -s 1344x768 2>&1 | tail -1

echo "20/20: VIP promo..."
timeout 90 z-ai image -p "VIP high roller bonus banner, golden crown, luxury casino, diamond, black and gold theme, premium, 3d render, elegant" -o "$IMG_DIR/promos/vip.png" -s 1344x768 2>&1 | tail -1

echo ""
echo "========================================"
echo "✅ All images generated!"
echo ""
echo "Files created:"
find "$IMG_DIR" -name "*.png" | sort
echo ""
echo "Total size:"
du -sh "$IMG_DIR"
