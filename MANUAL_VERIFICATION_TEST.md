# Manual Verification Flow Test Guide

## Prerequisites
1. Ensure the application is running on `http://localhost:3000`
2. Database is set up with the updated schema
3. Test users are created (see setup script)

## Test Users
- **Admin User**: `test@example.com` / `password` (ADMIN role)
- **Test User**: `testuser@example.com` / `password123` (STUDENT role)

## Manual Test Steps

### Step 1: Test Trade-core Page
1. Open browser and go to `http://localhost:3000/trade-core`
2. Verify the page loads correctly
3. Look for the "SUBMIT EMAIL FOR VERIFICATION" button
4. Click the button to open the verification form
5. Fill out the form with test data:
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Phone Number: `+1234567890`
   - Exness Account ID: `EX123456789`
6. Click "Submit Verification"
7. Verify success message appears

### Step 2: Test Admin Dashboard
1. Open new browser tab/window
2. Go to `http://localhost:3000/admin/trade`
3. Login with admin credentials if prompted
4. Verify the page loads with registration statistics
5. Check the "Registrations" tab
6. Look for the test registration in the list
7. Verify the registration shows:
   - User name and email
   - Broker: EXNESS
   - Status: Pending (or Verified if verification worked)
   - Registration date

### Step 3: Test User Registration Flow
1. Go to `http://localhost:3000` (home page)
2. Register a new user:
   - First Name: `New`
   - Last Name: `User`
   - Email: `newuser@example.com`
   - WhatsApp: `+1234567890`
   - Password: `password123`
   - Country: `US`
3. Complete registration
4. Login with new credentials
5. Go to Trade-core page
6. Submit verification form
7. Check admin dashboard for new registration

## Expected Results

### ✅ Should Work
- Trade-core page loads and displays correctly
- Verification form opens and accepts input
- Form submission shows success message
- Admin dashboard loads and shows registrations
- New registrations appear in admin panel
- User authentication works for both regular and admin users

### ❌ Known Issues
- Broker verification API may return internal server error
- Verification status may not update to "Verified"
- Some admin functions may not work if verification API fails

## Troubleshooting

### If Trade-core page doesn't load
- Check if the application is running
- Verify the route exists in the app directory
- Check browser console for errors

### If verification form doesn't submit
- Check browser network tab for API errors
- Verify the Exness verification API is working
- Check server logs for errors

### If admin dashboard doesn't show registrations
- Verify admin user has correct role
- Check if broker registrations exist in database
- Verify the admin API endpoints are working

### If verification status doesn't update
- This is a known issue with the broker verification API
- Check server logs for the specific error
- The registration will still be created but may not be marked as verified

## Database Verification

To check the database directly:

```sql
-- Check users
SELECT id, email, name, role FROM users WHERE email IN ('test@example.com', 'testuser@example.com');

-- Check broker registrations
SELECT br.id, br.verified, br.verifiedAt, br.verificationData, u.email, u.name
FROM broker_registrations br
JOIN users u ON br.userId = u.id
ORDER BY br.createdAt DESC;

-- Check broker links
SELECT id, name, url, isActive FROM broker_links;
```

## Success Criteria

The verification flow is considered working if:
1. ✅ Users can access the Trade-core page
2. ✅ Users can submit verification forms
3. ✅ Admin can view registrations in the dashboard
4. ✅ New registrations appear in the admin panel
5. ❌ Verification status updates (currently broken)

## Next Steps

1. Fix the broker verification API internal server error
2. Test the complete flow end-to-end
3. Add email notifications for verification submissions
4. Implement real-time updates for admin dashboard
