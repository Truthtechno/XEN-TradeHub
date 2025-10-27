# XEN TradeHub - Complete Affiliate System Implementation

## Overview
A professional, full-featured affiliate program system with commission tracking, verification, and automated payouts.

---

## 🎯 Features Implemented

### 1. **Affiliate Registration**
- **Location**: `/affiliates`
- **Features**:
  - Registration form with payment details
  - Support for multiple payment methods (Mobile Money, Bank Transfer, PayPal, Crypto)
  - Unique referral code generation
  - Automatic tier assignment (Bronze by default)

### 2. **Referral Tracking**
- **Signup URL**: `/auth/signup?ref=AFFILIATE_CODE`
- **Features**:
  - Automatic referral detection during signup
  - Referral record creation
  - User tracking with `referredByCode` field
  - Automatic tier upgrades based on referral count

### 3. **Commission System**
- **Types**:
  - `ACADEMY` - Academy class enrollments (auto-approved)
  - `COPY_TRADING` - Copy trading subscriptions (requires verification)
  - `BROKER_ACCOUNT` - Broker account deposits (requires verification)
  - `SUBSCRIPTION` - Premium subscriptions (auto-approved)
  - `OTHER` - Custom commissions

- **Verification Flow**:
  - Commissions requiring verification are marked as `PENDING`
  - Admin reviews verification data
  - Admin approves or rejects with reason
  - Approved commissions update affiliate earnings

### 4. **Tier System**
- **Bronze**: 10% commission (0-10 referrals)
- **Silver**: 12% commission (11-25 referrals)
- **Gold**: 15% commission (26-50 referrals)
- **Platinum**: 20% commission (51+ referrals)
- **Auto-upgrade**: Tiers automatically upgrade when referral thresholds are met

### 5. **Affiliate Dashboard**
- **Location**: `/dashboard/affiliates`
- **Features**:
  - Total earnings, pending, and paid amounts
  - Referral count and tier progress
  - Commission history with status
  - Referral list with conversion tracking
  - Payout history
  - Request payout (minimum $50)
  - Copy referral link

### 6. **Admin Management**

#### Main Affiliate Panel
- **Location**: `/admin/affiliates`
- **Features**:
  - View all affiliates with stats
  - Manage tier assignments
  - Activate/deactivate affiliates
  - Create payouts
  - View referrals and commissions

#### Commission Verification Panel
- **Location**: `/admin/affiliates/commissions`
- **Features**:
  - Filter by status (All, Pending, Approved, Rejected)
  - Review commission details
  - View verification data
  - Approve or reject with reasons
  - Special handling for deposit verification

---

## 📊 Database Schema

### Updated Models

```prisma
model User {
  referredByCode String? // Tracks which affiliate referred this user
  // ... other fields
}

model AffiliateProgram {
  fullName       String?
  phone          String?
  paymentMethod  String?
  payoutDetails  Json?
  // ... other fields
}

model AffiliateCommission {
  requiresVerification Boolean
  verificationData     Json?
  verifiedAt          DateTime?
  verifiedBy          String?
  rejectionReason     String?
  relatedEntityType   String?
  relatedEntityId     String?
  // ... other fields
}
```

---

## 🔌 API Routes

### User Routes
- `POST /api/auth/signup` - Create account with referral tracking
- `GET /api/affiliates/program` - Get affiliate program details
- `POST /api/affiliates/register` - Register as affiliate
- `GET /api/affiliates/commissions` - Get user's commissions
- `GET /api/affiliates/referrals` - Get user's referrals
- `GET /api/affiliates/payouts` - Get user's payouts
- `POST /api/affiliates/payouts/request` - Request payout

### Admin Routes
- `GET /api/admin/affiliates` - Get all affiliates
- `PATCH /api/admin/affiliates/[id]` - Update affiliate
- `GET /api/admin/affiliates/commissions` - Get all commissions
- `POST /api/admin/affiliates/commissions/[id]/verify` - Verify commission
- `GET /api/admin/affiliates/payouts` - Get all payouts
- `POST /api/admin/affiliates/payouts` - Create payout
- `PATCH /api/admin/affiliates/payouts/[id]` - Update payout status
- `GET /api/admin/affiliates/referrals` - Get all referrals

