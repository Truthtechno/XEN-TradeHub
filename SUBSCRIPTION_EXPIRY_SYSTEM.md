# Subscription Expiry System Documentation

## Overview

The CoreFX system now includes a comprehensive subscription expiry management system that automatically handles subscription expiration, user role reversion, and provides real-time status updates to users.

## Features

### 🔄 **Automatic Expiry Processing**
- Subscriptions automatically expire after 30 days
- User roles are reverted from 'SIGNALS' to 'STUDENT' upon expiry
- Real-time status checking and updates

### 📊 **User-Facing Status Display**
- Professional subscription status card with real-time countdown
- Visual indicators for active, expiring soon, and expired subscriptions
- One-click renewal and premium content access

### ⚙️ **Backend Automation**
- API endpoint for manual expiry processing
- Cron job script for automated daily checks
- Comprehensive logging and error handling

## System Components

### 1. API Endpoints

#### `/api/subscriptions/expire` (POST)
- **Purpose**: Manually trigger subscription expiry checks
- **Usage**: Can be called by cron jobs or scheduled tasks
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Processed X expired subscriptions, Y errors",
    "processed": 1,
    "errors": 0,
    "total": 1
  }
  ```

#### `/api/subscriptions/expire` (GET)
- **Purpose**: Check subscription expiry status
- **Response**: Lists expiring soon and expired subscriptions

### 2. UI Components

#### `SubscriptionStatusCard`
- **Location**: `/components/ui/subscription-status-card.tsx`
- **Features**:
  - Real-time countdown timer
  - Visual status indicators
  - One-click renewal button
  - Premium content access button

#### Integration in Signals Page
- **Location**: `/app/(authenticated)/signals/page.tsx`
- **Features**: Displays subscription status prominently at the top

### 3. Backend Services

#### `working-final-billing.ts`
- **Function**: `getUserSubscriptionStatus()`
- **Purpose**: Checks and updates expired subscriptions in real-time
- **Behavior**: 
  - Automatically expires subscriptions past `currentPeriodEnd`
  - Reverts user roles to 'STUDENT'
  - Returns updated status information

### 4. Automation Scripts

#### `scripts/check-subscription-expiry.js`
- **Purpose**: Standalone script for cron job execution
- **Usage**: `node scripts/check-subscription-expiry.js`
- **Features**:
  - Processes all expired subscriptions
  - Logs detailed information
  - Handles errors gracefully

## Setup Instructions

### 1. Cron Job Setup

Add to your crontab for daily execution at 2 AM:
```bash
0 2 * * * cd /path/to/CoreFX && node scripts/check-subscription-expiry.js >> /var/log/subscription-expiry.log 2>&1
```

### 2. Manual Testing

Test the expiry system:
```bash
cd /Volumes/BRYAN/PROJECTS/CoreFX
node test-subscription-expiry.js
```

### 3. API Testing

Test the expiry API endpoint:
```bash
curl -X POST http://localhost:3000/api/subscriptions/expire
```

## User Experience

### Active Subscription
- ✅ Green status indicator
- ⏰ Real-time countdown timer
- 🔄 Refresh button for status updates
- 💳 One-click renewal option

### Expiring Soon (3 days or less)
- ⚠️ Orange warning indicator
- ⏰ Countdown timer showing time remaining
- 💳 Prominent renewal button
- 📢 Clear expiry warning message

### Expired Subscription
- ❌ Red status indicator
- 🚫 "Subscription Expired" message
- 💳 "Subscribe Now" button
- 📝 Clear explanation of lost access

## Technical Details

### Database Schema
- `subscription.status`: 'ACTIVE' → 'EXPIRED'
- `subscription.currentPeriodEnd`: Used for expiry calculation
- `user.role`: 'SIGNALS' → 'STUDENT' on expiry

### Real-time Updates
- Subscription status checked on every page load
- Countdown timer updates every minute
- Manual refresh button for immediate updates

### Error Handling
- Graceful handling of database errors
- Comprehensive logging for debugging
- Fallback to safe defaults on errors

## Monitoring

### Logs
- All expiry processing is logged with timestamps
- Error details are captured for debugging
- Success/failure counts are tracked

### Metrics
- Number of subscriptions processed
- Error rates
- Processing time
- User role changes

## Security

### Access Control
- Expiry API requires proper authentication
- User data is protected during role changes
- No sensitive information exposed in logs

### Data Integrity
- Atomic operations for subscription and user updates
- Rollback capability on errors
- Consistent state management

## Future Enhancements

### Planned Features
- Email notifications before expiry
- Grace period for expired subscriptions
- Bulk renewal options
- Advanced analytics dashboard

### Scalability
- Queue-based processing for large volumes
- Batch operations for efficiency
- Caching for performance

## Troubleshooting

### Common Issues
1. **Subscriptions not expiring**: Check cron job execution
2. **User roles not updating**: Verify database permissions
3. **UI not updating**: Check API connectivity

### Debug Commands
```bash
# Check cron job logs
tail -f /var/log/subscription-expiry.log

# Test API endpoint
curl -X POST http://localhost:3000/api/subscriptions/expire

# Check database directly
npx prisma studio
```

## Support

For issues or questions regarding the subscription expiry system:
1. Check the logs for error details
2. Verify cron job execution
3. Test the API endpoints manually
4. Review database state for inconsistencies

---

**Last Updated**: October 7, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
