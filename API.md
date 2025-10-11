# CoreFX API Documentation

## 🔗 Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## 🔐 Authentication

All protected endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📊 Core Endpoints

### Authentication

#### POST `/api/auth/login`
Login with email and password
```json
{
  "email": "user@corefx.com",
  "password": "password123"
}
```

#### POST `/api/auth/register`
Register new user
```json
{
  "email": "user@corefx.com",
  "password": "password123",
  "name": "User Name",
  "role": "student"
}
```

#### GET `/api/auth/me`
Get current user information

### Trading Signals

#### GET `/api/signals`
Get all trading signals
**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (active, expired)

#### GET `/api/signals/[id]`
Get specific signal details

#### POST `/api/signals/[id]/like`
Like/unlike a signal

#### GET `/api/signals/check-access`
Check if user has access to signals

### Courses

#### GET `/api/courses`
Get all courses
**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `category` - Filter by category

#### GET `/api/courses/[id]`
Get course details

#### POST `/api/courses/enroll`
Enroll in a course
```json
{
  "courseId": "course_id_here"
}
```

#### GET `/api/courses/enrolled`
Get user's enrolled courses

### Resources

#### GET `/api/resources`
Get all learning resources
**Query Parameters:**
- `type` - Filter by type (video, pdf, audio)
- `category` - Filter by category

#### GET `/api/resources/[id]`
Get resource details

#### POST `/api/resources/purchase`
Purchase a resource
```json
{
  "resourceId": "resource_id_here"
}
```

### Events

#### GET `/api/events`
Get all events
**Query Parameters:**
- `status` - Filter by status (upcoming, past)
- `type` - Filter by type

#### POST `/api/events/register`
Register for an event
```json
{
  "eventId": "event_id_here",
  "paymentMethod": "stripe"
}
```

### Market Analysis

#### GET `/api/market-analysis/currency-strength`
Get currency strength data

#### GET `/api/market-analysis/heatmap`
Get market heatmap data

### Forecasts

#### GET `/api/forecasts`
Get market forecasts
**Query Parameters:**
- `type` - Filter by type (community, premium)
- `status` - Filter by status (active, completed)

#### POST `/api/forecasts/[id]/like`
Like/unlike a forecast

#### POST `/api/forecasts/[id]/comments`
Add comment to forecast
```json
{
  "content": "Your comment here"
}
```

### Mentorship

#### GET `/api/mentorship`
Get mentorship programs

#### POST `/api/mentorship/register`
Register for mentorship
```json
{
  "programId": "program_id_here",
  "preferredTime": "2024-01-15T10:00:00Z"
}
```

#### POST `/api/mentorship/payment`
Process mentorship payment
```json
{
  "programId": "program_id_here",
  "paymentMethod": "stripe"
}
```

### Payments

#### POST `/api/stripe/create-payment-intent`
Create Stripe payment intent
```json
{
  "amount": 5000,
  "currency": "usd",
  "description": "Signals Subscription"
}
```

#### POST `/api/stripe/create-signals-payment-intent`
Create payment for signals subscription

### Admin Endpoints

#### GET `/api/admin/dashboard/stats`
Get admin dashboard statistics

#### GET `/api/admin/users`
Get all users (Admin only)

#### POST `/api/admin/users/[id]/role`
Update user role
```json
{
  "role": "admin"
}
```

#### GET `/api/admin/signals`
Get all signals (Admin only)

#### POST `/api/admin/signals`
Create new signal (Admin only)
```json
{
  "title": "Signal Title",
  "description": "Signal description",
  "currencyPair": "EUR/USD",
  "action": "buy",
  "entryPrice": 1.0850,
  "stopLoss": 1.0800,
  "takeProfit": 1.0900
}
```

#### PUT `/api/admin/signals/[id]`
Update signal (Admin only)

#### DELETE `/api/admin/signals/[id]`
Delete signal (Admin only)

#### GET `/api/admin/events`
Get all events (Admin only)

#### POST `/api/admin/events`
Create new event (Admin only)
```json
{
  "title": "Event Title",
  "description": "Event description",
  "date": "2024-01-15T10:00:00Z",
  "duration": 120,
  "price": 50.00,
  "maxParticipants": 20
}
```

#### GET `/api/admin/reports/overview`
Get system overview report

#### GET `/api/admin/reports/[type]`
Get specific report type
**Types:** users, revenue, signals, events

### Notifications

#### GET `/api/notifications`
Get user notifications

#### POST `/api/notifications/[id]/read`
Mark notification as read

#### POST `/api/notifications/mark-all-read`
Mark all notifications as read

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🔒 Error Codes

- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `PAYMENT_FAILED` - Payment processing error
- `SUBSCRIPTION_REQUIRED` - Premium subscription needed
- `RATE_LIMITED` - Too many requests

## 🧪 Testing

### Test Endpoints
- `GET /api/test-auth` - Test authentication
- `GET /api/test-simple` - Test basic functionality

### Test Data
Use the seeded test accounts for testing:
- Admin: `admin@corefx.com`
- Student: `student@corefx.com`
- Affiliate: `affiliate@corefx.com`

## 📊 Rate Limiting

- **General API**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **Payment**: 5 requests per minute

## 🔄 Webhooks

### Stripe Webhooks
- **Endpoint**: `/api/stripe/webhook`
- **Events**: payment_intent.succeeded, payment_intent.payment_failed

### Payment Webhooks
- **Endpoint**: `/api/payments/webhook`
- **Events**: subscription.created, subscription.updated, subscription.cancelled

---

**Need help?** Check the [Development Guide](./DEVELOPMENT.md) or [Deployment Guide](./DEPLOYMENT.md)
