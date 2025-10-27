# Reports Page Testing Guide

## Overview
This guide provides step-by-step instructions to test the Reports & Analytics page engagement tracking for all active platforms.

## Prerequisites
1. Server running on `localhost:3000`
2. Admin account logged in
3. At least one test user account

## Test Platforms

### 1. Copy Trading Engagement ✅

**What to Track:**
- Total trades created
- Active copiers (unique users with ACTIVE subscriptions)
- Success rate (calculated metric)

**Test Steps:**

1. **As User - Subscribe to Copy Trading:**
   - Navigate to `/copy-trading`
   - Click "Start Copying" on any master trader
   - Fill in investment amount (e.g., $1000)
   - Submit subscription

2. **Verify in Database:**
   ```sql
   -- Check CopyTradingSubscription table
   SELECT COUNT(*) as total_subscriptions FROM copy_trading_subscriptions;
   SELECT COUNT(DISTINCT userId) as active_copiers 
   FROM copy_trading_subscriptions 
   WHERE status = 'ACTIVE';
   ```

3. **Check Reports Page:**
   - Navigate to `/admin/reports`
   - Verify "Copy Trading Success" card shows correct data
   - Check "Copy Trading Performance" chart displays trades and copiers
   - Export "Copy Trading Report" (Excel/PDF)

**Expected Data:**
- `totalTrades`: Count from `copy_trading_subscriptions`
- `activeCopiers`: Unique users with ACTIVE status
- `successRate`: 65-85% (calculated)

---

### 2. Academy Engagement ✅

**What to Track:**
- Total courses available
- Total enrollments
- Revenue from academy registrations

**Test Steps:**

1. **As Admin - Create Academy Class:**
   - Navigate to `/admin/academy`
   - Click "Create New Class"
   - Fill in details (title, description, price, date)
   - Set delivery mode (Physical/Online)
   - Publish class

2. **As User - Register for Class:**
   - Navigate to `/academy`
   - Click "Register" on any class
   - Complete registration form
   - Submit (status will be PENDING)

3. **As Admin - Confirm Registration:**
   - Navigate to `/admin/academy`
   - Find the registration
   - Change status to CONFIRMED

4. **Verify in Database:**
   ```sql
   -- Check AcademyClass and AcademyClassRegistration tables
   SELECT COUNT(*) as total_classes FROM academy_classes;
   SELECT COUNT(*) as total_registrations FROM academy_class_registrations;
   SELECT SUM(amountUSD) as total_revenue 
   FROM academy_class_registrations 
   WHERE status = 'CONFIRMED';
   ```

5. **Check Reports Page:**
   - Navigate to `/admin/reports`
   - Verify "Academy Revenue" card shows correct revenue
   - Check "Academy Performance" chart displays enrollments
   - Export "Academy Report" (Excel/PDF)

**Expected Data:**
- `totalCourses`: Count from `academy_classes`
- `enrollments`: Count from `academy_class_registrations`
- `revenue`: Sum of `amountUSD` where status = 'CONFIRMED'

---

### 3. Affiliates Engagement ✅

**What to Track:**
- Total active affiliates
- Commissions paid
- Total affiliate revenue

**Test Steps:**

1. **As User - Register as Affiliate:**
   - Navigate to `/affiliates`
   - Click "Join Program"
   - Fill in payment details (Mobile Money, Bank, PayPal, Crypto)
   - Submit registration
   - Note your referral code

2. **Create Referral:**
   - Share referral link: `/auth/signup?ref=YOUR_CODE`
   - Have another user sign up using this link
   - New user should have `referredByCode` set

3. **Generate Commission:**
   - Referred user registers for academy class
   - Commission is auto-created with type ACADEMY
   - Or referred user subscribes to copy trading (requires verification)

4. **As Admin - Process Commission:**
   - Navigate to `/admin/affiliates/commissions`
   - Review pending commissions
   - Approve/verify commissions
   - Process payout requests

5. **Verify in Database:**
   ```sql
   -- Check AffiliateProgram and AffiliateCommission tables
   SELECT COUNT(*) as total_affiliates 
   FROM affiliate_programs 
   WHERE status = 'ACTIVE';
   
   SELECT SUM(amount) as paid_commissions 
   FROM affiliate_commissions 
   WHERE status = 'PAID';
   
   SELECT SUM(amount) as total_revenue 
   FROM affiliate_commissions;
   ```

6. **Check Reports Page:**
   - Navigate to `/admin/reports`
   - Verify affiliate metrics in key cards
   - Check "Affiliates Performance" chart
   - Export "Affiliates Report" (Excel/PDF)

**Expected Data:**
- `totalAffiliates`: Count from `affiliate_programs` where status = 'ACTIVE'
- `commissions`: Sum from `affiliate_commissions` where status = 'PAID'
- `revenue`: Sum from all `affiliate_commissions`

---

### 4. Broker Engagement ✅

**What to Track:**
- Total broker account openings
- Pending vs approved accounts

**Test Steps:**

1. **As Admin - Create Broker:**
   - Navigate to `/admin/brokers`
   - Click "Add New Broker"
   - Fill in broker details (name, description, features)
   - Upload logo
   - Publish broker

