# Monthly Challenge - Quick Setup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Run Database Migration
```bash
# Stop your dev server first (Ctrl+C)

# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_monthly_challenge

# Restart dev server
npm run dev
```

### Step 2: Test User Experience
1. **Hard refresh browser** (Cmd+Shift+R or Ctrl+Shift+R)
2. Navigate to **Copy Trading** → **Monthly Challenge**
3. You'll see the new $1,000 challenge page!

### Step 3: Test Admin Monitoring
1. Login as admin (admin@corefx.com / admin123)
2. Go to **Admin** → **Monthly Challenge**
3. Monitor participant progress!

## ✨ What's New

### For Users:
- **New Page:** `/copy-trading/monthly-challenge`
- **Navigation:** Copy Trading → Monthly Challenge (replaces "My Traders")
- **Earn $1,000:** Refer 3 friends who join copy trading

### For Admins:
- **New Page:** `/admin/monthly-challenge`
- **Navigation:** Admin sidebar → Monthly Challenge
- **Monitor:** Track all participants and reward claims

## 🎯 How It Works

1. **User gets affiliate link** (must register at /affiliates first)
2. **Shares link** with friends
3. **Friends sign up** using the link
4. **Friends join copy trading** (subscribe to any platform)
5. **Progress auto-updates** (1/3, 2/3, 3/3)
6. **User claims $1,000** when 3 referrals complete

## 📱 Features

### User Page:
- ✅ Beautiful promotional banner
- ✅ Real-time progress tracker
- ✅ Referral link with copy button
- ✅ WhatsApp & Twitter sharing
- ✅ List of qualified referrals
- ✅ Claim reward button
- ✅ Fully responsive

### Admin Page:
- ✅ Statistics dashboard
- ✅ All participants table
- ✅ Search functionality
- ✅ Month filter (last 6 months)
- ✅ Progress visualization
- ✅ Status tracking
- ✅ Fully responsive

## 🔄 Monthly Reset

- Challenge automatically resets on the 1st of each month
- Users can earn $1,000 every month
- Progress tracked separately per month

## 📝 Important Notes

1. **Affiliate Required:** Users must have an affiliate account to participate
2. **Referral Link:** Friends must sign up using the unique referral link
3. **Copy Trading:** Referrals must subscribe to copy trading to count
4. **Manual Claim:** Users must click "Claim Reward" button
5. **Admin Processing:** Admin processes payment after claim

## 🐛 Troubleshooting

### "Property 'monthlyChallenge' does not exist" error?
**Solution:** Run `npx prisma generate` to regenerate Prisma client

### Page not showing?
**Solution:** Hard refresh browser (Cmd+Shift+R)

### Navigation not updated?
**Solution:** Restart dev server and hard refresh

## 📊 Test Flow

### Quick Test (5 minutes):

1. **Setup Affiliate:**
   ```
   - Go to /affiliates
   - Register affiliate account
   - Note your referral code
   ```

2. **Check Challenge Page:**
   ```
   - Go to /copy-trading/monthly-challenge
   - See your referral link
   - Progress should show 0/3
   ```

3. **Test Referral (Incognito):**
   ```
   - Open incognito window
   - Go to /auth/signup?ref=YOUR_CODE
   - Sign up new account
   - Subscribe to copy trading
   - Go back to main account
   - Progress should show 1/3
   ```

4. **Check Admin:**
   ```
   - Login as admin
   - Go to /admin/monthly-challenge
   - See your progress in the table
   ```

## 🎉 You're Done!

The Monthly Challenge is now live and ready to use!

Users can start earning $1,000 by referring friends to copy trading.

---

**Questions?** Check MONTHLY_CHALLENGE_COMPLETE.md for full documentation.
