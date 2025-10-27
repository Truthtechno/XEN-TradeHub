# Affiliate System - Quick Reference Card

## 🔗 URLs

### User Pages
- **Registration**: `/affiliates`
- **Signup with Referral**: `/auth/signup?ref=CODE`
- **Dashboard**: `/dashboard/affiliates`

### Admin Pages
- **Main Panel**: `/admin/affiliates`
- **Commission Verification**: `/admin/affiliates/commissions`

---

## 💰 Commission Rates

| Tier | Referrals | Rate |
|------|-----------|------|
| Bronze | 0-10 | 10% |
| Silver | 11-25 | 12% |
| Gold | 26-50 | 15% |
| Platinum | 51+ | 20% |

---

## 🔧 Quick Integration

### Academy Enrollment
```typescript
import { createAcademyCommission } from '@/lib/affiliate-commission-utils'
await createAcademyCommission(userId, amount, classId)
```

### Copy Trading (Requires Verification)
```typescript
import { createCopyTradingCommission } from '@/lib/affiliate-commission-utils'
await createCopyTradingCommission(userId, investment, subscriptionId)
```

### Broker Account (Requires Verification)
```typescript
import { createBrokerAccountCommission } from '@/lib/affiliate-commission-utils'
await createBrokerAccountCommission(userId, deposit, accountId)
```

---

## 📊 Commission Types

| Type | Auto-Approved | Verification Required |
|------|---------------|----------------------|
| ACADEMY | ✅ | ❌ |
| COPY_TRADING | ❌ | ✅ |
| BROKER_ACCOUNT | ❌ | ✅ |
| SUBSCRIPTION | ✅ | ❌ |

---

## 🔐 Admin Actions

### Verify Commission
1. Go to `/admin/affiliates/commissions`
2. Filter by "Pending Verification"
3. Click "Review" on commission
4. Check verification data
5. Approve or Reject with reason

### Process Payout
1. Go to `/admin/affiliates`
2. Find affiliate with pending earnings
3. Click "Pay Out"
4. Enter transaction details
5. Mark as "Completed"

---

## 🧪 Test Flow

1. **Register**: Go to `/affiliates` → Register
2. **Get Code**: Note your referral code (e.g., JOHN1A2B3C)
3. **Refer**: Share `/auth/signup?ref=JOHN1A2B3C`
4. **Earn**: Referred user makes purchase
5. **Verify**: Admin approves commission
6. **Payout**: Request when balance ≥ $50

---

## 📁 Key Files

- **Helper**: `/lib/affiliate-commission-utils.ts`
- **User Page**: `/app/(authenticated)/affiliates/page.tsx`
- **Dashboard**: `/app/(authenticated)/dashboard/affiliates/page.tsx`
- **Admin Panel**: `/app/(admin)/admin/affiliates/page.tsx`
- **Verification**: `/app/(admin)/admin/affiliates/commissions/page.tsx`
- **Signup**: `/app/auth/signup/page.tsx`

---

## 🗄️ Database

### Models
- `User` - Added `referredByCode`
- `AffiliateProgram` - Enhanced with payment details
- `AffiliateCommission` - Enhanced with verification
- `AffiliateReferral` - Tracks referrals
- `AffiliatePayout` - Tracks payouts

### Migration
```bash
npx prisma migrate dev --name add_affiliate_enhancements
```

---

## 🎯 Minimum Payout

**$50 USD**

---

## 📞 Support

- **Full Docs**: `AFFILIATE_SYSTEM_COMPLETE.md`
- **Integration**: `AFFILIATE_INTEGRATION_GUIDE.md`
- **Summary**: `AFFILIATE_IMPLEMENTATION_SUMMARY.md`

---

**Status**: ✅ Production Ready  
**Last Updated**: October 21, 2025
