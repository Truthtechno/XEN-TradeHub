# Affiliate Commission Integration Guide

## Quick Start: Adding Commission Tracking to Existing Features

This guide shows you exactly where to add commission tracking in your existing XEN TradeHub features.

---

## 1. Academy Class Enrollments

### Location: `/app/api/academy-classes/[id]/register/route.ts`

**Add after successful payment/registration:**

```typescript
import { createAcademyCommission } from '@/lib/affiliate-commission-utils'

// After creating the registration
const registration = await prisma.academyClassRegistration.create({
  // ... your existing code
})

// Add this: Create affiliate commission if user was referred
if (userId) {
  await createAcademyCommission(userId, registration.amountUSD, classId)
}
```

---

## 2. Copy Trading Subscriptions

### Location: `/app/api/copy-trading/subscribe/route.ts`

**Add after creating subscription:**

```typescript
import { createCopyTradingCommission } from '@/lib/affiliate-commission-utils'

// After creating the subscription
const subscription = await prisma.copyTradingSubscription.create({
  // ... your existing code
})

// Add this: Create commission (requires verification)
await createCopyTradingCommission(
  userId,
  subscription.investmentUSD,
  subscription.id
)
```

**Important**: This creates a PENDING commission that requires admin verification of the deposit.

---

## 3. Broker Account Openings

### Location: `/app/api/brokers/account-opening/route.ts`

**Add after account opening is created:**

```typescript
import { createBrokerAccountCommission } from '@/lib/affiliate-commission-utils'

// After creating the account opening
const accountOpening = await prisma.brokerAccountOpening.create({
  // ... your existing code
})

// Add this: Create commission (requires verification)
// Note: You'll need to track the deposit amount
await createBrokerAccountCommission(
  userId,
  depositAmount, // Get this from your form or verification
  accountOpening.id
)
```

**Note**: You may want to add this after admin verifies the deposit, not immediately on creation.

---

## 4. Premium Subscriptions

### Location: `/app/api/subscriptions/create/route.ts` (or similar)

**Add after subscription payment:**

```typescript
import { createSubscriptionCommission } from '@/lib/affiliate-commission-utils'

// After successful subscription payment
const subscription = await prisma.subscription.create({
  // ... your existing code
})

// Add this: Create commission
await createSubscriptionCommission(
  userId,
  subscriptionAmount,
  subscription.id
)
```

---

## Admin Verification Workflow

### For Copy Trading & Broker Accounts

Since these require deposit verification, here's the recommended flow:

#### Option 1: Verify Before Commission (Recommended)

```typescript
// In your copy trading subscription API
const subscription = await prisma.copyTradingSubscription.create({
  data: {
    // ... subscription data
    status: 'PENDING_DEPOSIT' // Custom status
  }
})

// Don't create commission yet
// Wait for admin to verify deposit
```

Then in admin panel:
```typescript
// When admin verifies deposit
await prisma.copyTradingSubscription.update({
  where: { id: subscriptionId },
  data: { status: 'ACTIVE' }
})

// Now create the commission
await createCopyTradingCommission(userId, investmentAmount, subscriptionId)
```

#### Option 2: Create Pending Commission (Current Implementation)

```typescript
// Create commission immediately but mark as requiring verification
await createCopyTradingCommission(userId, investmentAmount, subscriptionId)

// Admin reviews at /admin/affiliates/commissions
// Approves or rejects based on deposit verification
```

---

## Testing Your Integration

### 1. Create Test Affiliate
```bash
# Login as a user
# Go to /affiliates
# Register as affiliate
# Note your referral code
```

### 2. Create Test Referral
```bash
# Logout
# Go to /auth/signup?ref=YOUR_CODE
# Create new account
```

### 3. Test Commission Creation
```bash
# Login as referred user
# Make a purchase (academy/copy trading/etc)
# Check affiliate dashboard for commission
```

### 4. Test Admin Verification
```bash
# Login as admin
# Go to /admin/affiliates/commissions
# Review pending commissions
# Approve or reject
```

