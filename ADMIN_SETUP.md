# CoreFX Admin Panel Setup Guide

This guide will help you set up the CoreFX admin panel with all the necessary components and configurations.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/corefx_admin"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# JWT
JWT_SECRET="your-jwt-secret-here"

# Stripe (optional)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Sentry (optional)
SENTRY_DSN="your-sentry-dsn"
```

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with demo data
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

The admin panel will be available at `http://localhost:3000/admin`

## Default Admin Credentials

After running the seed script, you can log in with:

- **Super Admin**: admin@corefx.com / admin123
- **Analyst**: analyst@corefx.com / analyst123  
- **Editor**: editor@corefx.com / editor123

## Admin Panel Features

### 🏠 Dashboard
- Real-time KPIs and metrics
- User growth charts
- Revenue analytics
- Recent activity feed
- Auto-refresh every 5 minutes

### 👥 User Management
- View all users with pagination
- Search and filter by role, country
- Edit user details and roles
- View user subscriptions and activity
- Export user data to CSV
- Soft delete functionality

### 📊 Signals Management
- Create and publish trading signals
- Set visibility (private, public, subscribers only)
- Track signal performance and hit rates
- Manage signal subscribers
- Bulk actions and audit trail

### 📚 Courses Management
- CRUD operations for courses
- Drag-and-drop lesson ordering
- Video URL management
- Pricing and status controls
- Enrollment tracking
- Course analytics

### 🔗 Broker Management
- Manage broker referral links
- Track clicks and conversions
- Verify broker registrations
- Set default links
- Conversion analytics

### 📖 Resources Library
- Manage videos, webinars, podcasts, ebooks
- Tagging and categorization
- Premium/free content toggle
- View analytics and engagement
- Bulk operations

### 🗳️ Polls & Events
- Create sentiment polls
- Schedule poll opening/closing
- Real-time poll results
- Event management
- Registration tracking
- Revenue analytics

### 💰 Affiliates
- Manage affiliate programs
- Track clicks and registrations
- Set commission rates
- Performance analytics
- Export affiliate data

### 📢 Notifications & Banners
- Create in-app notifications
- Audience targeting
- Multi-channel delivery
- Banner management
- HTML editor with sanitization
- Delivery logs

### ⚙️ Settings & Features
- Global system settings
- Feature flag management
- Payment configuration
- Appearance customization
- Role-based permissions

### 📈 Reports & Analytics
- Comprehensive reporting system
- Export to CSV/PDF
- User analytics
- Revenue reports
- Signal performance
- Broker conversion funnels

## API Endpoints

All admin API endpoints are protected with RBAC and include:

- `GET/POST /api/admin/users` - User management
- `GET/POST /api/admin/signals` - Signal management
- `GET/POST /api/admin/courses` - Course management
- `GET/POST /api/admin/resources` - Resource management
- `GET/POST /api/admin/polls` - Poll management
- `GET/POST /api/admin/events` - Event management
- `GET/POST /api/admin/trade/links` - Broker link management
- `GET/POST /api/admin/affiliates/programs` - Affiliate management
- `GET/POST /api/admin/notifications` - Notification management
- `GET/POST /api/admin/banners` - Banner management
- `GET/POST /api/admin/features` - Feature flag management
- `GET /api/admin/reports/[type]` - Report generation

## Security Features

- **RBAC**: Role-based access control with 5 admin roles
- **Audit Logging**: All data mutations are logged
- **Input Validation**: Zod schemas for all API endpoints
- **CSRF Protection**: Built-in CSRF protection
- **Rate Limiting**: API rate limiting (configurable)
- **Data Sanitization**: HTML content sanitization for banners

## Database Schema

The admin panel uses the following main entities:

- **Users**: User accounts with roles and profiles
- **Signals**: Trading signals with visibility controls
- **Courses**: Educational content with lessons
- **Resources**: Library content (videos, webinars, etc.)
- **Polls**: Sentiment voting system
- **Events**: Webinars and workshops
- **Broker Links**: Referral link management
- **Affiliates**: Affiliate program tracking
- **Notifications**: System announcements
- **Banners**: Site-wide announcements
- **Feature Flags**: Feature toggle system
- **Audit Logs**: Action tracking

## Development

### Adding New Admin Pages

1. Create page component in `app/(admin)/admin/[page]/page.tsx`
2. Add API endpoints in `app/api/admin/[resource]/route.ts`
3. Update navigation in `components/admin/admin-sidebar.tsx`
4. Add RBAC checks for appropriate roles

### Adding New API Endpoints

1. Create route handler in `app/api/admin/[resource]/route.ts`
2. Add Zod validation schemas
3. Implement RBAC authorization
4. Add audit logging for mutations
5. Update API documentation

### Database Changes

1. Update Prisma schema in `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Update seed script if needed
4. Test with `npm run db:seed`

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **Authentication**: Check NEXTAUTH_SECRET is set
3. **Permissions**: Verify user has correct admin role
4. **API Errors**: Check browser console and server logs

### Logs

- Server logs: Check terminal output
- Database logs: Check PostgreSQL logs
- Client errors: Check browser console
- Audit logs: Check `audit_logs` table in database

## Production Deployment

1. Set up production PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to Vercel/Netlify/AWS
5. Set up monitoring and logging
6. Configure backup strategy

## Support

For issues or questions:
- Check the troubleshooting section
- Review the API documentation
- Check the audit logs for errors
- Contact the development team

---

**Note**: This admin panel is designed for internal use only. Ensure proper security measures are in place before deploying to production.