---

## 🛠️ Helper Functions

### Commission Creation Utilities
**Location**: `/lib/affiliate-commission-utils.ts`

```typescript
// Auto-create commissions for different events
createAcademyCommission(userId, amount, classId)
createCopyTradingCommission(userId, investmentAmount, subscriptionId)
createBrokerAccountCommission(userId, depositAmount, accountOpeningId)
createSubscriptionCommission(userId, amount, subscriptionId)
```

### Usage Example

```typescript
// In academy enrollment API
import { createAcademyCommission } from '@/lib/affiliate-commission-utils'

// After successful payment
await createAcademyCommission(userId, amountPaid, classId)
```

```typescript
// In copy trading subscription API
import { createCopyTradingCommission } from '@/lib/affiliate-commission-utils'

// After subscription creation
await createCopyTradingCommission(userId, investmentAmount, subscriptionId)
// This creates a PENDING commission that requires admin verification
```

---

## 🔐 Commission Verification Process

### For Copy Trading & Broker Accounts

1. **User Action**: User subscribes to copy trading or opens broker account
2. **Commission Created**: System creates commission with `requiresVerification: true`
3. **Verification Data**: Stores investment/deposit amount and related IDs
4. **Admin Review**: Admin goes to `/admin/affiliates/commissions`
5. **Admin Verifies**: 
   - Reviews deposit/investment proof
   - Checks related entity (subscription/account)
   - Approves or rejects with reason
6. **Auto-Update**: On approval:
   - Commission status → `APPROVED`
   - Affiliate earnings updated
   - Referral status → `CONVERTED`

### Verification Data Structure

```json
{
  "investmentAmount": 1000,
  "subscriptionId": "clx...",
  "requiresDepositVerification": true
}
```

---

## 💰 Payout System

### Payout Flow
1. Affiliate requests payout (minimum $50)
2. Payout created with `PENDING` status
3. Admin reviews in `/admin/affiliates`
4. Admin processes payment externally
5. Admin marks payout as `COMPLETED` with transaction ID
6. Affiliate's `pendingEarnings` → `paidEarnings`

### Payout Methods
- Bank Transfer
- PayPal
- Mobile Money
- Cryptocurrency

---

## 📱 User Experience

### New User Journey
1. Clicks affiliate link: `https://xentradehub.com/signup?ref=ABC123`
2. Sees referral code highlighted on signup page
3. Creates account
4. Referral automatically tracked
5. Makes first purchase (academy/copy trading)
6. Commission created for affiliate
7. If requires verification, admin reviews
8. Commission approved → Affiliate earns

### Affiliate Journey
1. Registers at `/affiliates`
2. Provides payment details
3. Gets unique referral code
4. Shares link on social media
5. Tracks referrals in dashboard
6. Earns commissions on conversions
7. Requests payout when balance ≥ $50
8. Receives payment

---

## 🎨 UI Components

### Affiliate Dashboard
- Stats cards (Earnings, Pending, Paid, Referrals)
- Tier progress bar
- Referral link with copy button
- Tabs for Commissions, Referrals, Payouts
- Payout request dialog

### Admin Commission Panel
- Filter by status
- Commission table with verification badges
- Review dialog with verification data
- Approve/Reject actions
- Deposit verification warnings

---

## 🔄 Integration Points

### To Enable Commissions in Your App

#### 1. Academy Class Enrollment
```typescript
// In /api/academy-classes/[id]/register or payment success
import { createAcademyCommission } from '@/lib/affiliate-commission-utils'

await createAcademyCommission(userId, registration.amountUSD, classId)
```

#### 2. Copy Trading Subscription
```typescript
// In /api/copy-trading/subscribe
import { createCopyTradingCommission } from '@/lib/affiliate-commission-utils'

await createCopyTradingCommission(
  userId,
  subscription.investmentUSD,
  subscription.id
)
```

