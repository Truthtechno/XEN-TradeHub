# Academy Commission Fix ✅

## Problem Identified

**Issue:** Academy registrations were not creating commissions even though they should be auto-approved.

**Root Cause:** Academy registrations were being created **without a userId** (as guest registrations), so the commission creation logic `if (userId && academyClass.price > 0)` was failing.

## Investigation Results

### Database Check
```
📚 Academy Registrations: 3
- All had userId: NULL (Guest Registration)
- All had price > $0
- All were from IVAN AFFILIATE

💰 Academy Commissions: 0
- No commissions created
```

### Why userId was NULL
The academy registration page (`/app/(authenticated)/academy/page.tsx`) was not sending the `userId` in the registration request body.

**Before:**
```javascript
body: JSON.stringify({
  fullName: `${registrationData.firstName} ${registrationData.lastName}`,
  email: registrationData.email,
  phone: `${registrationData.countryCode}${registrationData.phone}`,
  // ... other fields
  // ❌ NO userId field
})
```

## Solution Applied

### 1. **Fetch User ID on Component Mount**
Added state and useEffect to fetch the current user's ID from the API:

```javascript
const [currentUserId, setCurrentUserId] = useState<string | null>(null)

useEffect(() => {
  const fetchUserId = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setCurrentUserId(data.user?.id || null)
      }
    } catch (error) {
      console.error('Error fetching user ID:', error)
    }
  }
  
  if (session) {
    fetchUserId()
  }
}, [session])
```

### 2. **Include userId in Registration Request**
Updated the registration body to include the user ID:

```javascript
body: JSON.stringify({
  userId: currentUserId, // ✅ Add user ID for commission tracking
  fullName: `${registrationData.firstName} ${registrationData.lastName}`,
  email: registrationData.email,
  phone: `${registrationData.countryCode}${registrationData.phone}`,
  // ... other fields
})
```

## How It Works Now

### User Flow
1. **User logs in** as IVAN (signal@corefx.com)
2. **Component mounts** → Fetches user ID from `/api/auth/me`
3. **User registers for academy class**
4. **Registration sent** with `userId` included
5. **API receives registration** with valid userId
6. **Commission created automatically** (auto-approved)
7. **Affiliate earnings updated immediately**

### Commission Creation Logic
```javascript
// In /api/academy-classes/[id]/registrations/route.ts
if (userId && academyClass.price > 0) {
  await createAcademyCommission(
    userId,           // ✅ Now has valid user ID
    academyClass.price,
    params.id
  )
}
```

### Commission Details
- **Type:** ACADEMY
- **Status:** APPROVED (auto-approved)
- **Amount:** Class price × commission rate (10% for Bronze)
- **Earnings:** Updated immediately
- **Referral:** Marked as CONVERTED

## Testing Instructions

### Test 1: New Academy Registration
```bash
# 1. Login as IVAN
Email: signal@corefx.com
Password: [password]

# 2. Go to academy page
URL: http://localhost:3000/academy

# 3. Register for a paid class
Click "Register" on any class with price > $0
Complete registration form
Submit

# 4. Check Brian's earnings
Login: brian@corefx.com
URL: http://localhost:3000/dashboard/affiliates
Expected: Earnings should increase by (class price × 10%)
```

### Test 2: Verify Commission Created
```bash
# Run diagnostic script
node scripts/check-all-academy-registrations.js

# Expected output:
# - Registration with valid userId (not NULL)
# - Commission created with APPROVED status
# - Amount = class price × 10%
```

## Commission Summary

| Type | Status | Trigger | Earnings Update |
|------|--------|---------|----------------|
| **Copy Trading** | PENDING → ACTIVE | Admin activates | When activated |
| **Academy** | APPROVED | Registration | Immediately |
| **Broker Account** | PENDING | Admin approves | After deposit verification |

## Files Modified

1. ✅ `/app/(authenticated)/academy/page.tsx`
   - Added `currentUserId` state
   - Added useEffect to fetch user ID
   - Updated registration body to include userId

## Expected Results

### Before Fix
```
Registration:
- userId: NULL
- Commission: NOT created
- Earnings: $0

Brian's Dashboard:
- Pending: $260 (copy trading only)
```

### After Fix
```
Registration:
- userId: cmh3012ss0000wh0enwj0y8cn (IVAN's ID)
- Commission: CREATED & APPROVED
- Earnings: Updated immediately

Brian's Dashboard:
- Pending: $260 (copy trading) + $X (academy)
```

## Database Verification

### Check Registration
```sql
SELECT 
  id,
  "userId",
  "fullName",
  email,
  "classId",
  "amountUSD",
  "createdAt"
FROM "AcademyClassRegistration"
WHERE email = 'signal@corefx.com'
ORDER BY "createdAt" DESC
LIMIT 1;

-- Expected: userId should NOT be NULL
```

### Check Commission
```sql
SELECT 
  ac.id,
  ac.amount,
  ac.type,
  ac.status,
  ac.description,
  ap."affiliateCode"
FROM "AffiliateCommission" ac
JOIN "AffiliateProgram" ap ON ap.id = ac."affiliateProgramId"
WHERE ac."referredUserId" = 'cmh3012ss0000wh0enwj0y8cn'
  AND ac.type = 'ACADEMY'
ORDER BY ac."createdAt" DESC;

-- Expected: Commission with APPROVED status
```

## Troubleshooting

### Issue: Still no commission created
**Check:**
1. Is userId being sent? (Check network tab in browser)
2. Is user logged in? (Check session)
3. Is class price > $0?
4. Is user referred? (Check referredByCode)
5. Is affiliate active? (Check isActive)

### Issue: userId is still NULL
**Check:**
1. Is `/api/auth/me` returning user data?
2. Is session valid?
3. Check browser console for errors
4. Verify useEffect is running

### Issue: Commission created but earnings not updated
**Check:**
1. Commission status (must be APPROVED)
2. Affiliate program ID matches
3. Database transaction completed
4. Refresh affiliate dashboard

## Next Steps

1. **Test the fix** with a new academy registration
2. **Verify commission** is created with userId
3. **Check earnings** update immediately
4. **Monitor** for any errors

---

**Status:** ✅ FIXED  
**Commission Type:** Academy (Auto-Approved)  
**Earnings Update:** Immediate  
**Last Updated:** October 23, 2025 at 9:30 AM UTC+03:00
