# XEN TradeHub Notification System - Complete Documentation

## Overview
The notification system has been completely refurbished from the CoreFX system to match XEN TradeHub's professional brokerage and client engagement platform. The system now features role-based notifications with distinct notification types for admins and users.

---

## System Architecture

### 1. **Notification Types**

#### Admin Notifications (Activity-Based)
Admins receive notifications about user interactions and activities:
- `USER_SIGNUP` - New user registration
- `ACADEMY_REGISTRATION` - User registers for academy class
- `BROKER_ACCOUNT_OPENING` - User opens broker account
- `COPY_TRADING_SUBSCRIPTION` - User subscribes to copy trading
- `AFFILIATE_REGISTRATION` - User registers as affiliate
- `AFFILIATE_REFERRAL` - New user signs up via referral link
- `USER_ENQUIRY` - User submits enquiry/support request
- `USER_ACTIVITY` - General user activity

#### User Notifications (Content-Based)
Users receive notifications about new content and updates:
- `NEW_BROKER` - Admin adds new broker
- `NEW_ACADEMY_CLASS` - Admin creates new academy class
- `NEW_MASTER_TRADER` - Admin adds new master trader
- `NEW_COURSE` - Admin creates new course
- `NEW_RESOURCE` - Admin adds new resource
- `NEW_SIGNAL` - New trading signal published
- `NEW_EVENT` - New event created
- `AFFILIATE_REFERRAL_SIGNUP` - Someone signs up with affiliate's referral link
- `SYSTEM_UPDATE` - System announcements
- `PROMOTION` - Special promotions

---

## Implementation Details

### 2. **Utility Files**

#### `/lib/admin-notification-utils.ts`
Handles creation of admin notifications for user activities.

**Key Functions:**
```typescript
// Core function
createAdminActivityNotification(data: AdminNotificationData)

// Specific notification functions
notifyUserSignup(userName, userEmail, referralCode?, actionUrl?)
notifyAcademyRegistration(userName, userEmail, className, actionUrl?)
notifyBrokerAccountOpening(userName, userEmail, brokerName, actionUrl?)
notifyCopyTradingSubscription(userName, userEmail, traderName, actionUrl?)
notifyAffiliateRegistration(userName, userEmail, referralCode, actionUrl?)
notifyAffiliateReferral(referrerName, referrerEmail, newUserName, newUserEmail, actionUrl?)
notifyUserEnquiry(userName, userEmail, enquiryType, subject, actionUrl?)
notifyUserActivity(userName, userEmail, activity, actionUrl?)
```

**How it works:**
- Finds all admin users (SUPERADMIN, ADMIN, EDITOR, ANALYST, SUPPORT)
- Creates notification for each admin user
- Returns success status and count

#### `/lib/user-notification-utils.ts`
Handles creation of user notifications for admin-created content.

**Key Functions:**
```typescript
// Core function
createUserNotification(data: UserNotificationData, targetUserId?)

// Specific notification functions
notifyNewBroker(brokerName, description, actionUrl?)
notifyNewAcademyClass(className, date, actionUrl?)
notifyNewMasterTrader(traderName, performance, actionUrl?)
notifyNewCourse(courseName, description, actionUrl?)
notifyNewResource(resourceName, resourceType, actionUrl?)
notifyNewSignal(symbol, action, actionUrl?)
notifyNewEvent(eventName, date, actionUrl?)
notifyAffiliateReferralSignup(affiliateUserId, newUserName, newUserEmail)
notifySystemUpdate(title, message, actionUrl?)
notifyPromotion(title, message, actionUrl?)
```

**How it works:**
- If targetUserId provided: sends to specific user
- Otherwise: finds all STUDENT users and sends to all
- Returns success status and count

---

### 3. **API Integration**

#### User Interaction Endpoints (Send Admin Notifications)

**Academy Registration**
- **File:** `/app/api/academy-classes/[id]/registrations/route.ts`
- **Trigger:** User registers for academy class
- **Notification:** `notifyAcademyRegistration()`

**Broker Account Opening**
- **File:** `/app/api/brokers/open-account/route.ts`
- **Trigger:** User opens broker account
- **Notification:** `notifyBrokerAccountOpening()`

**Copy Trading Subscription**
- **File:** `/app/api/copy-trading/subscribe/route.ts`
- **Trigger:** User subscribes to copy trader
- **Notification:** `notifyCopyTradingSubscription()`

**Affiliate Registration**
- **File:** `/app/api/affiliates/register/route.ts`
- **Trigger:** User registers as affiliate
- **Notification:** `notifyAffiliateRegistration()`

**User Enquiry**
- **File:** `/app/api/enquiries/route.ts`
- **Trigger:** User submits enquiry
- **Notification:** `notifyUserEnquiry()`