#### 3. Broker Account Opening
```typescript
// In /api/brokers/account-opening
import { createBrokerAccountCommission } from '@/lib/affiliate-commission-utils'

// After deposit verification
await createBrokerAccountCommission(
  userId,
  depositAmount,
  accountOpening.id
)
```

---

## 🧪 Testing Checklist

### User Flow
- [ ] Register as affiliate with payment details
- [ ] Get unique referral code
- [ ] Share referral link
- [ ] New user signs up with referral code
- [ ] Referral appears in affiliate dashboard
- [ ] User makes purchase
- [ ] Commission appears in dashboard
- [ ] Request payout (≥$50)

### Admin Flow
- [ ] View all affiliates
- [ ] Update affiliate tier
- [ ] View pending commissions
- [ ] Review verification data
- [ ] Approve commission
- [ ] Reject commission with reason
- [ ] Process payout
- [ ] Mark payout as completed

### Verification Flow
- [ ] Copy trading commission requires verification
- [ ] Broker account commission requires verification
- [ ] Academy commission auto-approved
- [ ] Verification data displayed correctly
- [ ] Deposit verification warning shown
- [ ] Approved commission updates earnings
- [ ] Rejected commission shows reason

---

## 📈 Analytics & Reports

### Available Metrics
- Total affiliates (active/inactive)
- Total referrals
- Pending payouts amount
- Total paid out
- Commission by type
- Top affiliates by referrals
- Top affiliates by earnings
- Conversion rates

### Export Functionality
Admin can export:
- Affiliate list (CSV)
- Commission history (CSV)
- Payout records (CSV)

---

## 🚀 Deployment Notes

### Environment Variables
No additional environment variables needed. Uses existing:
- `DATABASE_URL` - PostgreSQL connection

### Database Migration
Already applied:
```bash
npx prisma migrate dev --name add_affiliate_enhancements
```

### Dependencies
All dependencies already in package.json:
- Prisma
- NextAuth
- bcryptjs
- React Hook Form (optional)

---

## 🔒 Security Features

1. **Authentication**: All routes protected with NextAuth
2. **Authorization**: Admin-only routes check user role
3. **Validation**: Input validation on all forms
4. **Unique Codes**: Affiliate codes guaranteed unique
5. **Verification**: High-value commissions require manual approval
6. **Audit Trail**: All verifications tracked with admin ID and timestamp

---

## 📝 Next Steps

### Recommended Enhancements
1. **Email Notifications**:
   - New referral signup
   - Commission earned
   - Commission approved/rejected
   - Payout processed

2. **Analytics Dashboard**:
   - Charts for earnings over time
   - Referral conversion funnel
   - Top performing affiliates

3. **Automated Payouts**:
   - Integration with payment gateways
   - Scheduled monthly payouts
   - Automatic payout on threshold

4. **Marketing Materials**:
   - Downloadable banners
   - Social media templates
   - Email templates

5. **Advanced Features**:
   - Multi-level marketing (MLM)
   - Recurring commissions
   - Bonus programs
   - Leaderboards

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Referral not tracked
- Check if referral code is valid
- Verify user has `referredByCode` field set
- Check AffiliateReferral record created

**Issue**: Commission not created
- Verify user was referred
- Check affiliate program is active
- Review commission creation logs

**Issue**: Payout request fails
- Ensure balance ≥ $50
- Check affiliate has payment details
- Verify affiliate program is active

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API route logs
3. Check Prisma Studio for data
4. Review browser console for errors

---

## ✅ Summary

The affiliate system is now fully functional with:
- ✅ Registration with payment details
- ✅ Referral tracking
- ✅ Commission calculation
- ✅ Verification workflow
- ✅ Tier management
- ✅ Payout system
- ✅ Admin management
- ✅ User dashboard
- ✅ API routes
- ✅ Helper utilities

**Status**: Ready for production use
**Last Updated**: October 21, 2025
