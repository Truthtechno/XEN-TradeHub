# Payment System Documentation

## Overview

The CoreFX platform includes a comprehensive payment system with both mock and real payment gateway support. This allows for seamless testing during development and easy transition to production.

## Features

### Mock Payment Gateway
- **Professional UI**: Stripe-like payment form with card validation
- **Configurable Success Rate**: Adjustable payment success rate (0-100%)
- **Multiple Scenarios**: Success, failure, 3D Secure simulation
- **Webhook Simulation**: Automatic webhook calls for successful payments
- **Test Card Numbers**: Predefined test cards for different scenarios
- **No Real Transactions**: Safe for development and testing

### Real Payment Gateway (Stripe)
- **Production Ready**: Full Stripe integration when configured
- **PCI Compliant**: Secure payment processing
- **Webhook Support**: Real-time payment status updates
- **Multiple Currencies**: Support for various currencies

## Configuration

### Admin Settings

Navigate to `/admin/settings` and go to the "Payments" tab to configure:

1. **Mock Payment Gateway**
   - Toggle to enable/disable mock payments
   - Adjust success rate percentage
   - View test card numbers

2. **Stripe Configuration**
   - Stripe Publishable Key
   - Stripe Secret Key
   - Stripe Webhook Secret
   - Default Currency

### Environment Variables

```env
# Stripe Configuration (Optional - Mock is used by default)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...
```

## API Endpoints

### Mock Payment Endpoints

#### Create Payment Intent
```
POST /api/mock-payment/create-payment-intent
```

**Request Body:**
```json
{
  "amount": 99.99,
  "currency": "USD",
  "courseId": "course-123",
  "courseTitle": "Advanced Trading Course"
}
```

**Response:**
```json
{
  "clientSecret": "pi_mock_..._secret_...",
  "paymentIntentId": "pi_mock_..."
}
```

#### Confirm Payment
```
POST /api/mock-payment/confirm-payment
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_mock_...",
  "paymentMethod": {
    "type": "card",
    "card": {
      "number": "4242424242424242",
      "exp_month": 12,
      "exp_year": 2025,
      "cvc": "123"
    }
  }
}
```

**Response:**
```json
{
  "id": "pi_mock_...",
  "status": "succeeded",
  "payment_method": {
    "id": "pm_mock_...",
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025
    }
  }
}
```

#### Webhook
```
POST /api/mock-payment/webhook
```

Handles payment events and updates the system accordingly.

### Mentorship Payment
```
POST /api/mentorship/payment
```

**Request Body:**
```json
{
  "registrationId": "reg-123",
  "amount": 1500,
  "currency": "USD"
}
```

## Components

### StripePaymentForm
Main payment form component that automatically switches between mock and real payment based on settings.

```tsx
<StripePaymentForm
  amount={99.99}
  currency="USD"
  courseId="course-123"
  courseTitle="Advanced Trading Course"
  onSuccess={(paymentIntent) => console.log('Payment succeeded', paymentIntent)}
  onError={(error) => console.error('Payment failed', error)}
  onCancel={() => console.log('Payment cancelled')}
/>
```

### MockPaymentForm
Dedicated mock payment form with professional UI and validation.

### PaymentStatusIndicator
Displays payment status with appropriate icons and colors.

```tsx
<PaymentStatusIndicator
  status="succeeded"
  paymentMethod="mock_card"
/>
```

### PaymentGatewayStatus
Admin component showing current payment gateway configuration and status.

## Test Card Numbers

### Success Cards
- `4242 4242 4242 4242` - Visa (Success)
- `5555 5555 5555 4444` - Mastercard (Success)

### Failure Cards
- `4000 0000 0000 0002` - Card Declined
- `4000 0000 0000 9995` - Insufficient Funds
- `4000 0000 0000 9987` - Lost Card
- `4000 0000 0000 9979` - Stolen Card

### 3D Secure Cards
- `4000 0000 0000 3220` - Requires 3D Secure
- `4000 0000 0000 3063` - Requires 3D Secure (Authentication)

## Testing

### Test Page
Visit `/test-payment` to access the comprehensive test interface:

- Test course payments
- Test mentorship payments
- View payment gateway status
- Configure test parameters
- View payment results

### Manual Testing

1. **Enable Mock Payment**
   - Go to `/admin/settings`
   - Navigate to "Payments" tab
   - Enable "Mock Payment Gateway"

2. **Test Course Payment**
   - Navigate to any course
   - Click "Enroll" or "Purchase"
   - Use test card numbers
   - Verify payment success/failure

3. **Test Mentorship Payment**
   - Go to mentorship registration
   - Complete registration
   - Test payment flow

## Production Deployment

### Switching to Real Stripe

1. **Configure Stripe Account**
   - Create Stripe account
   - Get API keys from dashboard
   - Set up webhook endpoints

2. **Update Settings**
   - Go to `/admin/settings`
   - Enter Stripe API keys
   - Disable mock payment
   - Save settings

3. **Test Production**
   - Use real test cards from Stripe
   - Verify webhook integration
   - Test with small amounts

### Webhook Configuration

Configure webhook endpoint in Stripe dashboard:
```
https://yourdomain.com/api/stripe/webhook
```

Events to listen for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.requires_action`

## Security Considerations

### Mock Payment
- No real money transactions
- Safe for development
- All data is simulated

### Real Payment
- PCI compliant through Stripe
- Secure API key storage
- Webhook signature verification
- HTTPS required

## Troubleshooting

### Common Issues

1. **Payment Form Not Loading**
   - Check if mock payment is enabled
   - Verify settings are saved
   - Check browser console for errors

2. **Payment Always Fails**
   - Check success rate setting
   - Verify test card numbers
   - Check API endpoint responses

3. **Webhook Not Working**
   - Verify webhook URL is correct
   - Check webhook secret
   - Monitor webhook logs

### Debug Mode

Enable debug logging by setting:
```env
DEBUG_PAYMENTS=true
```

## Support

For issues or questions:
1. Check the test page at `/test-payment`
2. Review admin settings configuration
3. Check browser console for errors
4. Verify API endpoint responses

## Future Enhancements

- [ ] PayPal integration
- [ ] Cryptocurrency payments
- [ ] Subscription management
- [ ] Refund processing
- [ ] Payment analytics
- [ ] Multi-currency support
- [ ] Payment method saving
- [ ] Recurring payments
