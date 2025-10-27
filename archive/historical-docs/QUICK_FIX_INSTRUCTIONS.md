# Quick Fix for White Screen Issue

## The Problem
The white screen is caused by aggressive CSS hiding in the layout that prevents content from showing if JavaScript fails to load or execute properly.

## Immediate Solution

### Option 1: Clear Browser Cache (RECOMMENDED)
1. **Open Chrome DevTools** (F12 or Cmd+Option+I)
2. **Right-click the refresh button** while DevTools is open
3. **Select "Empty Cache and Hard Reload"**
4. The page should now load correctly

### Option 2: Use Incognito/Private Window
1. **Open a new Incognito/Private window** (Cmd+Shift+N in Chrome)
2. Navigate to: `http://localhost:3000/auth/signup?ref=BR1ACMGZ9K`
3. The page should load without cached issues

### Option 3: Disable JavaScript Temporarily
If the above don't work, there's a CSS issue. Open DevTools Console and check for errors.

## Root Cause Analysis

The layout.tsx file has this CSS:
```css
html { visibility: hidden !important; }
html.theme-loaded { visibility: visible !important; }
```

This hides the entire page until JavaScript adds the `theme-loaded` class. If:
- JavaScript fails to load
- There's a React error
- A provider throws an error
- The theme script fails

The page stays hidden (white screen).

## Permanent Fix Applied

I've already fixed the Suspense issue in `/app/auth/signup/page.tsx`. The page should work now after clearing cache.

## Testing Steps

1. **Clear browser cache** (see Option 1 above)
2. Navigate to: `http://localhost:3000/auth/signup?ref=BR1ACMGZ9K`
3. You should see:
   - ✅ "Create an Account" heading
   - ✅ Green banner: "You were referred by: BR1ACMGZ9K"
   - ✅ Form fields for name, email, password
   - ✅ Sign Up button

4. Fill in the form:
   - Name: Test User
   - Email: testuser@example.com
   - Password: test123
   - Confirm Password: test123

5. Click "Sign Up"
6. You should see success message and redirect to signin

## If Still Getting White Screen

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Share the error messages

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for failed requests (red)
5. Check if `/auth/signup` returns 200 OK

### Check Server Logs
Look at the terminal where `npm run dev` is running. Check for:
- Compilation errors
- Runtime errors
- Module not found errors

## Alternative: Disable Theme Hiding

If you want to remove the aggressive hiding, edit `/app/layout.tsx`:

Find this section (around line 174):
```css
html { visibility: hidden !important; }
html.theme-loaded { visibility: visible !important; }
```

Change to:
```css
html { visibility: visible !important; }
```

This will show content immediately, but may cause a flash of unstyled content.

## Server Status Check

Run these commands to verify server is working:

```bash
# Check if server is running
lsof -i:3000

# Test the signup page
curl -I "http://localhost:3000/auth/signup"

# Should return: HTTP/1.1 200 OK
```

## Next Steps

1. Try clearing cache first
2. If that doesn't work, check browser console for errors
3. Share any error messages you see
4. We can then apply a more targeted fix

---

**Last Updated:** October 23, 2025  
**Status:** Suspense fix applied, awaiting cache clear test
