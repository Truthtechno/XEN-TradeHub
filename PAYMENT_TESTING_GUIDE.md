# Payment System Testing Guide

## Overview
This guide helps you test all payment flows in the CoreFX platform using the mock payment gateway.

## Prerequisites
1. Mock payment gateway is enabled in admin settings
2. Success rate is set to 85% (or your preferred rate)
3. All payment components are using the mock system

## Test Scenarios

### 1. Course Payment Flow
**Location**: `/courses` page

**Steps**:
1. Navigate to the courses page
2. Click on any paid course (e.g., "THE GOAT STRATEGY")
3. Fill out the registration form
4. Click "Continue to Payment"
5. You should see the mock payment form (not "Payment gateway not configured")

**Test Cards**:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

**Expected Results**:
- ✅ Mock payment form appears
- ✅ Form validation works
- ✅ Payment processing shows loading state
- ✅ Success/failure messages display correctly
- ✅ Webhook simulation works

### 2. Signals Subscription Flow
**Location**: `/signals` page

**Steps**:
1. Navigate to the signals page
2. Click "Subscribe Now" button
3. Fill out the subscription form
4. Click "Continue to Payment"
5. Complete payment with test card

**Expected Results**:
- ✅ Subscription popup opens
- ✅ Form validation works
- ✅ Payment processing works
- ✅ Success confirmation shows

### 3. Mentorship Payment Flow
**Location**: One-on-One mentorship registration

**Steps**:
1. Navigate to mentorship registration
2. Fill out the form
3. Click payment button
4. Payment should process automatically (no form needed)

**Expected Results**:
- ✅ Payment processes based on success rate setting
- ✅ Success/failure messages display
- ✅ Registration status updates correctly

### 4. Academy Payment Flow
**Location**: `/academy` page

**Steps**:
1. Navigate to the academy page
2. Click "Register Now" on any course
3. Follow the same flow as course payments

**Expected Results**:
- ✅ Same as course payment flow
- ✅ Registration popup works correctly

## Admin Configuration Testing

### 1. Mock Payment Settings
**Location**: `/admin/settings` → Payments tab

**Test Scenarios**:
1. **Enable/Disable Mock Payment**:
   - Toggle the mock payment switch
   - Verify payment forms change behavior
   - When disabled, should show "Payment gateway not configured"

2. **Success Rate Adjustment**:
   - Change success rate from 85% to 50%
   - Test multiple payments
   - Verify failure rate increases

3. **Test Card Display**:
   - Verify test card numbers are shown
   - Check that instructions are clear

### 2. Real Stripe Integration (Future)
**When Ready for Production**:
1. Add real Stripe API keys
2. Disable mock payment
3. Test with real Stripe test cards
4. Verify webhook integration

## Test Page
**Location**: `/test-payment`

This comprehensive test page allows you to:
- Test course payments
- Test mentorship payments
- View payment gateway status
- Configure test parameters
- View payment results
- Access admin settings

## Common Issues & Solutions

### Issue: "Payment gateway not configured"
**Solution**: 
- Check if mock payment is enabled in admin settings
- Verify settings are saved correctly
- Refresh the page

### Issue: Payment always succeeds/fails
**Solution**:
- Check success rate setting in admin
- Verify random number generation is working
- Test with different success rates

### Issue: Payment form not loading
**Solution**:
- Check browser console for errors
- Verify all components are imported correctly
- Check if settings context is working

### Issue: Webhook not working
**Solution**:
- Check mock webhook endpoint
- Verify webhook simulation is enabled
- Check console logs for webhook calls

## Testing Checklist

### Course Payments
- [ ] Course registration popup opens
- [ ] Form validation works
- [ ] Payment form appears (not error message)
- [ ] Test cards work correctly
- [ ] Success/failure handling works
- [ ] Webhook simulation works

### Signals Subscriptions
- [ ] Subscription popup opens
- [ ] Form validation works
- [ ] Payment processing works
- [ ] Success confirmation shows

### Mentorship Payments
- [ ] Payment processes automatically
- [ ] Success rate setting works
- [ ] Error handling works
- [ ] Registration status updates

### Admin Settings
- [ ] Mock payment toggle works
- [ ] Success rate adjustment works
- [ ] Settings save correctly
- [ ] Test card numbers display

### General
- [ ] All payment flows use mock system
- [ ] No "Payment gateway not configured" errors
- [ ] Professional UI throughout
- [ ] Error handling is user-friendly

## Performance Testing

### Load Testing
- Test multiple simultaneous payments
- Verify payment processing speed
- Check for memory leaks

### Error Handling
- Test with invalid card numbers
- Test with network failures
- Test with malformed requests

## Security Testing

### Mock Payment Security
- Verify no real payment data is stored
- Check that test data is clearly marked
- Ensure no sensitive data leaks

### Input Validation
- Test with malicious input
- Verify form validation works
- Check for XSS vulnerabilities

## Browser Compatibility
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## Mobile Testing
- [ ] Payment forms work on mobile
- [ ] Touch interactions work
- [ ] Responsive design is correct
- [ ] Mobile-specific features work

## Documentation
- [ ] Payment system documentation is complete
- [ ] Test guide is comprehensive
- [ ] Admin guide is clear
- [ ] Troubleshooting guide exists

## Success Criteria
All payment flows should:
1. Use the mock payment system by default
2. Show professional payment forms
3. Handle success/failure scenarios correctly
4. Provide clear user feedback
5. Work consistently across all pages
6. Be easily configurable by admins
7. Transition smoothly to real Stripe when ready

## Next Steps
1. Complete all test scenarios
2. Fix any issues found
3. Document any additional requirements
4. Prepare for production deployment
5. Set up real Stripe integration when ready
