# Academy Class Enhancements

## Overview
Enhanced the academy class creation and display system with delivery mode selection and free course display logic.

## Changes Made

### 1. Database Schema Updates
**File:** `prisma/schema.prisma`
- Added `deliveryMode` field to `AcademyClass` model
  - Type: `String` with default value `"PHYSICAL"`
  - Supports: `PHYSICAL` and `ONLINE` options
  - Migration: `20251021020012_add_delivery_mode_to_academy_class`
  
- Added `scheduleType` field to `AcademyClass` model
  - Type: `String` with default value `"ONE_TIME"`
  - Supports: `ONE_TIME` and `RECURRING` options
  
- Added `recurrencePattern` field to `AcademyClass` model
  - Type: `String?` (optional/nullable)
  - Stores human-readable recurrence pattern (e.g., "Every Tuesday", "Weekly on Mondays")
  - Migration: `20251021023738_add_schedule_type_to_academy_class`

### 2. Admin Panel Updates
**File:** `app/(admin)/admin/academy/page.tsx`

#### Interface Updates
- Added `deliveryMode: 'PHYSICAL' | 'ONLINE'` to `AcademyClass` interface
- Added `scheduleType: 'ONE_TIME' | 'RECURRING'` to `AcademyClass` interface
- Added `recurrencePattern?: string` to `AcademyClass` interface

#### Form State Updates
- Added `deliveryMode: 'PHYSICAL'` to initial form state
- Added `scheduleType: 'ONE_TIME'` to initial form state
- Added `recurrencePattern: ''` to initial form state
- Updated `resetForm()` function to include all new fields
- Updated `openEditDialog()` to populate all new fields from existing class data

#### UI Updates - Create Dialog
- Added "Delivery Mode" dropdown after Location field
  - Options: Physical, Online
  - Styled with theme colors for consistency
  
- Added "Schedule Type" dropdown after Max Students field
  - Options: One-Time Session, Recurring Schedule
  - Default: One-Time Session
  
- Added "Recurrence Pattern" text field (conditional)
  - Only visible when Schedule Type is "Recurring Schedule"
  - Accepts human-readable patterns (e.g., "Every Tuesday", "Weekly on Mondays")
  - Placeholder text guides user input

- Updated "Next Session" field
  - Changed from date-only to datetime picker
  - Allows admin to set both date and time
  - Format: YYYY-MM-DD HH:mm
  - Prevents default 03:00 AM time issue

#### UI Updates - Edit Dialog
- Added "Delivery Mode" dropdown after Location field
  - Options: Physical, Online
  - Preserves existing value when editing
  
- Added "Schedule Type" dropdown after Max Students field
  - Options: One-Time Session, Recurring Schedule
  - Preserves existing value when editing
  
- Added "Recurrence Pattern" text field (conditional)
  - Only visible when Schedule Type is "Recurring Schedule"
  - Preserves existing pattern when editing

- Updated "Next Session" field
  - Changed from date-only to datetime picker
  - Allows admin to set both date and time
  - Properly formats existing datetime when editing
  - Format: YYYY-MM-DD HH:mm

### 3. API Route Updates

#### POST Route
**File:** `app/api/academy-classes/route.ts`
- Added `deliveryMode` parameter with default value `'PHYSICAL'`
- Added `scheduleType` parameter with default value `'ONE_TIME'`
- Added `recurrencePattern` parameter (optional)
- Updated validation to allow `price` of 0 (changed from `!price` to `price === undefined`)
- Converts deliveryMode and scheduleType to uppercase before saving
- Stores recurrencePattern as null if empty

#### PUT Route
**File:** `app/api/academy-classes/[id]/route.ts`
- Added `deliveryMode` parameter to update body
- Added `scheduleType` parameter to update body
- Added `recurrencePattern` parameter to update body
- Added conditional updates for all new fields
- Converts deliveryMode and scheduleType to uppercase before updating
- Stores recurrencePattern as null if empty

### 4. User-Facing Page Updates
**File:** `app/(authenticated)/academy/page.tsx`

#### Interface Updates
- Added `deliveryMode?: 'PHYSICAL' | 'ONLINE'` to `AcademyClass` interface
- Added `scheduleType?: 'ONE_TIME' | 'RECURRING'` to `AcademyClass` interface
- Added `recurrencePattern?: string` to `AcademyClass` interface

#### Icon Import
- Added `Monitor` icon from lucide-react for delivery mode display

#### Price Display Logic
- Implemented "Free" display when `price === 0` or `!price`
- Maintains currency formatting for paid courses
- Shows "Free" in bold primary color for visual emphasis
- Admin panel also displays "Free" for zero-price courses
- Empty price input defaults to 0 (Free) instead of throwing error

#### Delivery Mode Display
- Added delivery mode indicator in course card details
- Shows "Online Session" or "Physical Session" based on deliveryMode value
- Uses Monitor icon for visual consistency
- Conditionally rendered (only shows if deliveryMode is set)

#### Schedule Display
- Smart display of session timing based on schedule type
- **One-Time Sessions:** Shows "Next session: [date and time]"
- **Recurring Sessions:** Shows "[Recurrence Pattern] (Next: [date and time])"
  - Example: "Every Tuesday (Next: Nov 12, 2025, 06:00 PM)"
  - Example: "Weekly on Mondays (Next: Nov 13, 2025, 10:00 AM)"
- Provides clear context for both one-time and ongoing classes
- Displays time in user-friendly format (12-hour with AM/PM)

## Features

### Admin Features
1. **Delivery Mode Selection**
   - Dropdown in both Create and Edit dialogs
   - Two options: Physical, Online
   - Default: Physical
   - Required field with visual consistency

