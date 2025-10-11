# Notification System Documentation

## Overview

The notification system has been completely rebuilt and professionalized to provide a comprehensive, real-time notification management solution for the COREFX application. The system now supports multiple notification types, real-time updates, and professional admin management features.

## Architecture

### Database Schema

The notification system uses a unified `Notification` model with the following structure:

```prisma
model Notification {
  id        String             @id @default(cuid())
  userId    String
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  type      NotificationType
  isRead    Boolean            @default(false)
  actionUrl String?
  createdAt DateTime           @default(now())

  @@map("notifications")
}

enum NotificationType {
  SIGNAL
  COURSE
  BOOKING
  PAYMENT
  SYSTEM
  LOGIN
  WELCOME
  UPDATE
  SECURITY
  PROMOTION
}
```

### System Components

1. **Unified Notification Context** (`lib/notifications-context.tsx`)
   - Centralized state management for all notifications
   - Real-time notification updates
   - Support for both user notifications and NEW notifications

2. **API Endpoints**
   - `/api/notifications` - Main notification CRUD operations
   - `/api/notifications/[id]` - Individual notification management
   - `/api/admin/notifications` - Admin notification management
   - `/api/new-notifications` - Page-specific NEW notifications

3. **UI Components**
   - Professional notifications page (`app/(authenticated)/notifications/page.tsx`)
   - Real-time notification panel in right sidebar
   - Admin notification management interface

## Features

### User Features

1. **Real-time Notifications**
   - Live notification updates without page refresh
   - Unread count tracking in header
   - Visual indicators for unread notifications

2. **Notification Management**
   - Mark individual notifications as read
   - Mark all notifications as read
   - Delete notifications
   - Filter by type and status
   - Search functionality

3. **Professional UI**
   - Modern, responsive design
   - Dark/light mode support
   - Loading states and error handling
   - Statistics dashboard

4. **Notification Types**
   - **LOGIN**: Login attempts and security alerts
   - **WELCOME**: Account creation and onboarding
   - **SYSTEM**: System maintenance and updates
   - **UPDATE**: Profile and account updates
   - **SECURITY**: Security-related notifications
   - **PROMOTION**: Marketing and promotional content

### Admin Features

1. **Bulk Operations**
   - Send notifications to all users
   - Send notifications to specific users
   - Bulk delete operations
   - Mass mark as read

2. **Analytics & Statistics**
   - Total notification counts
   - Unread/read statistics
   - Notification type breakdown
   - User engagement metrics

3. **Advanced Management**
   - Search and filter notifications
   - Pagination support
   - Audit logging for all actions
   - Role-based access control

## API Reference

### User Notifications

#### GET /api/notifications
Get user notifications with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by notification type
- `status` (optional): Filter by read status ('read', 'unread', 'all')

**Response:**
```json
{
  "notifications": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "unreadCount": 15
}
```

#### POST /api/notifications
Mark notifications as read.

**Body:**
```json
{
  "notificationIds": ["id1", "id2"],
  "markAll": false
}
```

#### PUT /api/notifications
Create a new notification.

**Body:**
```json
{
  "title": "Notification Title",
  "message": "Notification message",
  "type": "SYSTEM",
  "actionUrl": "/dashboard"
}
```

### Admin Notifications

#### GET /api/admin/notifications
Get all notifications for admin management.

**Query Parameters:**
- `page`, `limit`, `type`, `status`, `search`

**Response:**
```json
{
  "notifications": [...],
  "pagination": {...},
  "stats": {
    "total": 1000,
    "unread": 150,
    "read": 850,
    "byType": [...]
  }
}
```

#### POST /api/admin/notifications
Create notifications (bulk or individual).

**Body:**
```json
{
  "userId": "user_id", // optional
  "title": "Notification Title",
  "message": "Notification message",
  "type": "SYSTEM",
  "actionUrl": "/dashboard",
  "sendToAll": false
}
```

## Usage Examples

### Creating Notifications

```typescript
import { useNotifications } from '@/lib/notifications-context'

function MyComponent() {
  const { createNotification } = useNotifications()

  const handleCreateNotification = async () => {
    await createNotification({
      title: 'New Feature Available',
      message: 'Check out our latest trading tools!',
      type: 'UPDATE',
      actionUrl: '/features'
    })
  }

  return (
    <button onClick={handleCreateNotification}>
      Create Notification
    </button>
  )
}
```

### Using Notifications in Components

```typescript
import { useNotifications } from '@/lib/notifications-context'

function NotificationBell() {
  const { unreadCount, notifications } = useNotifications()

  return (
    <div className="relative">
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <Badge variant="destructive" className="absolute -top-2 -right-2">
          {unreadCount}
        </Badge>
      )}
    </div>
  )
}
```

## Database Seeding

The system includes a comprehensive seeding script to populate the database with sample notifications:

```bash
npx tsx scripts/seed-notifications.ts
```

This creates various notification types for testing and demonstration purposes.

## Security Features

1. **Authentication Required**
   - All API endpoints require user authentication
   - Admin endpoints require appropriate role permissions

2. **Data Validation**
   - Zod schema validation for all inputs
   - Type safety with TypeScript
   - Input sanitization

3. **Audit Logging**
   - All admin actions are logged
   - User notification actions are tracked
   - Comprehensive audit trail

## Performance Optimizations

1. **Efficient Queries**
   - Pagination for large datasets
   - Indexed database queries
   - Optimized Prisma queries

2. **Real-time Updates**
   - Context-based state management
   - Minimal re-renders
   - Efficient data fetching

3. **Caching**
   - Local storage for viewed notifications
   - Optimistic UI updates
   - Smart refresh strategies

## Migration Guide

### From Old System

The new notification system replaces the previous mock-based system. Key changes:

1. **Remove Mock Data**: All hardcoded notification arrays have been removed
2. **Update Imports**: Use `useNotifications` instead of `useNewNotifications`
3. **Database Migration**: Run `npx prisma db push` to update schema
4. **Seed Data**: Run the seeding script to populate sample data

### Breaking Changes

1. **API Changes**: New unified API endpoints
2. **Context Changes**: New notification context structure
3. **Type Changes**: Updated notification type enums
4. **UI Changes**: New notification page and panel designs

## Troubleshooting

### Common Issues

1. **Notifications Not Loading**
   - Check authentication status
   - Verify database connection
   - Check API endpoint responses

2. **Real-time Updates Not Working**
   - Ensure context provider is properly wrapped
   - Check for JavaScript errors in console
   - Verify notification state management

3. **Admin Features Not Accessible**
   - Verify user role permissions
   - Check authentication status
   - Ensure proper API endpoint access

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'notifications')
```

## Future Enhancements

1. **Push Notifications**
   - Browser push notification support
   - Mobile app integration
   - Email notifications

2. **Advanced Features**
   - Notification templates
   - Scheduled notifications
   - User preferences
   - Notification channels

3. **Analytics**
   - Click-through rates
   - Engagement metrics
   - A/B testing support

## Support

For technical support or questions about the notification system, please refer to the main project documentation or contact the development team.
