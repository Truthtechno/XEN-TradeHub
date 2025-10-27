# Admin Dashboard Enhancement Plan

## Current Status
✅ Registration working
✅ API endpoints created
✅ Basic admin page exists
❌ Missing comprehensive view with referee details and payout information

## Required Enhancements

### 1. Enhanced Admin Dashboard Layout

The admin page at `/admin/affiliates` needs to show:

#### Stats Cards (Top Row - 6 cards)
1. **Total Affiliates** - Count with active/inactive breakdown
2. **Total Referrals** - All referred users count
3. **Total Commissions** - Sum of all earnings
4. **Pending Payouts** - Amount awaiting payment
5. **Total Paid Out** - Completed payouts sum
6. **Average Commission** - Per affiliate average

#### Tabbed Interface (4 Tabs)

**Tab 1: Affiliates**
- Table columns:
  - Affiliate Name & Email
  - Affiliate Code
  - Contact (Phone + Payment Method)
  - Tier & Commission Rate
  - Total Referrals
  - Total Earnings
  - Pending Amount
  - Status (Active/Inactive)
  - Actions (View Details, Process Payout, Toggle Status)

**Tab 2: Referrals** 
- Table columns:
  - Referred User (Name & Email)
  - Affiliate (Name & Code)
  - Status (Pending/Converted)
  - Referred Date
  - Conversion Date

**Tab 3: Commissions**
- Table columns:
  - Affiliate (Name & Code)
  - Referred User (Name & Email)
  - Commission Type
  - Amount
  - Description
  - Status
  - Date

**Tab 4: Payouts**
- Table columns:
  - Affiliate (Name, Email, Code)
  - Contact Info (Phone)
  - Payout Details (Account Number, Account Name, Provider/Bank)
  - Amount
  - Payment Method
  - Transaction ID
  - Status
  - Date Paid

### 2. Action Dialogs

#### View Details Dialog
Shows complete affiliate information:
- Personal details
- Contact information
- Payment method and payout details
- Performance metrics
- Recent activity

#### Process Payout Dialog
Form to process payout:
- Shows affiliate name and pending amount
- Shows payout details (account info)
- Input for transaction ID
- Input for notes
- Confirm button

### 3. Features

- **Export to CSV**: Download affiliate data
- **Refresh Data**: Reload all information
- **Search/Filter**: Find specific affiliates
- **Mobile Responsive**: Works on all devices

## Implementation Steps

1. ✅ Create API endpoints (DONE)
2. ⏳ Update admin page with enhanced UI
3. ⏳ Add dialogs for details and payouts
4. ⏳ Implement CSV export
5. ⏳ Add mobile responsiveness
6. ⏳ Test all functionality

## Files Involved

- `/app/(admin)/admin/affiliates/page.tsx` - Main admin page (needs major update)
- `/app/api/admin/affiliates/payouts/process/route.ts` - ✅ Created
- `/app/api/admin/affiliates/[id]/toggle/route.ts` - ✅ Created

## Next Action

Update the admin page to include all the enhancements listed above. The page should be rebuilt with:
- Proper Tabs component from shadcn/ui
- Comprehensive data display
- All referee and payout information visible
- Mobile-responsive design
- Professional UI matching the system

Would you like me to proceed with updating the admin page now?
