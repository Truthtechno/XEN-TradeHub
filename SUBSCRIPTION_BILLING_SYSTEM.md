# Subscription Billing System Documentation

## Overview

This document describes the comprehensive subscription billing system implemented for the CoreFX Signals Service. The system provides automatic monthly billing, payment retry logic, grace periods, and subscription cancellation on payment failure.

## Features

### ✅ Core Features
- **Automatic Monthly Billing**: Subscriptions are automatically charged each month
- **Payment Retry Logic**: Failed payments are retried with exponential backoff
- **Grace Period**: Users get 3 days to fix payment issues before cancellation
- **Subscription Management**: Users can view and cancel their subscriptions
- **Real-time Status Updates**: UI shows current subscription status and billing info
- **Comprehensive Logging**: All billing events are logged for debugging

### 🔧 Technical Features
- **Database Schema**: Enhanced with proper subscription and billing models
- **API Endpoints**: RESTful APIs for subscription management
- **Cron Jobs**: Automated billing processing
- **Error Handling**: Robust error handling and recovery
- **Security**: Secure authentication and authorization

## Database Schema

### SignalSubscription Model
```prisma
model SignalSubscription {
  id                String                    @id @default(cuid())
  userId            String
  user              User                      @relation("SignalSubscriptions", fields: [userId], references: [id], onDelete: Cascade)
  status            SignalSubscriptionStatus  @default(ACTIVE)
  plan              SignalPlan                @default(MONTHLY)
  amountUSD         Float                     @default(50.0)
  currency          String                    @default("USD")
  billingCycle      BillingCycle             @default(MONTHLY)
  startedAt         DateTime                  @default(now())
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  nextBillingDate   DateTime
  canceledAt        DateTime?
  cancelAtPeriodEnd Boolean                  @default(false)
  paymentMethodId   String?                  // Stripe payment method ID
  stripeSubscriptionId String?               // Stripe subscription ID
  lastPaymentDate   DateTime?
  lastPaymentAmount Float?
  failedPaymentCount Int                     @default(0)
  maxFailedPayments Int                      @default(3)
  gracePeriodEndsAt DateTime?
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt
  
  // Billing history
  billingHistory    SignalBillingHistory[]
}
```

### SignalBillingHistory Model
```prisma
model SignalBillingHistory {
  id                String            @id @default(cuid())
  subscriptionId    String
  subscription      SignalSubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  amountUSD         Float
  currency          String            @default("USD")
  status            BillingStatus
  paymentMethodId   String?
  stripePaymentIntentId String?
  failureReason     String?
  retryCount        Int               @default(0)
  nextRetryAt       DateTime?
  processedAt       DateTime          @default(now())
  createdAt         DateTime          @default(now())
}
```

## API Endpoints

### 1. Create Subscription
```
POST /api/payments/signals
```

**Request Body:**
```json
{
  "amountUSD": 50,
  "plan": "MONTHLY",
  "provider": "stripe",
  "providerRef": "pi_1234567890",
  "paymentMethodId": "pm_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signals subscription created successfully",
  "subscription": {
    "id": "sub_1234567890",
    "userId": "user_1234567890",
    "email": "user@example.com",
    "role": "SIGNALS",
    "plan": "MONTHLY",
    "amount": 50,
    "status": "active",
    "nextBillingDate": "2024-02-01T00:00:00.000Z"
  }
}
```

### 2. Get Subscription Status
```
GET /api/payments/signals
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "hasActiveSubscription": true,
    "subscription": {
      "id": "sub_1234567890",
      "status": "ACTIVE",
      "plan": "MONTHLY",
      "amountUSD": 50,
      "nextBillingDate": "2024-02-01T00:00:00.000Z"
    }
  }
}
```

### 3. Cancel Subscription
```
POST /api/subscriptions/cancel
```

**Request Body:**
```json
{
  "subscriptionId": "sub_1234567890",
  "reason": "USER_REQUEST"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription canceled successfully",
  "subscriptionId": "sub_1234567890"
}
```

### 4. Billing Cron Job
```
POST /api/cron/billing
```

**Headers:**
```
Authorization: Bearer your-cron-secret
```

**Response:**
```json
{
  "success": true,
  "message": "Billing cron job completed successfully",
  "results": {
    "dueSubscriptions": {
      "processed": 5,
      "successful": 4,
      "failed": 1
    },
    "gracePeriodExpirations": {
      "expired": 2
    },
    "retryResults": {
      "retried": 3,
      "successful": 2,
      "failed": 1
    }
  }
}
```