**User Signup**
- **File:** `/app/api/auth/signup/route.ts`
- **Trigger:** New user signs up
- **Notifications:** 
  - `notifyUserSignup()` - To admins
  - `notifyAffiliateReferral()` - To admins (if referral)
  - `notifyAffiliateReferralSignup()` - To affiliate (if referral)

#### Admin Content Creation Endpoints (Send User Notifications)

**New Broker**
- **File:** `/app/api/admin/brokers/route.ts`
- **Trigger:** Admin creates new broker
- **Notification:** `notifyNewBroker()`
- **Condition:** Only if broker is active

**New Academy Class**
- **File:** `/app/api/academy-classes/route.ts`
- **Trigger:** Admin creates new academy class
- **Notification:** `notifyNewAcademyClass()`
- **Condition:** Only if published and status is UPCOMING

**New Master Trader**
- **File:** `/app/api/admin/copy-trading/traders/route.ts`
- **Trigger:** Admin creates new master trader
- **Notification:** `notifyNewMasterTrader()`
- **Condition:** Only if trader is active

---

### 4. **Notification API Routes**

#### `/app/api/notifications/route.ts`
Main notification endpoint with role-based filtering.

**GET /api/notifications**
- Fetches notifications for current user
- Automatically filters by user role:
  - Admins: See USER_SIGNUP, ACADEMY_REGISTRATION, etc.
  - Students: See NEW_BROKER, NEW_ACADEMY_CLASS, etc.
- Supports pagination, filtering by type and status
- Returns unread count

**POST /api/notifications**
- Marks notifications as read
- Supports marking specific IDs or all notifications

#### `/app/api/admin/notifications/route.ts`
Admin management of notifications.

**GET /api/admin/notifications**
- Admin-only endpoint
- Fetches all notifications with user details
- Supports filtering and search
- Returns statistics

**POST /api/admin/notifications**
- Create notifications manually
- Can send to specific user or all users
- Logs action in audit log

#### `/app/api/admin/activity-notifications/route.ts`
Admin activity notifications endpoint.

**GET /api/admin/activity-notifications**
- Fetches admin activity notifications
- Returns statistics (total, unread)
- Supports pagination

---

### 5. **Banner Notifications (NEW Notifications)**

#### Updated Page Paths
The banner system now reflects XEN TradeHub pages:
- `/` - Home Page
- `/dashboard` - Dashboard
- `/brokers` - Trade Through Us
- `/copy-trading` - Copy Trading
- `/academy` - Academy
- `/market-analysis` - Market Analysis
- `/affiliates` - Earn With Us
- `/courses` - Courses
- `/resources` - Resources
- `/signals` - Signals
- `/events` - Events

#### Admin Management
**File:** `/app/(admin)/admin/notifications/page.tsx`
- Create banners for specific pages
- Set expiration dates
- Choose banner colors (semantic meanings)
- Toggle active status
- View and manage all banners

---

## Testing Guide

### As Admin User

1. **Login as Admin**
   - Email: `admin@corefx.com`
   - Password: `admin123`

2. **Check Admin Notifications**
   - Navigate to `/admin/notifications`
   - Should see "Admin Notifications" tab
   - Initially empty

3. **Trigger Admin Notifications**
   - Open new browser/incognito window
   - Sign up as new user (triggers USER_SIGNUP)
   - Register for academy class (triggers ACADEMY_REGISTRATION)
   - Open broker account (triggers BROKER_ACCOUNT_OPENING)
   - Subscribe to copy trading (triggers COPY_TRADING_SUBSCRIPTION)
   - Register as affiliate (triggers AFFILIATE_REGISTRATION)
   - Submit enquiry (triggers USER_ENQUIRY)

4. **Verify Admin Notifications**
   - Return to admin panel
   - Check `/admin/notifications`
   - Should see all triggered notifications with:
     - Emoji icons (🎉, 📚, 💼, 📈, 🤝, 💬)
     - User details (name, email)
     - Action links to relevant admin pages
     - Unread status

5. **Create Banners**
   - Go to "NEW Banners" tab
   - Click "New Banner"
   - Select page path from updated list
   - Set title, description, color
   - Create banner
   - Verify it appears on selected page

### As Regular User

1. **Login as Student**
   - Email: `user1@example.com`
   - Password: `user123`

2. **Check User Notifications**
   - Navigate to `/dashboard` or click notifications icon
   - Should see user-specific notifications

3. **Trigger User Notifications**
   - As admin, create new broker (triggers NEW_BROKER)
   - As admin, create new academy class (triggers NEW_ACADEMY_CLASS)
   - As admin, create new master trader (triggers NEW_MASTER_TRADER)

4. **Verify User Notifications**
   - Return to user account
   - Check notifications
   - Should see:
     - New broker notification with link to `/brokers`
     - New academy class notification with link to `/academy`
     - New master trader notification with link to `/copy-trading`
     - Unread count updates

