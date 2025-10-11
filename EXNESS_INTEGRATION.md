# Exness Integration - CoreFX

This document describes the Exness registration popup integration implemented for the CoreFX webapp.

## Overview

The Exness integration provides a comprehensive popup system that guides users through either creating a new Exness account or changing their partner for existing accounts. The system includes analytics tracking, verification forms, and responsive design.

## Components

### 1. ExnessRegistrationPopup (`/components/ui/exness-registration-popup.tsx`)

Main popup component with two tabs:
- **New Account**: Step-by-step guide for creating a new Exness account
- **Existing Account**: Instructions for changing partner on existing accounts

**Features:**
- Responsive design (mobile-first)
- Analytics tracking
- External link integration
- Tab switching functionality

### 2. VerificationForm (`/components/ui/verification-form.tsx`)

Form component for collecting user verification details:
- Email address
- Full name
- Phone number
- Exness Account ID (for existing accounts)

**Features:**
- Form validation
- Success/error states
- Loading states
- API integration

## API Endpoints

### 1. Verification API (`/api/exness/verification/route.ts`)

**POST** - Submit verification request
```json
{
  "email": "user@example.com",
  "accountType": "new" | "existing",
  "exnessAccountId": "optional",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890"
}
```

**GET** - Check verification status
```
/api/exness/verification?id=verification_id
```

### 2. Analytics API (`/api/exness/analytics/route.ts`)

**POST** - Track user interactions
```json
{
  "action": "exness_registration_clicked",
  "accountType": "new" | "existing",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://corefx.com"
}
```

**GET** - Retrieve analytics data
```
/api/exness/analytics?period=7d&metric=all
```

## Integration

The popup is integrated into the Trade With CoreFX page (`/app/trade-core/page.tsx`):

1. Import the `ExnessRegistrationPopup` component
2. Add state management for popup visibility
3. Connect the "REGISTER ON EXNESS" button to open the popup

## Usage

1. User clicks "REGISTER ON EXNESS" button
2. Popup opens with New Account tab selected by default
3. User can switch between New Account and Existing Account tabs
4. For new accounts: User clicks "Open Exness Registration" to go to Exness
5. User clicks "Proceed to Verification" to open verification form
6. User fills out verification form and submits
7. Success message is displayed with next steps

## Customization

### Styling
- Uses Tailwind CSS classes
- Responsive breakpoints: `sm:` for mobile, default for desktop
- CoreFX brand colors: `xen-red`

### Content
- All "kojo" references have been replaced with "corefx"
- Exness referral link: `https://exness.com/a/corefx`
- Customizable step instructions and verification requirements

### Analytics
- Tracks popup opens, registration clicks, and verification submissions
- Includes user agent, referrer, and timestamp data
- Can be extended to track additional metrics

## Testing

The implementation includes:
- Responsive design testing
- Form validation testing
- API integration testing
- Error handling
- Loading states

## Future Enhancements

1. Email notifications for verification status
2. Admin dashboard for managing verifications
3. Integration with CRM systems
4. Advanced analytics and reporting
5. A/B testing for different popup designs
6. Multi-language support
