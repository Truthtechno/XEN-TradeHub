# Copy Trading System - Comprehensive Testing Guide

## Overview
This guide provides step-by-step instructions for testing the complete Copy Trading System in XEN TradeHub.

## Test Credentials

### Admin Access
- **Email:** admin@corefx.com
- **Password:** admin123

### Regular User Access
- **Email:** user1@example.com
- **Password:** user123
- **Other test users:** user2@example.com through user10@example.com (all use password: user123)

### Brian User (Has Active Subscriptions)
- **Email:** brian@corefx.com
- **Password:** admin123

---

## Part 1: Admin Dashboard Testing

### 1.1 Access Admin Copy Trading Dashboard
1. Login as admin (admin@corefx.com / admin123)
2. Navigate to `/admin/copy-trading`
3. **Expected:** See Copy Trading Management page with:
   - 4 stat cards (Total Traders, Active Traders, Total Subscriptions, Active Subscriptions)
   - Master Traders table with 6 traders
   - Subscriptions button showing count

### 1.2 View Master Traders
**Verify the following traders are displayed:**
- John Smith (@john-smith) - MEDIUM risk, +145.8%
- Sarah Johnson (@sarah-johnson) - LOW risk, +98.2%
- Michael Chen (@michael-chen) - HIGH risk, +210.5%
- John Forex Pro (@john-forex-pro) - MEDIUM risk, +178.3%
- Emma Wilson (@emma-trader) - MEDIUM risk, +125.6%
- David Martinez (@david-crypto) - HIGH risk, +189.7%

**Each trader should show:**
- Avatar/initials
- Name and username
- Performance percentage (with up/down arrow)
- Risk level badge
- Follower count
- Minimum investment
- Active/Inactive status
- Edit and Delete buttons

### 1.3 Create New Master Trader
1. Click "Add Trader" button
2. Fill in the form:
   - **Trader Name:** Test Trader
   - **Username:** test-trader
   - **Slug:** test-trader
   - **Broker:** Exness
   - **Short Bio:** Test bio for new trader
   - **Description:** Detailed description of trading strategy
   - **Avatar URL:** (optional)
   - **Profit %:** 150
   - **Profit Share %:** 20
   - **Min Investment:** 1000
   - **Risk Level:** MEDIUM
   - **ROI %:** 150
   - **Win Rate %:** 70
   - **Max Drawdown %:** 15
   - **Copy Trading Link:** https://exness.com/copy/test-trader
   - **Trading Strategy:** Test strategy description
   - **Display Order:** 10
   - **Active:** Checked
3. Click "Create Trader"
4. **Expected:** Success toast, trader appears in table

### 1.4 Edit Existing Trader
1. Click Edit button on any trader
2. Modify some fields (e.g., change profit percentage)
3. Click "Update Trader"
4. **Expected:** Success toast, changes reflected in table

### 1.5 View Subscriptions
1. Click "Subscriptions" button at top
2. **Expected:** See subscriptions panel with:
   - User name and email
   - Trader name
   - Investment amount
   - Status badge (ACTIVE/PAUSED/CANCELLED)
   - Start date
   - Action buttons (Pause/Resume/Cancel)

### 1.6 Manage Subscription Status
1. Find an ACTIVE subscription
2. Click "Pause" button
3. **Expected:** Status changes to PAUSED
4. Click "Resume" button
5. **Expected:** Status changes back to ACTIVE
6. Click "Cancel" button
7. **Expected:** Status changes to CANCELLED

### 1.7 View Analytics (New Feature)
1. Navigate to `/admin/copy-trading` (if not already there)
2. Note the stat cards showing:
   - Total Traders: 6 (or 7 if you created one)
   - Active Traders: 6 (or 7)
   - Total Subscriptions: 8
   - Active Subscriptions: 7 (or less if you cancelled any)

---

## Part 2: User Dashboard Testing

