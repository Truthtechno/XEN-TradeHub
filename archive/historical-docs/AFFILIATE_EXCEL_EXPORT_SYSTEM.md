# Affiliate Excel Export System

## Overview

Implemented professional Excel export functionality for the Affiliate Management page, matching the format used in the Reports page. The system respects all active filters and provides multiple export options.

## Features

### 1. **Professional Excel Format**
- Uses XLSX library (same as Reports page)
- Styled headers with colors
- Title rows with metadata
- Auto-sized columns
- Professional formatting

### 2. **Export Options**
- **Export Affiliates**: Export filtered affiliate programs
- **Export Payouts**: Export filtered payouts
- **Export Referrals**: Export filtered referrals
- **Export All Data**: Export all three datasets in separate sheets

### 3. **Filter-Aware Exports**
All exports respect the current filter settings:
- Search term
- Tier filter
- Status filters
- Payment method filter
- Date range filter
- Custom date range

### 4. **Dropdown Menu Interface**
- Clean dropdown menu (not a simple button)
- Shows filtered count for each export option
- Disabled state while exporting
- Visual feedback with icons

## Technical Implementation

### API Route

**File**: `/app/api/admin/affiliates/export/route.ts`

**Features**:
- Accepts filter parameters
- Fetches filtered data from database
- Generates professional Excel files
- Returns downloadable .xlsx file

**Endpoints**:
```typescript
POST /api/admin/affiliates/export
Body: {
  exportType: 'affiliates' | 'payouts' | 'referrals' | 'all',
  filters: {
    searchTerm, tierFilter, statusFilter,
    payoutStatusFilter, paymentMethodFilter,
    referralStatusFilter, dateFilter,
    startDate, endDate
  }
}
```

### Frontend Implementation

**File**: `/app/(admin)/admin/affiliates/page.tsx`

**Added**:
1. Export state (`isExporting`)
2. Export function (`exportData`)
3. Dropdown menu with 4 export options
4. Filter collection for API request

### Excel Sheet Structure

#### Affiliates Sheet
**Columns**:
- Full Name
- Email
- Affiliate Code
- Tier
- Commission Rate
- Total Earnings
- Pending Earnings
- Paid Earnings
- Total Referrals
- Phone
- Payment Method
- Status
- Joined Date

**Metadata**:
- Total affiliates count
- Active count
- Total earnings
- Total pending
- Total paid
- Total referrals
- Applied filters

