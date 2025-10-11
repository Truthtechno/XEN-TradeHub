# CoreFX Development Guide

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18.0 or later
- **PostgreSQL** 13 or later
- **npm** or **yarn** package manager

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/Truthtechno/CoreFX
   cd CoreFX
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env.local
   # Configure your environment variables
   ```

3. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
corefx/
├── app/                    # Next.js 14 App Router
│   ├── (admin)/           # Admin dashboard routes
│   ├── (authenticated)/   # Protected user routes
│   ├── api/               # API endpoints
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # ShadCN/UI components
│   ├── layout/           # Layout components
│   └── admin/            # Admin-specific components
├── lib/                  # Utility functions and helpers
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data

## 🎨 Design System

### CoreFX Color Palette
- **Primary Red**: `#DC2626` - Main actions and highlights
- **Secondary Blue**: `#2563EB` - Secondary actions and links
- **Accent Orange**: `#EA580C` - Warnings and special features
- **Success Green**: `#16A34A` - Success states and profits
- **Premium Purple**: `#9333EA` - Premium features
- **Alert Yellow**: `#EAB308` - Alerts and highlights

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights, responsive sizing
- **Body Text**: Regular weight, optimized for readability

## 🗄️ Database Schema

### Main Entities
- **Users** - User accounts and profiles
- **Courses** - Online courses and content
- **Signals** - Trading signals and analysis
- **Resources** - Learning materials
- **Events** - Workshops and sessions
- **Forecasts** - Market predictions
- **Bookings** - Session scheduling
- **Affiliates** - Referral tracking
- **Notifications** - User notifications

## 🔐 Authentication System

### User Roles
- **Admin** - Full system access
- **Student** - Learning content access
- **Affiliate** - Referral tracking

### Authentication Methods
- JWT-based authentication
- Google OAuth integration
- Session management

## 💳 Payment Integration

### Supported Gateways
- **Stripe** - Primary payment processor
- **PayPal** - Alternative payment method
- **Mock Payment** - Development testing

### Subscription Plans
- **Free** - Basic access
- **Signals Plan** - Premium trading signals ($50/month)
- **Mentorship** - One-on-one coaching

## 🧪 Testing

### Test Accounts
- **Admin**: `admin@corefx.com` / `admin123`
- **Student**: `student@corefx.com` / `student123`
- **Affiliate**: `affiliate@corefx.com` / `affiliate123`

### Testing Scripts
- Run comprehensive tests: `npm run test`
- Test specific modules: `npm run test:signals`
- Test payments: `npm run test:payments`

## 🚀 Performance Optimization

- Next.js Image Optimization
- Code splitting for smaller bundles
- Lazy loading for non-critical components
- Database indexing for faster queries
- Caching strategies for API responses

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Component Guidelines
- Use ShadCN/UI components when possible
- Create reusable components in `/components/ui/`
- Follow the established design system
- Use proper TypeScript types

### API Guidelines
- Use Next.js API routes
- Implement proper error handling
- Add input validation with Zod
- Use consistent response formats

## 🐛 Debugging

### Common Issues
1. **Database Connection**: Check DATABASE_URL in .env.local
2. **Authentication**: Verify JWT_SECRET and NEXTAUTH_SECRET
3. **Payments**: Ensure Stripe keys are configured
4. **Build Errors**: Clear .next folder and rebuild

### Debug Tools
- Use browser dev tools for frontend debugging
- Check server logs for API issues
- Use Prisma Studio for database inspection
- Test API endpoints with Postman/curl

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Address review feedback

---

**Need help?** Check the [API Documentation](./API.md) or [Deployment Guide](./DEPLOYMENT.md)