---

## Example: Complete Academy Integration

Here's a complete example for academy class enrollments:

```typescript
// /app/api/academy-classes/[id]/register/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAcademyCommission } from '@/lib/affiliate-commission-utils'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    const body = await request.json()
    const { fullName, email, phone, paymentIntentId } = body

    // Create registration
    const registration = await prisma.academyClassRegistration.create({
      data: {
        classId: params.id,
        userId: user?.id,
        fullName,
        email,
        phone,
        amountUSD: 100, // Your actual amount
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        stripePaymentIntentId: paymentIntentId
      }
    })

    // 🎯 CREATE AFFILIATE COMMISSION
    if (user?.id) {
      await createAcademyCommission(
        user.id,
        registration.amountUSD,
        params.id
      )
    }

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Monitoring Commissions

### Check Commission Creation
```typescript
// In your API route, add logging
console.log('Creating commission for user:', userId)
const commission = await createAcademyCommission(userId, amount, entityId)
console.log('Commission created:', commission?.id)
```

### View in Database
```bash
npx prisma studio
# Navigate to AffiliateCommission table
# Check recent entries
```

### Check Affiliate Dashboard
- Login as affiliate
- Go to /dashboard/affiliates
- Check Commissions tab

---

## Common Patterns

### Pattern 1: Auto-Approved Commissions
Use for low-risk transactions:
- Academy enrollments
- Premium subscriptions
- Resource purchases

```typescript
await createAcademyCommission(userId, amount, entityId)
// Commission immediately added to pending earnings
```

### Pattern 2: Verified Commissions
Use for high-value transactions:
- Copy trading deposits
- Broker account deposits
- Large purchases

```typescript
await createCopyTradingCommission(userId, amount, entityId)
// Commission created as PENDING
// Admin must verify before earnings update
```

### Pattern 3: Custom Commissions
For special cases:

```typescript
import { createAffiliateCommission } from '@/lib/affiliate-commission-utils'

await createAffiliateCommission({
  userId,
  amount: 500,
  type: 'OTHER',
  description: 'Special bonus for top performer',
  requiresVerification: false,
  relatedEntityType: 'BONUS',
  relatedEntityId: bonusId
})
```

---

## Troubleshooting

### Commission Not Created
1. Check if user has `referredByCode` set
2. Verify affiliate program exists and is active
3. Check console logs for errors
4. Verify helper function is imported correctly

### Commission Created But Not Showing
1. Check commission status (PENDING vs APPROVED)
2. Verify affiliate program ID matches
3. Check if commission requires verification
4. Review admin verification status

### Earnings Not Updated
1. Verify commission status is APPROVED
2. Check if commission requires verification
3. Ensure admin has approved the commission
4. Review affiliate program earnings fields

---

## Best Practices

1. **Always Check User Referral**: Commission creation automatically checks if user was referred
2. **Log Commission Creation**: Add logging for debugging
3. **Handle Errors Gracefully**: Wrap commission creation in try-catch
4. **Don't Block Main Flow**: Commission creation should not prevent main transaction
5. **Verify High-Value Transactions**: Use verification for deposits/investments

---

## Quick Reference

| Transaction Type | Function | Auto-Approved | Requires Verification |
|-----------------|----------|---------------|----------------------|
| Academy Class | `createAcademyCommission` | ✅ | ❌ |
| Copy Trading | `createCopyTradingCommission` | ❌ | ✅ |
| Broker Account | `createBrokerAccountCommission` | ❌ | ✅ |
| Subscription | `createSubscriptionCommission` | ✅ | ❌ |
| Custom | `createAffiliateCommission` | Configurable | Configurable |

---

## Need Help?

1. Check `/lib/affiliate-commission-utils.ts` for function signatures
2. Review `AFFILIATE_SYSTEM_COMPLETE.md` for full documentation
3. Test in development environment first
4. Use Prisma Studio to inspect database records