### 2.1 Browse Available Traders
1. Login as user1@example.com / user123
2. Navigate to `/copy-trading`
3. **Expected:** See Copy Trading page with:
   - Header and description
   - 3 info cards (How It Works, Risk Management, Flexible Control)
   - Grid of 6 master trader cards

### 2.2 View Trader Details
**For each trader card, verify:**
- Avatar with initials
- Trader name
- Risk level badge (color-coded)
- Description
- Performance stats:
  - Profit percentage (green if positive)
  - Follower count
- Strategy (if available)
- Minimum investment
- "Join Copy Trading" button

### 2.3 Subscribe to a Trader
1. Click "Join Copy Trading" on John Smith's card
2. **Expected:** Modal opens showing:
   - Trader summary with avatar and profit
   - Investment amount input (min $500)
   - Copy Ratio input (default 1.0)
   - Stop Loss Percentage input (default 10%)
   - Potential earnings calculator (appears when valid amount entered)

3. Fill in the form:
   - **Investment Amount:** 2000
   - **Copy Ratio:** 1.0
   - **Stop Loss Percentage:** 10

4. **Expected:** Potential earnings shown based on trader's performance

5. Click "Start Copying"
6. **Expected:** 
   - Success toast message
   - Modal closes
   - Copy link opens in new tab (if available)

### 2.4 View My Traders Page
1. Navigate to `/copy-trading/my-traders`
2. **Expected:** See My Traders page with:
   - 4 stat cards:
     - Total Investment
     - Current Profit (green if positive)
     - Total Trades
     - Active Subscriptions
   - List of your subscriptions

### 2.5 View Subscription Details
**For each subscription card, verify:**
- Trader avatar and name
- Risk level and status badges
- Broker badge (if available)
- Investment amount
- Current P/L (color-coded)
- Copy ratio
- Trade count (Wins/Losses)
- Win rate percentage
- Action buttons (Details, Pause/Resume, Stop)

### 2.6 View Detailed Performance
1. Click "Details" button on any subscription
2. **Expected:** Modal opens showing:
   - Trader info with avatar and stats
   - Performance badges (ROI, Win Rate)
   - 3 stat cards (Total Profit, Total Loss, Net P/L)
   - Recent Trades table with:
     - Symbol, Action, Entry/Exit prices
     - Lot size, P/L, Status
   - Profit Shares table (if any) with:
     - Date, Trade Profit, Share %, Amount, Status

### 2.7 Pause/Resume Subscription
1. On My Traders page, find an ACTIVE subscription
2. Click "Pause" button
3. **Expected:** 
   - Success toast
   - Status badge changes to PAUSED
   - Button changes to "Resume"
4. Click "Resume" button
5. **Expected:**
   - Success toast
   - Status badge changes to ACTIVE
   - Button changes to "Pause"

### 2.8 Stop Copying
1. Click "Stop" button on any subscription
2. **Expected:**
   - Success toast
   - Status badge changes to CANCELLED
   - Action buttons disabled/removed

---

## Part 3: Testing with Brian's Account (Pre-seeded Data)

### 3.1 Login as Brian
1. Logout current user
2. Login as brian@corefx.com / admin123
3. Navigate to `/copy-trading/my-traders`

### 3.2 Verify Brian's Subscriptions
**Expected to see:**
- Active subscription to Sarah Johnson
- Investment: $5,000
- Current profit displayed
- Trade history
- Profit shares (if any)

### 3.3 View Performance Details
1. Click "Details" on Brian's subscription
2. **Expected:** See complete performance breakdown with:
   - Recent trades
   - Profit/Loss stats
   - Profit share records

---

## Part 4: API Testing (Optional - For Developers)

### 4.1 User API Endpoints
Test these endpoints using browser DevTools or Postman:

