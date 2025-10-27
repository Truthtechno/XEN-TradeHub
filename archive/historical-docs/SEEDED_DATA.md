# XEN TradeHub - Seeded Data Summary

## Database Information
- **Database Name:** `xen_tradehub`
- **Connection:** `postgresql://postgres:password@localhost:5432/xen_tradehub`
- **Status:** ✅ Active and Seeded

---

## 🔑 Login Credentials

### Super Admin
- **Email:** `admin@corefx.com`
- **Password:** `admin123`
- **Access:** Full admin panel access

### Brian User (Student)
- **Email:** `brian@corefx.com`
- **Password:** `admin123`
- **Access:** User panel + has affiliate program

### Test Users (10 users)
- **Emails:** `user1@example.com` through `user10@example.com`
- **Password:** `user123`
- **Access:** Standard user access

---

## 📊 Seeded Data Overview

### 1. Brokers (3 Total)

#### Exness
- **Slug:** `exness`
- **Status:** Active
- **Benefits:** 
  - Ultra-low spreads from 0.0 pips
  - Instant withdrawals 24/7
  - No minimum deposit
  - Leverage up to 1:Unlimited
  - Premium trading signals
- **Account Opening Steps:** Included for new and existing accounts

#### HFM (HotForex)
- **Slug:** `hfm`
- **Status:** Active
- **Benefits:**
  - Regulated by multiple authorities
  - Competitive spreads
  - Copy trading available
  - Educational resources
  - Dedicated support team

#### Equity
- **Slug:** `equity`
- **Status:** Active
- **Benefits:**
  - Low commission rates
  - Advanced charting tools
  - Mobile trading app
  - Fast execution
  - 24/5 customer support

---

### 2. Master Traders (6 Total)

#### From Main Seed:
1. **John Smith** (`john-smith`)
   - Risk: MEDIUM
   - Profit: +145.8%
   - Followers: 1,250
   - Strategy: Swing Trading

2. **Sarah Johnson** (`sarah-johnson`)
   - Risk: LOW
   - Profit: +98.2%
   - Followers: 890
   - Strategy: Position Trading

3. **Michael Chen** (`michael-chen`)
   - Risk: HIGH
   - Profit: +210.5%
   - Followers: 650
   - Strategy: Scalping

#### From XEN TradeHub Seed:
4. **John Forex Pro** (`john-forex-pro`)
   - Risk: MEDIUM
   - Profit: +45.8%
   - Followers: 234
   - Min Investment: $1,000

5. **Sarah The Scalper** (`sarah-scalper`)
   - Risk: HIGH
   - Profit: +62.3%
   - Followers: 156
   - Min Investment: $2,500

6. **Mike Conservative** (`mike-conservative`)
   - Risk: LOW
   - Profit: +28.5%
   - Followers: 412
   - Min Investment: $500

---

### 3. Broker Account Openings (4 Total)

1. **Brian Amooti** → Exness (APPROVED)
2. **Test User 1** → HFM (PENDING)
3. **Test User 2** → Equity (APPROVED)
4. **Test User 3** → Exness (PENDING)

---

### 4. Copy Trading Subscriptions (5 Total)

1. Brian → John Smith ($5,000) - ACTIVE
2. User 1 → John Smith ($1,000) - ACTIVE
3. User 2 → Sarah Johnson ($2,500) - ACTIVE
4. User 3 → Michael Chen ($3,000) - ACTIVE
5. User 4 → Sarah Johnson ($1,500) - PAUSED

---

### 5. Affiliate Programs (3 Total)

1. **Brian Amooti**
   - Code: `BRIAN2024`
   - Tier: BRONZE
   - Commission: 10%

2. **Test User 1**
   - Code: `USER1REF`
   - Tier: SILVER
   - Commission: 15%
   - Earnings: $250.50

3. **Admin User**
   - Code: `XEN[ID]`
   - Tier: BRONZE
   - Commission: 10%

---

### 6. Academy Courses (3 Total)

1. **Forex Trading Fundamentals**
   - Level: BEGINNER
   - Price: FREE
   - Lessons: 8
   - Duration: 60 minutes

2. **Technical Analysis Mastery**
   - Level: INTERMEDIATE
   - Price: $199
   - Lessons: 12
   - Duration: 120 minutes

3. **Risk Management & Psychology**
   - Level: ADVANCED
   - Price: $149
   - Lessons: 10
   - Duration: 90 minutes

---

### 7. Additional Data

- **Course Enrollments:** 4
- **Live Enquiries (Bookings):** 5
- **Notifications:** 4
- **Affiliate Referrals:** 4
- **Affiliate Commissions:** 3
- **Affiliate Payouts:** 2

---

## 🚀 How to Test

### User Panel Pages:
1. **Dashboard:** `/dashboard`
2. **Trade Through Us (Brokers):** `/brokers`
3. **Copy Trading:** `/copy-trading`
4. **Academy:** `/academy`
5. **Earn With Us (Affiliates):** `/affiliates`
6. **Data Verification:** `/verify-data` ✨ NEW

### Admin Panel Pages:
1. **Brokers Management:** `/admin/brokers`
2. **Copy Trading Management:** `/admin/copy-trading`
3. **Affiliates Management:** `/admin/affiliates`
4. **Users Management:** `/admin/users`
5. **Courses Management:** `/admin/courses`

---

## ✅ Verification

To verify all data is loaded correctly, visit:
- **URL:** `http://localhost:3000/verify-data`
- **Login as:** `admin@corefx.com` / `admin123`

This page shows:
- All brokers with their details
- All master traders with performance metrics
- Broker account opening requests
- Copy trading subscriptions
- Affiliate programs
- Academy courses

---

## 🔄 Re-seeding

If you need to re-seed the database:

```bash
# Full seed (includes all data)
npm run db:seed

# XEN TradeHub specific seed only
npx tsx prisma/seed-xen-tradehub.ts
```

---

## 📝 Notes

- **CoreFX database is untouched** - All original CoreFX data remains in the `corefx` database
- **Separate database** - XEN TradeHub uses its own `xen_tradehub` database
- **No conflicts** - Changes to XEN TradeHub won't affect CoreFX data
- **Ready for production** - Database schema is properly migrated and seeded

---

## 🎯 Next Steps

1. ✅ Login as admin and explore the admin panels
2. ✅ Login as user and test broker account opening
3. ✅ Test copy trading subscription flow
4. ✅ Join affiliate program and test referral tracking
5. ✅ Enroll in courses and test learning flow
6. ✅ Visit `/verify-data` to see all seeded data at a glance

---

**Last Updated:** October 20, 2025
**Database:** xen_tradehub
**Status:** ✅ Operational
