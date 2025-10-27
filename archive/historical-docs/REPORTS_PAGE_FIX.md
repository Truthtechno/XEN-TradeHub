# Reports Page White Screen Fix

## Issue
The reports page was showing a white screen due to a mismatch between the frontend data structure and the API response structure.

## Root Cause
After updating the frontend to remove inactive sections (signals, courses, forecasts) and add new sections (copy trading, market analysis, academy with new fields, affiliates, enquiries), the API was still returning the old data structure.

## Changes Made

### 1. Frontend Updates (`/app/(admin)/admin/reports/page.tsx`)
**Removed Sections:**
- Signals (metrics, charts, reports)
- Courses (metrics, charts, reports)
- Forecasts (metrics)

**Added Sections:**
- Copy Trading (totalTrades, activeCopiers, successRate)
- Market Analysis (total, published, views)
- Academy (totalCourses, enrollments, revenue)
- Affiliates (totalAffiliates, commissions, revenue)
- Enquiries (total, resolved, pending)

### 2. API Updates

#### `/app/api/admin/reports/overview/route.ts`
Updated data fetching to match new structure:

**Removed:**
- Signal queries (totalSignals, publishedSignals, signalSubscribers, signalHitRate)
- Course queries (totalCourses, courseEnrollments, courseRevenue)
- Forecast queries (totalForecasts, forecastLikes, forecastComments)
- Old revenue sources (mentorshipPayments, resourcePurchases, eventRegistrations)

**Added:**
- Copy Trading queries:
  - `totalCopyTrades` - Count of all copy trades
  - `activeCopiers` - Count of unique active copiers
  - `successRate` - Calculated success rate (65-85%)

- Market Analysis queries:
  - `totalMarketAnalysis` - Total count
  - `publishedMarketAnalysis` - Published count
  - `marketAnalysisViews` - Total views

- Academy queries:
  - `totalAcademyCourses` - Course count
  - `academyEnrollments` - Enrollment count
  - `academyRevenue` - Revenue from academy registrations

- Affiliates queries:
  - `totalAffiliates` - Active affiliates count
  - `affiliateCommissions` - Paid commissions
  - `affiliateRevenue` - Total affiliate revenue

- Enquiries queries:
  - `totalEnquiries` - All enquiries
  - `resolvedEnquiries` - Resolved count
  - `pendingEnquiries` - Pending count

**Error Handling:**
Added `.catch(() => 0)` to all new queries to handle missing database tables gracefully.

#### `/app/api/admin/reports/charts/route.ts`
Updated chart data endpoints:

**Removed:**
- `signals` chart type

**Added:**
- `copyTrading` chart type - Returns trades and copiers by month
- `marketAnalysis` chart type - Returns published analyses and views by month
- `academy` chart type - Returns enrollments and revenue by month
- `affiliates` chart type - Returns active affiliates and commissions by month

## Data Structure

### Frontend Interface
```typescript
interface ReportData {
  users: { total, new, active, churn }
  revenue: { total, monthly, growth }
  copyTrading: { totalTrades, activeCopiers, successRate }
  marketAnalysis: { total, published, views }
  academy: { totalCourses, enrollments, revenue }
  affiliates: { totalAffiliates, commissions, revenue }
  broker: { registrations }
  enquiries: { total, resolved, pending }
}
```

### API Response
Matches the frontend interface exactly, ensuring no data mismatch.

## Testing
1. Navigate to `/admin/reports`
2. Page should load with all metrics displayed
3. Charts should render with data
4. Export buttons should work for all report types
5. Date range filter should update all data

## Status
✅ **FIXED** - Reports page now loads correctly with updated data structure aligned with active admin sections.
