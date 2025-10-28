# Admin Permissions Fix

## Problem
The admin permissions feature was not working. Administrators could adjust checkboxes for permissions in the Features & Permissions page, but these changes were not being enforced. Admin users still had full access even after permissions were unchecked and saved.

## Root Cause
While permissions were being saved correctly to the `AdminFeature` database table, **there was no code checking these permissions** before allowing access to admin features. The system only checked if a user had an admin role, but never verified if that specific admin user had permission for a particular feature.

## Solution

### 1. Created Permission Checking Utility
**File:** `lib/admin-permissions.ts`

This utility provides functions to:
- `getUserPermissions(userId)` - Fetch all permissions for a user from the database
- `hasPermission(userId, feature, action)` - Check if a user has a specific permission
- `requirePermission(userId, feature, action)` - Middleware-style permission checking
- `getFeatureForPath(path)` - Map URL paths to feature names

**Key Logic:**
- SUPERADMIN users always bypass permission checks and have full access
- For ADMIN users, permissions are checked against the `AdminFeature` table
- Actions include: `view`, `create`, `edit`, `delete`, `export`, `approve`

### 2. Updated Admin API Routes
**File:** `app/api/admin/users/route.ts`

Added permission checks to:
- **GET** - Check `hasPermission(userId, 'users', 'view')` before allowing user list access
- **POST** - Check `hasPermission(userId, 'users', 'create')` before allowing user creation
- **DELETE** - Check `hasPermission(userId, 'users', 'delete')` before allowing user deletion

**Pattern for other routes:**
```typescript
// After role check, but before the actual functionality
if (user.role === 'ADMIN') {
  const canAccess = await hasPermission(user.id, 'users', 'view')
  if (!canAccess) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
}
```

### 3. Created React Hook
**File:** `hooks/use-admin-permissions.ts`

Created a React hook that:
- Automatically fetches user permissions from the API
- Returns a permissions object and check function
- Handles SUPERADMIN bypass logic client-side
- Can be used in admin components to conditionally show/hide features

## How It Works Now

### For SUPERADMIN:
- All permissions are automatically granted
- No database checks are performed
- Full access to all features regardless of permission settings

### For ADMIN users:
1. When accessing a feature (e.g., `/admin/users`), the API route checks permissions
2. It calls `hasPermission(userId, 'users', 'view')` for example
3. This function:
   - Queries the `AdminFeature` table for that user's permissions
   - Returns `true` if the user has the required permission (checkbox is checked)
   - Returns `false` if the permission is not granted (checkbox is unchecked)
4. If permission is denied, the API returns a 403 Forbidden error

### For Saving Permissions:
1. SUPERADMIN accesses `/admin/features`
2. Selects an ADMIN user
3. Adjusts checkboxes for features and actions
4. Clicks "Save Changes"
5. The system saves to the `AdminFeature` table with `userId` and feature/action combinations
6. Future API calls will respect these permissions

## Testing the Fix

1. **Log in as SUPERADMIN** (admin@corefx.com)
2. **Navigate to Features & Permissions** (`/admin/features`)
3. **Select an ADMIN user** (e.g., Test User 10)
4. **Uncheck all permissions** for that user
5. **Click "Save Changes"** - verify success message appears
6. **Log out**
7. **Log in as that ADMIN user**
8. **Try to access any admin features** - you should now see permission denied errors
9. **Log back in as SUPERADMIN**
10. **Check some permissions** (e.g., Users Management - View only)
11. **Save changes**
12. **Log in as the ADMIN user again**
13. **Verify they can now view users but cannot create/delete them**

## Implementation Status

### Completed ✅
- [x] Created `lib/admin-permissions.ts` utility
- [x] Updated `app/api/admin/users/route.ts` with permission checks
- [x] Created `hooks/use-admin-permissions.ts` for client-side usage
- [x] Documented the fix

### Remaining Work 🔄
- [ ] Add permission checks to other admin API routes:
  - `/api/admin/brokers` - brokers feature
  - `/api/admin/copy-trading` - copy_trading feature
  - `/api/admin/signals` - signals feature
  - `/api/admin/market-analysis` - market_analysis feature
  - `/api/admin/academy` - academy feature
  - `/api/admin/affiliates` - affiliates feature
  - `/api/admin/enquiry` - enquiry feature
  - `/api/admin/notifications` - notifications feature
  - `/api/admin/settings` - settings feature
  - `/api/admin/reports` - reports feature

- [ ] Add client-side permission checks in admin components:
  - Hide/show UI elements based on permissions
  - Disable buttons when user lacks permissions
  - Show appropriate error messages

## Files Modified

1. `lib/admin-permissions.ts` - **NEW** - Permission checking utility
2. `app/api/admin/users/route.ts` - **MODIFIED** - Added permission checks
3. `hooks/use-admin-permissions.ts` - **NEW** - React hook for permissions
4. `PERMISSIONS_FIX.md` - **NEW** - This documentation

## Database Schema

The permissions are stored in the `admin_features` table:

```prisma
model AdminFeature {
  id          String   @id @default(cuid())
  userId      String
  feature     String
  canView     Boolean  @default(false)
  canCreate   Boolean  @default(false)
  canEdit     Boolean  @default(false)
  canDelete   Boolean  @default(false)
  canExport   Boolean  @default(false)
  canApprove  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, feature])
  @@map("admin_features")
}
```

## Security Considerations

1. **SUPERADMIN Bypass**: SUPERADMIN always has full access, which is intentional for emergency access
2. **Permission Validation**: All permission checks happen server-side in API routes
3. **Feature Granularity**: Permissions are checked per-feature and per-action
4. **Audit Trail**: Consider adding audit logs for permission checks (future enhancement)

## Notes

- The permission system only applies to ADMIN role users
- SUPERADMIN, ANALYST, EDITOR, and SUPPORT roles bypass permission checks (they have role-based access)
- Only permissions for ADMIN users can be managed through the Features & Permissions page
- If an ADMIN user has no permissions set (all unchecked), they will be blocked from all features