2. **Free Course Support**
   - Can set price to 0 or leave blank to create free courses
   - Empty price field defaults to 0 (Free)
   - Validation updated to allow zero prices
   - Admin panel displays "Free" instead of "$0.00"
   - No error messages for empty price field

3. **Schedule Type Selection**
   - Dropdown in both Create and Edit dialogs
   - Two options: One-Time Session, Recurring Schedule
   - Default: One-Time Session
   - Conditional recurrence pattern field
   
4. **Recurrence Pattern**
   - Text field appears only when "Recurring Schedule" is selected
   - Accepts human-readable patterns
   - Examples: "Every Tuesday", "Weekly on Mondays", "First Saturday of each month"
   - Flexible format allows natural language descriptions
   - Optional field (can be left empty for recurring classes)

### User Features
1. **Delivery Mode Visibility**
   - Clear indication of session type (Physical/Online)
   - Icon-based display for quick recognition
   - Positioned with other course details (location, instructor, etc.)

2. **Free Course Display**
   - Shows "Free" instead of "$0.00" for zero-price courses
   - Maintains visual hierarchy with bold primary color
   - Consistent with paid course price display

3. **Smart Schedule Display**
   - Automatically adapts based on schedule type
   - One-time sessions show simple "Next session: [date]"
   - Recurring sessions show pattern with next date
   - Clear, professional presentation of class schedules
   - Helps users understand class commitment (single vs ongoing)

## Database Migrations

### Migration 1: Delivery Mode
```bash
npx prisma migrate dev --name add_delivery_mode_to_academy_class
```
**Status:** ✅ Applied successfully  
**Database:** xen_tradehub  
**Migration ID:** 20251021020012_add_delivery_mode_to_academy_class

### Migration 2: Schedule Type
```bash
npx prisma migrate dev --name add_schedule_type_to_academy_class
```
**Status:** ✅ Applied successfully  
**Database:** xen_tradehub  
**Migration ID:** 20251021023738_add_schedule_type_to_academy_class

## Testing Recommendations

### Admin Panel Testing
1. Create a new academy class with Physical delivery mode
2. Create a new academy class with Online delivery mode
3. Create a free course (price = 0 or leave blank)
4. Create a one-time session class
5. Create a recurring class with pattern (e.g., "Every Tuesday")
6. Edit an existing class and change delivery mode
7. Edit an existing class and change from one-time to recurring
8. Verify recurrence pattern field appears/disappears based on schedule type
9. Verify all fields save correctly

### User Panel Testing
1. View courses with Physical delivery mode
2. View courses with Online delivery mode
3. View free courses (should show "Free" instead of price)
4. View paid courses (should show formatted currency)
5. View one-time session (should show "Next session: [date]")
6. View recurring class (should show "[Pattern] (Next: [date])")
7. Verify delivery mode icon and text display correctly
8. Verify schedule information is clear and professional

## Files Modified
1. `/prisma/schema.prisma` - Added deliveryMode, scheduleType, and recurrencePattern fields
2. `/app/(admin)/admin/academy/page.tsx` - Added delivery mode and schedule type dropdowns
3. `/app/api/academy-classes/route.ts` - Updated POST handler with new fields
4. `/app/api/academy-classes/[id]/route.ts` - Updated PUT handler with new fields
5. `/app/(authenticated)/academy/page.tsx` - Added delivery mode display, schedule display, and free course logic

## Backward Compatibility
- Existing academy classes will default to "PHYSICAL" delivery mode
- Existing academy classes will default to "ONE_TIME" schedule type
- All existing functionality remains intact
- No breaking changes to API contracts
- Optional fields in user interface (gracefully handles missing values)
- Recurrence pattern is nullable and optional

## Automatic Session Updates

### Recurring Session Management
For recurring classes, the system automatically updates the `nextSession` date when the current session passes.

**How It Works:**
1. **Automated Cron Job** - Runs daily at midnight (00:00 UTC)
2. **Pattern Recognition** - Parses recurrence patterns to calculate next date
3. **Smart Calculation** - Handles various patterns:
   - Daily: "Daily", "Every day"
   - Weekly: "Every Tuesday", "Weekly on Mondays"
   - Bi-weekly: "Bi-weekly", "Every 2 weeks"
   - Monthly: "Monthly", "Every month"
   - First/Last day: "First Saturday of each month", "Last Friday"

**Manual Trigger:**
- Admin panel includes "Update Sessions" button
- Manually updates all past recurring sessions
- Shows count of updated classes
- Useful for testing or immediate updates

**API Endpoints:**
- `/api/cron/update-recurring-sessions` - Automated cron endpoint (requires auth)
- `/api/admin/update-recurring-sessions` - Manual admin trigger

**Supported Patterns:**
- "Every Tuesday" → Next Tuesday
- "Weekly on Mondays" → Next Monday
- "Daily" → Tomorrow
- "Bi-weekly" → 2 weeks from last session
- "Monthly" → Same day next month
- "First Saturday of each month" → First Saturday of next month
- "Last Friday" → Last Friday of next month

**Vercel Deployment:**
- Configured in `vercel.json` for automatic daily execution
- No additional setup required when deploying to Vercel

**Alternative Deployment:**
- For non-Vercel hosting, set up a cron job to call the endpoint
- Example: `0 0 * * * curl -X GET https://your-domain.com/api/cron/update-recurring-sessions -H "Authorization: Bearer YOUR_CRON_SECRET"`

## Next Steps
1. Test the new features in development environment
2. Verify database migration in staging
3. Update any documentation or user guides
4. Set up CRON_SECRET environment variable for production
5. Test recurring session updates with various patterns
6. Consider adding delivery mode filter in admin panel
7. Consider adding "Free" badge to course cards for better visibility
