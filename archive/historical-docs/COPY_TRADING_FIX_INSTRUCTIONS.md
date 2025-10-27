# Copy Trading Platform - Fix Instructions

## Issue
You're seeing "Unauthorized" errors when trying to create/edit platforms, and the console shows Prisma client errors.

## Root Cause
The Next.js dev server cached the old Prisma client before the migration. Even though we regenerated the Prisma client, the running dev server is still using the old cached version.

## Solution

### Step 1: Stop the Dev Server
Press `Ctrl+C` in your terminal to stop the currently running dev server.

### Step 2: Clear All Caches
Run these commands:
```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma Client
npx prisma generate

# Clear node modules cache (optional but recommended)
rm -rf node_modules/.cache
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

### Step 4: Hard Refresh Browser
1. Go to `http://localhost:3000/admin/copy-trading`
2. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux) to hard refresh
3. You should now see the Exness and HFM platforms
4. Try editing one - it should work now!

## Verification

After restarting, you should see:
- ✅ Exness platform in the table
- ✅ HFM platform in the table
- ✅ Ability to click "Edit" and update platforms
- ✅ Ability to click "Add Platform" and create new ones
- ✅ No "Unauthorized" errors
- ✅ No Prisma errors in console

## If Still Not Working

If you still see issues after following the above steps:

### Check 1: Verify Database Migration
```bash
npx prisma migrate status
```

Should show all migrations applied.

### Check 2: Verify Data Exists
```bash
npx tsx scripts/check-platforms.ts
```

Should show:
```
Found 2 platforms:
- Exness (exness) - Active: true
- HFM (hfm) - Active: true
```

### Check 3: Test API Directly
With the dev server running and while logged in as admin, open browser console and run:
```javascript
fetch('/api/admin/copy-trading/platforms')
  .then(r => r.json())
  .then(console.log)
```

Should return:
```json
{
  "platforms": [
    { "name": "Exness", ... },
    { "name": "HFM", ... }
  ]
}
```

## Common Issues

### Issue: "Cannot read properties of undefined (reading 'findMany')"
**Solution:** Prisma client not regenerated. Run `npx prisma generate` and restart dev server.

### Issue: "Unknown field `platform`"
**Solution:** Old Prisma client cached. Clear `.next` folder and restart.

### Issue: Still shows "Unauthorized"
**Solution:** 
1. Make sure you're logged in as ADMIN or SUPERADMIN
2. Check browser console for actual error
3. Verify session is valid (try logging out and back in)

## Quick Fix Command

Run all fixes at once:
```bash
rm -rf .next && npx prisma generate && npm run dev
```

Then hard refresh your browser at `/admin/copy-trading`.
