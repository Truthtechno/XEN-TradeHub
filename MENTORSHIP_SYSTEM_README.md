# One-on-One Mentorship System

A comprehensive mentorship management system for the CoreFX platform that allows students to register for one-on-one mentorship sessions and admins to manage registrations, payments, and appointments.

## 🎯 Features

### Student Portal
- **Registration Form**: Students can register for mentorship with detailed information
- **Payment Processing**: Secure $1,500 payment processing with automatic premium access
- **Premium Access**: Immediate access to all premium features after payment
- **Session Tracking**: View scheduled appointments and session history

### Admin Portal
- **Registration Management**: View, add, edit, and delete mentorship registrations
- **Payment Tracking**: Monitor payment status and revenue
- **Appointment Scheduling**: Schedule and manage one-on-one sessions
- **Student Management**: Upgrade/downgrade student premium status
- **Analytics Dashboard**: Comprehensive statistics and reporting

## 🏗️ System Architecture

### Database Schema
```sql
-- Mentorship Registration
model MentorshipRegistration {
  id        String   @id @default(cuid())
  userId    String
  name      String
  email     String
  phone     String
  country   String
  experience String
  goals     String
  status    String   @default("PENDING")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  appointments MentorshipAppointment[]
}

-- Mentorship Payment
model MentorshipPayment {
  id        String   @id @default(cuid())
  userId    String
  amount    Float
  currency  String
  status    String
  stripeId  String?
  registrationId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

-- Mentorship Appointment
model MentorshipAppointment {
  id        String   @id @default(cuid())
  registrationId String
  title     String
  description String?
  scheduledAt DateTime
  duration  Int      @default(60)
  status    String   @default("SCHEDULED")
  meetingLink String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  registration MentorshipRegistration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
}
```

### API Endpoints

#### Student APIs
- `POST /api/mentorship/register` - Register for mentorship
- `POST /api/mentorship/payment` - Process payment
- `GET /api/user/access` - Check access permissions

#### Admin APIs
- `GET /api/admin/mentorship` - Get all registrations with stats
- `POST /api/admin/mentorship` - Create new registration
- `PUT /api/admin/mentorship/[id]` - Update registration
- `DELETE /api/admin/mentorship/[id]` - Delete registration
- `GET /api/admin/mentorship/appointments` - Get all appointments
- `POST /api/admin/mentorship/appointments` - Create appointment
- `PUT /api/admin/mentorship/appointments/[id]` - Update appointment
- `DELETE /api/admin/mentorship/appointments/[id]` - Delete appointment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Next.js 14+

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

### Environment Variables
```env
DATABASE_URL="postgresql://username:password@localhost:5432/corefx"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 🧪 Testing

### Automated Tests
Run the comprehensive test suite:
```bash
node test-mentorship-system.js
```

### Manual Testing
1. Open `test-mentorship-ui.html` in your browser
2. Test student registration and payment flow
3. Test admin management functions
4. Verify premium status synchronization

### Test Coverage
- ✅ Student registration flow
- ✅ Payment processing
- ✅ Premium access granting
- ✅ Admin registration management
- ✅ Appointment scheduling
- ✅ Premium status synchronization
- ✅ Data export functionality

## 📊 Admin Dashboard Features

### Statistics Cards
- Total Registrations
- Completed Payments
- Upcoming Appointments
- Total Revenue

### Registration Management
- View all registrations with filtering
- Add new registrations manually
- Edit registration details
- Update payment status
- Upgrade/downgrade premium status
- Delete registrations

### Appointment Scheduling
- Schedule one-on-one sessions
- Set meeting links and notes
- Track appointment status
- Manage session details

### Data Export
- Export registrations to CSV
- Filter and search functionality
- Comprehensive reporting

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Role-based access control
- Admin-only API endpoints

### Data Validation
- Input sanitization
- Email format validation
- Phone number validation
- Required field validation

### Payment Security
- Secure payment processing
- Transaction logging
- Payment status tracking

## 🎨 UI Components

### Student Portal
- Responsive mentorship page
- Registration popup with validation
- Payment processing interface
- Access status display

### Admin Portal
- Comprehensive dashboard
- Data tables with sorting/filtering
- Modal forms for data entry
- Real-time statistics

## 🔄 Premium Status Synchronization

The system ensures that premium status changes are properly synchronized:

1. **Student Payment**: Automatically upgrades to premium
2. **Admin Upgrade**: Manually upgrade student to premium
3. **Admin Downgrade**: Remove premium status
4. **Access Control**: Real-time access permission updates

## 📈 Analytics and Reporting

### Key Metrics
- Registration conversion rate
- Payment success rate
- Revenue tracking
- Appointment completion rate

### Export Options
- CSV export for registrations
- Custom date range filtering
- Status-based filtering
- Search functionality

## 🛠️ Development

### Code Structure
```
app/
├── (authenticated)/
│   ├── one-on-one/          # Student mentorship page
│   └── admin/
│       └── mentorship/      # Admin dashboard
├── api/
│   ├── mentorship/          # Student APIs
│   └── admin/
│       └── mentorship/      # Admin APIs
components/
├── ui/
│   └── mentorship-registration-popup.tsx
lib/
├── access-control.ts        # Premium access management
└── mentorship-storage.ts    # Data storage utilities
```

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name add-mentorship-appointments

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

## 🚨 Troubleshooting

### Common Issues

1. **Payment Not Processing**
   - Check payment gateway configuration
   - Verify API endpoints are accessible
   - Check database connection

2. **Premium Status Not Updating**
   - Verify access control service
   - Check user role updates
   - Clear authentication cache

3. **Appointment Scheduling Issues**
   - Check date/time format
   - Verify registration exists
   - Check database constraints

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=mentorship:*
```

## 📝 API Documentation

### Registration Object
```typescript
interface MentorshipRegistration {
  id: string
  name: string
  email: string
  phone: string
  country: string
  experience: string
  goals: string
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  appointments: MentorshipAppointment[]
}
```

### Appointment Object
```typescript
interface MentorshipAppointment {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  meetingLink: string
  notes: string
  createdAt: string
  updatedAt: string
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