2. **As User - Open Broker Account:**
   - Navigate to `/brokers`
   - Click "Open Account" on any broker
   - Fill in account opening form
   - Submit request (status will be PENDING)

3. **As Admin - Approve Account:**
   - Navigate to `/admin/brokers`
   - View account requests
   - Approve/reject requests

4. **Verify in Database:**
   ```sql
   -- Check BrokerAccountOpening table
   SELECT COUNT(*) as total_openings FROM broker_account_openings;
   SELECT COUNT(*) as pending FROM broker_account_openings WHERE status = 'PENDING';
   SELECT COUNT(*) as approved FROM broker_account_openings WHERE status = 'APPROVED';
   ```

5. **Check Reports Page:**
   - Navigate to `/admin/reports`
   - Verify "Broker Registrations" card
   - Export "Broker Report" (Excel/PDF)

**Expected Data:**
- `registrations`: Count from `broker_account_openings`

---

### 5. Enquiries Engagement ✅

**What to Track:**
- Total enquiries
- Resolved vs pending enquiries

**Test Steps:**

1. **As User - Submit Enquiry:**
   - Navigate to `/enquiry` or contact form
   - Fill in enquiry details (subject, message)
   - Submit enquiry (status will be PENDING)

2. **As Admin - Manage Enquiries:**
   - Navigate to `/admin/enquiry`
   - View all enquiries
   - Respond to enquiries
   - Mark as RESOLVED

3. **Verify in Database:**
   ```sql
   -- Check Enquiry table
   SELECT COUNT(*) as total_enquiries FROM enquiries;
   SELECT COUNT(*) as pending FROM enquiries WHERE status = 'PENDING';
   SELECT COUNT(*) as resolved FROM enquiries WHERE status = 'RESOLVED';
   ```

4. **Check Reports Page:**
   - Navigate to `/admin/reports`
   - Verify "Live Enquiries" card shows correct counts
   - Export reports if needed

**Expected Data:**
- `total`: Count from `enquiries`
- `pending`: Count where status = 'PENDING'
- `resolved`: Count where status = 'RESOLVED'

---

## Testing Checklist

### Data Accuracy
- [ ] Copy Trading metrics match database counts
- [ ] Academy revenue calculations are correct
- [ ] Affiliate commissions are accurately tracked
- [ ] Broker registrations are counted properly
- [ ] Enquiry statuses are correct

### Charts & Visualizations
- [ ] Revenue Trend chart displays correctly
- [ ] User Growth chart shows new users
- [ ] Copy Trading Performance chart renders
- [ ] Academy Performance chart displays enrollments
- [ ] Affiliates Performance chart shows data

### Report Exports
- [ ] Users Report exports (Excel & PDF)
- [ ] Revenue Report exports (Excel & PDF)
- [ ] Copy Trading Report exports (Excel & PDF)
- [ ] Academy Report exports (Excel & PDF)
- [ ] Affiliates Report exports (Excel & PDF)
- [ ] Broker Report exports (Excel & PDF)
- [ ] Full Report exports (Excel & PDF)

### Date Range Filtering
- [ ] Last 7 days filter works
- [ ] Last 30 days filter works (default)
- [ ] Last 90 days filter works
- [ ] Last year filter works
- [ ] All time filter works

### User Interface
- [ ] All metric cards display without errors
- [ ] Charts render properly in light/dark mode
- [ ] Export buttons show loading states
- [ ] Refresh button updates data
- [ ] No console errors

---

## Common Issues & Solutions

### Issue: Metrics showing 0
**Solution:** Ensure you have created test data for each platform. Run through the test steps above to generate engagement data.

### Issue: Charts not rendering
**Solution:** Check browser console for errors. Ensure chart data API endpoints are returning data in correct format.

### Issue: Export failing
**Solution:** Verify export API route is working. Check server logs for errors.

### Issue: Date range not filtering
**Solution:** Ensure all database queries use the `createdAt` field with proper date comparisons.

---

## Database Quick Checks

Run these queries in Prisma Studio or your database client:

```sql
-- Copy Trading
SELECT COUNT(*) FROM copy_trading_subscriptions;

-- Academy
SELECT COUNT(*) FROM academy_class_registrations WHERE status = 'CONFIRMED';
SELECT SUM(amountUSD) FROM academy_class_registrations WHERE status = 'CONFIRMED';

-- Affiliates
SELECT COUNT(*) FROM affiliate_programs WHERE status = 'ACTIVE';
SELECT SUM(amount) FROM affiliate_commissions WHERE status = 'PAID';

-- Brokers
SELECT COUNT(*) FROM broker_account_openings;

-- Enquiries
SELECT COUNT(*) FROM enquiries;
SELECT COUNT(*) FROM enquiries WHERE status = 'PENDING';
```

---

## Success Criteria

✅ All metrics display accurate data from database  
✅ Charts render correctly with real data  
✅ All export functions work without errors  
✅ Date range filtering updates all metrics  
✅ No console errors or white screens  
✅ Data updates in real-time when new engagement occurs  

---

## Next Steps

After completing all tests:
1. Document any discrepancies found
2. Fix any calculation errors
3. Ensure all commission tracking works with affiliate system
4. Verify revenue calculations include all sources
5. Test with larger datasets for performance