```
GET /api/copy-trading/traders
- Returns list of active traders

POST /api/copy-trading/subscribe
- Body: { traderId, investmentUSD, copyRatio, stopLossPercent }
- Creates new subscription

GET /api/copy-trading/my-subscriptions
- Returns user's subscriptions with stats

PATCH /api/copy-trading/my-subscriptions/[id]
- Body: { status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' }
- Updates subscription status
```

### 4.2 Admin API Endpoints

```
GET /api/admin/copy-trading/traders
- Returns all traders with subscription counts

POST /api/admin/copy-trading/traders
- Body: { name, username, slug, profitPercentage, ... }
- Creates new trader

PUT /api/admin/copy-trading/traders/[id]
- Updates trader information

DELETE /api/admin/copy-trading/traders/[id]
- Deletes trader

GET /api/admin/copy-trading/subscriptions
- Returns all subscriptions

PATCH /api/admin/copy-trading/subscriptions/[id]
- Updates subscription status

GET /api/admin/copy-trading/trades
- Returns all trades with stats

POST /api/admin/copy-trading/trades
- Creates new trade and mirrors to subscribers

POST /api/admin/copy-trading/trades/[id]/close
- Closes trade and calculates profit/loss

GET /api/admin/copy-trading/analytics
- Returns comprehensive analytics
```

---

## Part 5: Database Verification

### 5.1 Check Seeded Data
Run this command to verify database:
```bash
npx prisma studio
```

**Verify these tables:**
- `master_traders` - 6 traders
- `copy_trading_subscriptions` - 8 subscriptions
- `copy_trades` - Multiple trades
- `profit_shares` - Profit share records

### 5.2 Verify Relationships
- Each subscription links to a user and trader
- Each trade links to a trader and optionally a subscription
- Each profit share links to a trader and subscription

---

## Expected Results Summary

### ✅ Admin Dashboard Should:
- Display all 6 master traders
- Show accurate subscription counts
- Allow CRUD operations on traders
- Enable subscription management
- Display real-time stats

### ✅ User Dashboard Should:
- Show active traders for subscription
- Allow easy subscription with custom settings
- Display "My Traders" with performance tracking
- Show detailed trade history
- Enable pause/resume/stop actions
- Calculate and display profit/loss accurately

### ✅ Data Integrity Should:
- Subscriptions correctly linked to users and traders
- Trades properly associated with subscriptions
- Profit shares calculated based on trader's rate
- Stats updated in real-time
- Status changes reflected immediately

---

## Troubleshooting

### Issue: Traders not showing
**Solution:** 
- Check database connection
- Run: `npx tsx prisma/seed-copy-trading.ts`

### Issue: API errors
**Solution:**
- Check server logs in terminal
- Verify authentication (login again)
- Check browser console for errors

### Issue: Stats not updating
**Solution:**
- Refresh the page
- Check database for recent changes
- Verify API responses in Network tab

---

## Performance Metrics to Verify

### User Experience
- Page load time < 2 seconds
- Smooth transitions and animations
- Responsive on mobile devices
- No console errors

### Data Accuracy
- Profit/loss calculations correct
- Win rate percentages accurate
- Follower counts update properly
- Investment amounts displayed correctly

### Functionality
- All buttons work as expected
- Forms validate input properly
- Modals open and close smoothly
- Toast notifications appear and disappear

---

## Next Steps After Testing

1. **Report any bugs found** with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

2. **Suggest improvements** for:
   - UI/UX enhancements
   - Additional features
   - Performance optimizations

3. **Document edge cases** such as:
   - What happens with 0 investment?
   - How does system handle negative profits?
   - What if trader is deleted while having subscribers?

---

## Conclusion

This comprehensive Copy Trading System provides:
- ✅ Full admin control over traders and subscriptions
- ✅ User-friendly subscription interface
- ✅ Real-time performance tracking
- ✅ Profit sharing mechanism
- ✅ Trade mirroring simulation
- ✅ Comprehensive analytics

The system is now ready for production use and further customization based on business requirements.