**Styling**:
- Orange theme (#F59E0B)
- Bold white headers
- Auto-sized columns

#### Payouts Sheet
**Columns**:
- Affiliate Name
- Email
- Affiliate Code
- Amount
- Payment Method
- Status
- Transaction ID
- Notes
- Created Date
- Paid Date

**Metadata**:
- Total payouts count
- Completed count
- Pending count
- Total amount
- Applied filters

**Styling**:
- Green theme (#10B981)
- Bold white headers
- Auto-sized columns

#### Referrals Sheet
**Columns**:
- Affiliate Code
- Referred User Name
- Referred User Email
- Status
- Registration Date
- Conversion Date

**Metadata**:
- Total referrals count
- Converted count
- Pending count
- Applied filters

**Styling**:
- Purple theme (#8B5CF6)
- Bold white headers
- Auto-sized columns

## Usage Examples

### Example 1: Export Filtered Affiliates
1. Open Search & Filters
2. Select "BRONZE" tier
3. Select "Active" status
4. Select "Last 30 Days"
5. Click "Export Excel" → "Export Affiliates"
6. Downloads: `affiliates_export_2025-10-24.xlsx`
7. Excel file contains only Bronze, Active affiliates from last 30 days
8. Filter info shown in metadata row

### Example 2: Export Specific Period Payouts
1. Open Search & Filters
2. Select "Custom Range"
3. Set start date: Jan 1, 2025
4. Set end date: Jan 31, 2025
5. Select "COMPLETED" status
6. Click "Export Excel" → "Export Payouts"
7. Downloads: `payouts_export_2025-10-24.xlsx`
8. Excel file contains only completed payouts from January 2025

### Example 3: Export All Data
1. Set any filters you want
2. Click "Export Excel" → "Export All Data"
3. Downloads: `all_export_2025-10-24.xlsx`
4. Excel file contains 3 sheets:
   - Affiliate Programs
   - Affiliate Payouts
   - Affiliate Referrals
5. All sheets respect the same filters

### Example 4: Export Search Results
1. Search for "brian"
2. Click "Export Excel" → "Export Affiliates"
3. Downloads: `affiliates_export_2025-10-24.xlsx`
4. Excel file contains only affiliates matching "brian"
5. Metadata shows: `Filters: Search: "brian"`

## Filter Integration

### Date Filters
```typescript
switch (dateFilter) {
  case 'today':
    // Only today's records
  case 'week':
    // Last 7 days
  case 'month':
    // Last 30 days
  case 'custom':
    // Between startDate and endDate
  default:
    // All time
}
```

### Search Filter
Searches across:
- User names
- Email addresses
- Affiliate codes
- Full names
- Transaction IDs (for payouts)

### Status Filters
- Affiliate status (Active/Inactive)
- Payout status (Pending/Completed/Failed)
- Referral status (Pending/Converted)
- Payment method
- Tier level

## UI Components

### Dropdown Menu
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" disabled={isExporting}>
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      {isExporting ? 'Exporting...' : 'Export Excel'}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuItem onClick={() => exportData('affiliates')}>
      <Users className="mr-2 h-4 w-4" />
      Export Affiliates ({filteredAffiliates.length})
    </DropdownMenuItem>
    {/* More options... */}
  </DropdownMenuContent>
</DropdownMenu>
```

### Export Function
```typescript
const exportData = async (exportType) => {
  setIsExporting(true)
  try {
    // Collect all filter values
    const filters = {
      searchTerm, tierFilter, statusFilter,
      payoutStatusFilter, paymentMethodFilter,
      referralStatusFilter, dateFilter,
      startDate, endDate
    }

    // Call API
    const response = await fetch('/api/admin/affiliates/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exportType, filters })
    })

    // Download file
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportType}_export_${date}.xlsx`
    a.click()

    toast.success('Exported successfully')
  } catch (error) {
    toast.error('Export failed')
  } finally {
    setIsExporting(false)
  }
}
```

## Database Queries

### Affiliates Query
```typescript
await prisma.affiliateProgram.findMany({
  where: {
    createdAt: dateRange,
    tier: tierFilter !== 'all' ? tierFilter : undefined,
    isActive: statusFilter !== 'all' ? (statusFilter === 'active') : undefined,
    OR: searchTerm ? [
      { user: { name: { contains: searchTerm } } },
      { user: { email: { contains: searchTerm } } },
      { affiliateCode: { contains: searchTerm } },
      { fullName: { contains: searchTerm } }
    ] : undefined
  },
  include: {
    user: { select: { name: true, email: true } }
  },
  orderBy: { createdAt: 'desc' }
})
```

### Payouts Query
```typescript
await prisma.affiliatePayout.findMany({
  where: {
    createdAt: dateRange,
    status: payoutStatusFilter !== 'all' ? payoutStatusFilter : undefined,
    method: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
    OR: searchTerm ? [
      { affiliateProgram: { user: { name: { contains: searchTerm } } } },
      { affiliateProgram: { user: { email: { contains: searchTerm } } } },
      { transactionId: { contains: searchTerm } }
    ] : undefined
  },
  include: {
    affiliateProgram: {
      include: {
        user: { select: { name: true, email: true } }
      }
    }
  },
  orderBy: { createdAt: 'desc' }
})
```

## Benefits

### For Admins
- **Quick Exports**: One-click export with filters applied
- **Professional Format**: Excel files ready for analysis
- **Flexible Options**: Export exactly what you need
- **Filter Transparency**: See which filters were applied in the file

### For Data Analysis
- **Structured Data**: Clean, organized columns
- **Metadata Included**: Context about the export
- **Multiple Sheets**: All data in one file (when using "Export All")
- **Formatted Numbers**: Currency and percentages properly formatted

### For Reporting
- **Professional Appearance**: Styled headers and colors
- **Summary Statistics**: Totals and counts included
- **Date Information**: Generation timestamp included
- **Filter Documentation**: Applied filters shown in metadata

## Files Modified

1. **API Route** (NEW): `/app/api/admin/affiliates/export/route.ts`
   - 600+ lines
   - Complete export logic
   - Filter-aware queries
   - Professional Excel generation

2. **Frontend**: `/app/(admin)/admin/affiliates/page.tsx`
   - Added export state
   - Added export function
   - Added dropdown menu
   - Integrated with filters

## Dependencies

**Required Package**:
```json
{
  "xlsx": "^0.18.5"
}
```

Already installed (used by Reports page).

## Testing Checklist

- [x] Export affiliates with no filters
- [x] Export affiliates with tier filter
- [x] Export affiliates with status filter
- [x] Export affiliates with date filter
- [x] Export affiliates with search term
- [x] Export affiliates with multiple filters
- [x] Export payouts with status filter
- [x] Export payouts with payment method filter
- [x] Export payouts with date range
- [x] Export referrals with status filter
- [x] Export all data (3 sheets)
- [x] Verify Excel file formatting
- [x] Verify column widths
- [x] Verify metadata accuracy
- [x] Verify filter info display
- [x] Test with custom date range
- [x] Test with empty results
- [x] Test loading state
- [x] Test error handling

## Status

✅ **COMPLETE** - Professional Excel export system fully implemented

The export system is production-ready and provides:
- Professional Excel formatting matching Reports page
- Full filter integration
- Multiple export options
- Clean UI with dropdown menu
- Comprehensive metadata
- Error handling and loading states

All exports respect the current filter settings, ensuring users only export the data they're viewing!
