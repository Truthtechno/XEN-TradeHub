# Affiliate Payout System Fix

## Problem Statement

The affiliate payout feature was failing when admins tried to mark payouts as paid. After entering the transaction ID, the system showed an error message "Failed to update payout" and the payout status remained unchanged.

**Symptoms:**
- Admin clicks "Mark Paid" button
- Enters transaction ID in the dialog
- Error toast appears: "Failed to payout"
- Payout status remains "PENDING"
- No changes reflected in the database

## Root Cause

The issue was caused by an **authentication mismatch** in the payout API route:

1. **Inconsistent Authentication Methods:**
   - The payout API route (`/app/api/admin/affiliates/payouts/[id]/route.ts`) was using `getServerSession` from NextAuth
   - The rest of the application uses a custom JWT-based authentication (`getAuthenticatedUserSimple`)
   - This caused authentication to fail silently, returning 401 Unauthorized

2. **Missing Pending Earnings Decrement:**
   - When marking a payout as COMPLETED, the code only incremented `paidEarnings`
   - It didn't decrement `pendingEarnings`, causing incorrect balance tracking

3. **Poor Error Handling:**
   - Frontend didn't display specific error messages from the API
   - No console logging to help debug the issue

## Solution Implemented

### 1. Fixed Authentication Method

**File:** `/app/api/admin/affiliates/payouts/[id]/route.ts`

Changed from NextAuth session-based auth to custom JWT auth:

```typescript
// BEFORE
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// AFTER
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

const user = await getAuthenticatedUserSimple(request)
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. Fixed Affiliate Earnings Update

Added proper handling of `pendingEarnings` when marking payout as COMPLETED:

```typescript
// BEFORE
if (status === 'COMPLETED' && currentPayout.status !== 'COMPLETED') {
  await prisma.affiliateProgram.update({
    where: { id: currentPayout.affiliateProgramId },
    data: {
      paidEarnings: {
        increment: currentPayout.amount
      }
    }
  })
}

// AFTER
if (status === 'COMPLETED' && currentPayout.status !== 'COMPLETED') {
  await tx.affiliateProgram.update({
    where: { id: currentPayout.affiliateProgramId },
    data: {
      paidEarnings: {
        increment: currentPayout.amount
      },
      pendingEarnings: {
        decrement: currentPayout.amount  // ✅ Now properly decrements
      }
    }
  })
}
```

### 3. Added Transaction Safety

Wrapped all database updates in a transaction to ensure atomicity:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Update payout
  const payout = await tx.affiliatePayout.update({ ... })
  
  // Update affiliate earnings
  await tx.affiliateProgram.update({ ... })
  
  return payout
})
```

### 4. Enhanced Error Handling

**Backend (API Route):**
```typescript
console.log('📝 Updating payout:', { id, status, transactionId })
console.log('✅ Current payout:', { id, status, amount })
console.log('💰 Marking payout as completed...')
console.log('✅ Payout updated successfully')

return NextResponse.json({ 
  error: 'Internal server error', 
  details: error instanceof Error ? error.message : 'Unknown error' 
}, { status: 500 })
```

**Frontend (Admin Page):**
```typescript
const data = await response.json()
console.log('Payout update response:', data)

if (response.ok) {
  toast.success('Payout status updated successfully')
} else {
  const errorMessage = data.error || data.details || 'Failed to update payout'
  toast.error(errorMessage)
}
```

## How It Works Now

### Payout Flow

1. **Admin clicks "Mark Paid"**
   - Opens dialog to enter transaction ID
   
2. **Admin enters transaction ID and clicks OK**
   - Frontend sends PATCH request to `/api/admin/affiliates/payouts/[id]`
   - Request includes: `status: 'COMPLETED'`, `transactionId`, `paidAt`

3. **API Route Processing**
   - ✅ Authenticates user with JWT token
   - ✅ Verifies user is ADMIN or SUPERADMIN
   - ✅ Fetches current payout from database
   - ✅ Starts database transaction
   - ✅ Updates payout status to COMPLETED
   - ✅ Increments affiliate's `paidEarnings`
   - ✅ Decrements affiliate's `pendingEarnings`
   - ✅ Commits transaction
   - ✅ Returns success response

4. **Frontend Updates**
   - ✅ Shows success toast
   - ✅ Refreshes payouts list
   - ✅ Refreshes affiliates list
   - ✅ Updates displayed balances

### Database Changes

**AffiliatePayout:**
- `status`: PENDING → COMPLETED
- `transactionId`: null → "12345"
- `paidAt`: null → current timestamp

**AffiliateProgram:**
- `paidEarnings`: +$1000 (incremented)
- `pendingEarnings`: -$1000 (decremented)
- `totalEarnings`: unchanged (already includes this amount)

## Files Modified

1. `/app/api/admin/affiliates/payouts/[id]/route.ts`
   - Changed authentication method
   - Added transaction wrapper
   - Fixed earnings update logic
   - Enhanced error handling and logging

2. `/app/(admin)/admin/affiliates/page.tsx`
   - Improved error handling
   - Added console logging
   - Display specific error messages

## Testing Checklist

- [x] Authentication works with JWT tokens
- [x] Admin can mark payout as paid
- [x] Transaction ID is saved correctly
- [x] Paid date is set to current timestamp
- [x] Paid earnings increment correctly
- [x] Pending earnings decrement correctly
- [x] Total earnings remain unchanged
- [x] Success toast appears
- [x] Payout list refreshes
- [x] Affiliate balances update
- [x] Error messages are specific and helpful

## Status

✅ **COMPLETE** - Payout system is now fully functional

- Authentication issue resolved
- Earnings tracking fixed
- Error handling improved
- System ready for production use

## Notes

- This fix aligns the payout API with the rest of the application's authentication pattern
- All database updates are now atomic (using transactions)
- Better logging helps with future debugging
- The fix is backward compatible with existing payouts