5. **Test Affiliate Referral Notification**
   - Register as affiliate
   - Get referral code
   - Sign up new user with referral code
   - Check notifications
   - Should see "🎯 New Referral Signup" notification

---

## Notification Flow Diagrams

### Admin Notification Flow
```
User Action → API Endpoint → notifyXXX() → createAdminActivityNotification()
                                           ↓
                                    Find all admin users
                                           ↓
                                    Create notification for each
                                           ↓
                                    Return success/count
```

### User Notification Flow
```
Admin Creates Content → API Endpoint → notifyNewXXX() → createUserNotification()
                                                         ↓
                                                  Find all student users
                                                         ↓
                                                  Create notification for each
                                                         ↓
                                                  Return success/count
```

---

## Database Schema

### Notification Model
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      String
  isRead    Boolean  @default(false)
  actionUrl String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

### NewNotification Model (Banners)
```prisma
model NewNotification {
  id               String            @id @default(cuid())
  userId           String
  title            String
  message          String
  type             String
  pagePath         String?
  description      String?
  isActive         Boolean           @default(true)
  isRead           Boolean           @default(false)
  expiresAt        DateTime?
  color            String?           @default("blue")
  createdAt        DateTime          @default(now())
  updatedAt        DateTime?         @updatedAt
  dismissedBanners DismissedBanner[]
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("new_notifications")
}
```

---

## Key Features

### ✅ Role-Based Filtering
- Admins only see user activity notifications
- Users only see content/update notifications
- Automatic filtering in API routes

### ✅ Professional Presentation
- Emoji icons for visual identification
- Clear, actionable messages
- Direct links to relevant pages
- User details in admin notifications

### ✅ Real-Time Updates
- Notifications created immediately on action
- Unread count updates automatically
- 30-second polling for new notifications

### ✅ Comprehensive Coverage
All major user interactions trigger admin notifications:
- User signup (with/without referral)
- Academy registrations
- Broker account openings
- Copy trading subscriptions
- Affiliate registrations
- User enquiries

All major admin content creation triggers user notifications:
- New brokers
- New academy classes
- New master traders
- Affiliate referral signups

### ✅ Updated Banner System
- XEN TradeHub page paths
- Semantic color meanings
- Expiration dates
- Active/inactive toggle

---

## Migration Notes

### From CoreFX to XEN TradeHub

**Changed Notification Types:**
- ❌ Removed: `STUDENT_PURCHASE`, `STUDENT_ENROLLMENT`, `STUDENT_REGISTRATION`, `STUDENT_ENQUIRY`, `STUDENT_ACTIVITY`
- ✅ Added: `USER_SIGNUP`, `ACADEMY_REGISTRATION`, `BROKER_ACCOUNT_OPENING`, `COPY_TRADING_SUBSCRIPTION`, `AFFILIATE_REGISTRATION`, `AFFILIATE_REFERRAL`, `USER_ENQUIRY`

**Changed Page Paths:**
- ❌ Removed: `/mentorship`, generic course pages
- ✅ Added: `/brokers`, `/copy-trading`, `/affiliates`, `/market-analysis`

**Enhanced Features:**
- Dual notification system (admin + user)
- Affiliate referral notifications
- Conditional notifications (only for active/published content)
- Better user targeting (specific user vs all users)

---

## Troubleshooting

### Notifications Not Appearing

1. **Check User Role**
   - Admins should only see admin notification types
   - Students should only see user notification types

2. **Check Notification Creation**
   - Look for console logs in API routes
   - Verify notification utility functions are called
   - Check database for created notifications

3. **Check Filtering**
   - Verify role-based filtering in `/app/api/notifications/route.ts`
   - Ensure notification types match user role

### Notifications Not Triggering

1. **Check API Integration**
   - Verify notification function is imported
   - Ensure function is called after successful action
   - Check for errors in console

2. **Check Conditions**
   - User notifications only sent for active/published content
   - Verify conditions are met (e.g., `isActive`, `isPublished`)

---

## Future Enhancements

### Potential Additions
- Email notifications for critical events
- Push notifications (web push API)
- Notification preferences per user
- Notification grouping/threading
- Rich notifications with images
- In-app notification sound
- Notification history/archive
- Bulk notification management

---

## Summary

The XEN TradeHub notification system is now fully operational with:
- ✅ 8 admin notification types for user activities
- ✅ 10 user notification types for new content
- ✅ Role-based filtering and display
- ✅ Integration in 9 API endpoints
- ✅ Updated banner system with XEN TradeHub pages
- ✅ Professional presentation with emojis and action links
- ✅ Comprehensive testing guide
- ✅ Complete documentation

The system ensures admins are notified of all user interactions while users are kept informed of new content and opportunities on the platform.
