# Recurring Sessions - Automatic Update System

## Overview
The XEN TradeHub academy system now supports automatic updates for recurring class sessions. When a recurring class's session date passes, the system automatically calculates and updates the next session date based on the recurrence pattern.

## How It Works

### 1. Automated Daily Updates
- **Cron Job**: Runs every day at midnight (00:00 UTC)
- **Process**: 
  1. Finds all recurring classes where `nextSession` date has passed
  2. Parses the `recurrencePattern` to determine the schedule
  3. Calculates the next session date
  4. Updates the database with the new date

### 2. Pattern Recognition
The system intelligently parses natural language recurrence patterns:

#### Daily Patterns
- **Input**: "Daily", "Every day"
- **Result**: Next day

#### Weekly Patterns (Specific Day)
- **Input**: "Every Tuesday", "Weekly on Mondays", "Thursdays"
- **Result**: Next occurrence of that day of the week

#### Weekly Patterns (Generic)
- **Input**: "Weekly", "Every week"
- **Result**: Same day next week (7 days later)

#### Bi-Weekly Patterns
- **Input**: "Bi-weekly", "Biweekly", "Every 2 weeks"
- **Result**: 14 days from last session

#### Monthly Patterns
- **Input**: "Monthly", "Every month"
- **Result**: Same day of next month

#### First/Last Day Patterns
- **Input**: "First Saturday of each month", "Last Friday"
- **Result**: First/Last occurrence of that day in next month

## Admin Features

### Manual Update Button
Located in the admin academy page header:
- **Button**: "Update Sessions"
- **Function**: Manually triggers update for all past recurring sessions
- **Feedback**: Shows count of updated classes
- **Use Cases**:
  - Testing the system
  - Immediate updates without waiting for cron
  - Recovery from any issues

### How to Use
1. Navigate to Admin → Academy
2. Click "Update Sessions" button
3. System will:
   - Find all recurring classes with past dates
   - Calculate new session dates
   - Update the database
   - Show success message with count

## API Endpoints

### 1. Automated Cron Endpoint
**URL**: `/api/cron/update-recurring-sessions`  
**Method**: GET or POST  
**Authentication**: Requires `Authorization: Bearer {CRON_SECRET}` header  
**Purpose**: Called automatically by cron job

**Response**:
```json
{
  "message": "Recurring sessions updated successfully",
  "updatedCount": 3,
  "updates": [
    {
      "id": "class-id-1",
      "title": "Weekly Forex Basics",
      "oldSession": "2025-10-15T00:00:00.000Z",
      "newSession": "2025-10-22T00:00:00.000Z"
    }
  ]
}
```

### 2. Manual Admin Endpoint
**URL**: `/api/admin/update-recurring-sessions`  
**Method**: POST  
**Authentication**: Admin session required  
**Purpose**: Manual trigger from admin panel

**Response**: Same as cron endpoint

## Deployment Setup

### Vercel (Automatic)
The system is pre-configured for Vercel deployment:

**File**: `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/update-recurring-sessions",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Steps**:
1. Deploy to Vercel
2. Set `CRON_SECRET` environment variable in Vercel dashboard
3. Cron job will run automatically

### Other Hosting Platforms

#### Using System Cron
Add to your crontab:
```bash
0 0 * * * curl -X GET https://your-domain.com/api/cron/update-recurring-sessions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Using External Cron Services
Services like cron-job.org, EasyCron, or similar:
1. Create a new cron job
2. Set URL: `https://your-domain.com/api/cron/update-recurring-sessions`
3. Set schedule: Daily at 00:00
4. Add header: `Authorization: Bearer YOUR_CRON_SECRET`
5. Method: GET or POST

## Environment Variables

### Required
**CRON_SECRET**: Secret key for authenticating cron requests
- Set in `.env` or hosting platform environment variables
- Use a strong, random string
- Example: `openssl rand -base64 32`

### Example .env
```env
CRON_SECRET="your-secure-random-string-here"
```

## Pattern Examples

### Example 1: Weekly Tuesday Class
**Pattern**: "Every Tuesday"  
**Current Session**: October 15, 2025 (Tuesday)  
**Next Session**: October 22, 2025 (Tuesday)

### Example 2: Monthly Workshop
**Pattern**: "Monthly"  
**Current Session**: October 15, 2025  
**Next Session**: November 15, 2025

### Example 3: First Saturday
**Pattern**: "First Saturday of each month"  
**Current Session**: October 5, 2025 (First Saturday)  
**Next Session**: November 2, 2025 (First Saturday)

### Example 4: Bi-weekly Class
**Pattern**: "Bi-weekly"  
**Current Session**: October 15, 2025  
**Next Session**: October 29, 2025 (14 days later)

## Testing

### Manual Testing
1. Create a recurring class with a past date
2. Set a recurrence pattern (e.g., "Every Tuesday")
3. Click "Update Sessions" button
4. Verify the next session date is updated correctly

### Automated Testing
The cron job can be tested locally:
```bash
curl -X POST http://localhost:3000/api/admin/update-recurring-sessions \
  -H "Cookie: your-session-cookie"
```

## Troubleshooting

### Sessions Not Updating
**Check**:
1. Is `scheduleType` set to "RECURRING"?
2. Is `recurrencePattern` filled in?
3. Is the current `nextSession` date in the past?
4. Is the cron job running? (Check Vercel logs)

### Pattern Not Recognized
**Solution**:
- Use clear, simple patterns
- Stick to supported formats (see examples above)
- Default behavior: Adds 7 days if pattern is unclear

### Manual Update Not Working
**Check**:
1. Are you logged in as admin?
2. Check browser console for errors
3. Check server logs for detailed error messages

## Best Practices

### Pattern Writing
✅ **Good Patterns**:
- "Every Tuesday"
- "Weekly on Mondays"
- "Bi-weekly"
- "First Saturday of each month"
- "Monthly"

❌ **Avoid**:
- Vague patterns: "Sometimes", "Often"
- Complex patterns: "Every other Tuesday except holidays"
- Time-specific: "Every Tuesday at 6 PM" (time is in nextSession date)

### Monitoring
- Check admin panel regularly for classes with past dates
- Use "Update Sessions" button to verify system is working
- Monitor Vercel cron logs for automated updates

### Data Integrity
- Always set `scheduleType` to "RECURRING" for recurring classes
- Fill in `recurrencePattern` with clear, supported patterns
- Set initial `nextSession` to the first actual session date

## Future Enhancements

Potential improvements:
1. Email notifications when sessions are updated
2. More complex recurrence patterns (e.g., "2nd and 4th Tuesday")
3. Timezone support for different locations
4. Automatic enrollment reminders before next session
5. Session history tracking
6. Custom recurrence rules per class

## Support

For issues or questions:
1. Check this documentation
2. Review admin panel error messages
3. Check server logs for detailed errors
4. Test with manual "Update Sessions" button
5. Verify environment variables are set correctly