## Billing Flow

### 1. Subscription Creation
1. User initiates subscription on signals page
2. Payment is processed through Stripe
3. Subscription record is created with billing data
4. User role is updated to SIGNALS
5. Next billing date is set

### 2. Monthly Billing
1. Cron job runs every hour
2. Finds subscriptions due for billing
3. Processes payment through Stripe
4. Updates subscription status
5. Logs billing history

### 3. Payment Failure Handling
1. Payment fails during billing
2. Subscription status changes to PAST_DUE
3. Grace period starts (3 days)
4. Retry attempts are scheduled
5. After max retries, subscription is canceled

### 4. Grace Period
1. User has 3 days to fix payment
2. Multiple retry attempts are made
3. User receives notifications
4. If not resolved, subscription is canceled

## Configuration

### Environment Variables
```env
# Billing Cron Job
CRON_SECRET=your-secure-cron-secret
BILLING_URL=https://your-domain.com/api/cron/billing

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Cron Job Setup
```bash
# Process due subscriptions every hour
0 * * * * curl -X POST "https://your-domain.com/api/cron/billing" -H "Authorization: Bearer your-cron-secret"

# Process grace period expirations every 6 hours
0 */6 * * * curl -X POST "https://your-domain.com/api/cron/billing" -H "Authorization: Bearer your-cron-secret"

# Retry failed payments every 12 hours
0 */12 * * * curl -X POST "https://your-domain.com/api/cron/billing" -H "Authorization: Bearer your-cron-secret"
```

## UI Components

### 1. SignalsSubscriptionPopup
- Handles subscription creation
- Integrates with Stripe payment form
- Shows subscription features and pricing

### 2. SubscriptionManagement
- Displays current subscription status
- Shows billing information
- Allows subscription cancellation
- Handles payment method updates

### 3. Signals Page
- Shows subscription status
- Displays subscription management component
- Handles subscription creation flow

## Testing

### Test Script
Run the comprehensive test suite:
```bash
node scripts/test-billing-system.js
```

### Manual Testing
1. Create a test subscription
2. Verify billing data is stored correctly
3. Test payment failure scenarios
4. Verify grace period behavior
5. Test subscription cancellation

## Monitoring

### Logs
All billing events are logged with:
- Timestamp
- User ID
- Subscription ID
- Action performed
- Success/failure status
- Error messages (if any)

### Metrics
Track these key metrics:
- Subscription creation rate
- Payment success rate
- Payment failure rate
- Grace period conversions
- Subscription cancellation rate

## Security

### Authentication
- All API endpoints require user authentication
- Cron jobs use secret token authentication
- Payment processing uses Stripe's secure APIs

### Data Protection
- Sensitive payment data is not stored locally
- All API communications use HTTPS
- Database connections are encrypted

## Troubleshooting

### Common Issues

1. **Payment Failures**
   - Check Stripe configuration
   - Verify payment method validity
   - Check retry logic

2. **Cron Job Issues**
   - Verify CRON_SECRET is set correctly
   - Check server timezone settings
   - Monitor cron job logs

3. **Subscription Status Issues**
   - Check database for data consistency
   - Verify user role updates
   - Check billing history logs

### Debug Commands
```bash
# Check subscription status
curl -X GET "http://localhost:3000/api/payments/signals"

# Test billing cron
curl -X POST "http://localhost:3000/api/cron/billing" -H "Authorization: Bearer your-cron-secret"

# Check database
psql -d your_database -c "SELECT * FROM signal_subscriptions WHERE status = 'ACTIVE';"
```

## Migration

### Database Migration
Run the migration script to update existing subscriptions:
```bash
psql -d your_database -f migrate-subscriptions.sql
```

### Setup Script
Run the setup script to configure the billing system:
```bash
node scripts/setup-billing-cron.js
```

## Support

For issues or questions about the billing system:
1. Check the logs for error messages
2. Verify configuration settings
3. Test with the provided test scripts
4. Contact the development team

## Future Enhancements

### Planned Features
- [ ] Prorated billing for mid-cycle changes
- [ ] Multiple payment method support
- [ ] Subscription upgrades/downgrades
- [ ] Advanced retry strategies
- [ ] Email notifications for billing events
- [ ] Admin dashboard for subscription management
- [ ] Analytics and reporting
- [ ] Webhook integration for real-time updates
