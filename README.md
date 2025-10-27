# XEN TradeHub - Complete Trading Business Platform

**XEN TradeHub** is a comprehensive trading business platform designed for companies to manage trading activities, partnerships, and user engagement. Built with modern web technologies for scalability and performance.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

## 🎯 Goals

- **Complete Business Platform** - Comprehensive trading ecosystem for companies
- **Partnership Management** - Manage broker partnerships and trading relationships
- **Community Trading** - Copy trading and follower engagement features
- **Revenue Generation** - Affiliate programs, academy monetization, and commission systems
- **Scalable Architecture** - Modern tech stack for enterprise-level performance
- **User-Centric Design** - Intuitive interface optimized for businesses and traders

## ✨ Features

### 🏢 Core Business Modules
- **📊 Dashboard** - Comprehensive control center with real-time statistics and quick access to all features
- **🏛️ Trade Through Us** - Partner broker account management and submission system
- **📋 Copy Trading** - Master trader profiles with subscription management and follower tracking
- **🏆 Monthly Challenge** - Referral contests with automatic payout and progress tracking
- **🎓 Academy** - Managed training programs with class scheduling and student progress
- **💰 Affiliates** - Complete affiliate program with commission tracking, payouts, and detailed analytics
- **💬 Live Enquiry** - Real-time customer support with inquiry management
- **🔔 Notifications** - System-wide notification management for users and admins
- **⚙️ Features & Permissions** - Role-based access control and feature management
- **📊 Reports** - Comprehensive analytics and reporting dashboard
- **🔧 Settings** - System configuration and customization

### 🛠️ Technical Capabilities
- **📱 Responsive Design** - Mobile-first approach for seamless cross-device experience
- **⚡ Real-time Analytics** - Live data tracking for commissions, subscriptions, and user activity
- **🔐 Secure Authentication** - JWT-based authentication with Google OAuth integration
- **💳 Payment Processing** - Stripe and PayPal integration for seamless transactions
- **🗄️ Advanced Database** - PostgreSQL with Prisma ORM for optimal performance
- **👨‍💼 Admin Dashboard** - Comprehensive business management and analytics
- **💰 Commission System** - Automated affiliate commission tracking and payout management
- **📄 Export & Reporting** - Excel export functionality for detailed analytics
- **🔔 Notification System** - Real-time notifications for users and admins

### 🎯 Key Module Highlights

#### Admin Dashboard
- **User Management** - Complete user lifecycle management with role assignment
- **Broker Management** - Partner broker onboarding and account tracking
- **Copy Trading Admin** - Approve master traders, manage subscriptions, track followers
- **Monthly Challenge** - Create challenges, monitor progress, process payouts
- **Academy Management** - Schedule classes, track enrollments, manage students
- **Affiliate Administration** - Track referrals, calculate commissions, process payouts
- **Live Enquiry** - Manage customer support tickets and inquiries
- **Notification Center** - Send targeted notifications to users or groups
- **Feature Permissions** - Control access to features by role
- **System Settings** - Configure platform-wide settings
- **Reports Dashboard** - Comprehensive analytics and insights

#### User Dashboard  
- **Trade Through Us** - Submit broker accounts for partnership verification
- **Copy Trading** - Browse and subscribe to master traders
- **Monthly Challenge** - Participate in referral contests and track earnings
- **Academy** - Enroll in courses and attend classes
- **Earn With Us** - Join the affiliate program, track referrals and commissions
- **Live Enquiry** - Submit support requests and get help
- **Notifications** - Stay updated with system notifications
- **Dashboard Overview** - Quick access to all features with activity summary

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, ShadCN/UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with JWT
- **Payments**: Stripe, PayPal
- **Styling**: TailwindCSS with custom XEN TradeHub theme
- **Icons**: Lucide React
- **Charts**: Recharts
- **Data Export**: Excel/CSV export functionality

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0 or later
- **PostgreSQL** 13 or later
- **npm** or **yarn** package manager

### Installation Steps

1. **📥 Clone the Repository**
   ```bash
   git clone https://github.com/Truthtechno/xen-tradehub
   cd xen-tradehub
   ```

2. **📦 Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **⚙️ Environment Configuration**
   ```bash
   cp env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/xen_tradehub"
   
   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   JWT_SECRET="your-jwt-secret-key"
   
   # Payment Gateways
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
   
   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # API Keys
   EXNESS_API_KEY="your-exness-api-key"
   TRADINGVIEW_API_KEY="your-tradingview-api-key"
   ```

4. **🗄️ Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Create database tables
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **🏃‍♂️ Start Development Server**
   ```bash
   npm run dev
   ```

6. **🌐 Access the Application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### 🐳 Docker Setup (Alternative)
```bash
# Using Docker Compose
docker-compose up -d

# Access the application
open http://localhost:3000
```

## 👥 Demo Accounts

The system comes pre-configured with demo accounts for testing:

### 🔧 Administrator Account
- **Email**: `admin@xentradehub.com`
- **Password**: `admin123` (or OAuth login)
- **Role**: SUPERADMIN
- **Access**: Full platform management, all modules and settings

### 👤 Standard User Account
- **Email**: Varies (example: `brian@example.com`)
- **Password**: (Created during registration)
- **Role**: User
- **Features**: Access to Trade Through Us, Copy Trading, Monthly Challenge, Academy, Affiliates, Live Enquiry

## 🎨 Design System

### 🎨 XEN TradeHub Color Palette
- **🔴 Primary Red**: `#DC2626` - Primary actions, highlights, and CTAs (Super Admin badges)
- **🔵 Primary Blue**: `#2563EB` - Secondary actions, links, and navigation
- **🟠 Accent Orange**: `#EA580C` - Calculators and special features
- **🟢 Success Green**: `#16A34A` - Success states, earnings, and positive values
- **🟣 Accent Purple**: `#9333EA` - Copy Trading and premium features
- **🟡 Warning Yellow**: `#EAB308` - Alerts, highlights, and attention-grabbing elements
- **🌸 Enquiry Pink**: Used for Live Enquiry interactions

### 📝 Typography System
- **Font Family**: Inter (Google Fonts) - Clean, modern, and highly readable
- **Headings**: Bold weights, responsive sizing (text-2xl to text-5xl)
- **Body Text**: Regular weight, optimized for readability
- **Captions**: Light weight, muted colors for secondary information

### 🧩 Component Library
- **Cards**: Rounded corners, subtle shadows, smooth hover transitions
- **Buttons**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Badges**: Color-coded status indicators with consistent styling
- **Forms**: Clean inputs with focus states and validation feedback
- **Navigation**: Intuitive sidebar with active states and smooth transitions

## 📱 Mobile Responsiveness

The application is fully responsive with:
- **Mobile-first design** approach
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly** interface elements
- **Optimized navigation** for mobile devices
- **Responsive typography** that scales appropriately

## 🔧 Development

### 📁 Project Structure
```
xen-tradehub/
├── app/                    # Next.js 14 App Router
│   ├── (admin)/           # Admin dashboard routes
│   │   ├── users/         # User management
│   │   ├── brokers/       # Broker partnerships
│   │   ├── copy-trading/  # Copy trading management
│   │   ├── monthly-challenge/ # Challenge management
│   │   ├── academy/       # Academy management
│   │   ├── affiliates/    # Affiliate management
│   │   ├── live-enquiry/  # Enquiry management
│   │   ├── notifications/ # Notification management
│   │   ├── features/      # Feature permissions
│   │   ├── settings/      # System settings
│   │   └── reports/       # Reports and analytics
│   ├── (authenticated)/   # Protected user routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── trade-through-us/ # Broker submissions
│   │   ├── copy-trading/  # Browse traders
│   │   ├── monthly-challenge/ # Challenge participation
│   │   ├── academy/       # Educational content
│   │   ├── earn-with-us/  # Affiliate program
│   │   └── live-enquiry/  # Support requests
│   ├── api/               # API endpoints
│   └── ...                # Additional modules
├── components/            # Reusable UI components
│   ├── ui/               # ShadCN/UI components
│   ├── layout/           # Layout components
│   └── forms/            # Form components
├── lib/                  # Utility functions and helpers
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── middleware.ts         # Next.js middleware
└── public/               # Static assets and images
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with dummy data

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Compatible with Next.js static export
- **Railway**: Full-stack deployment with database
- **DigitalOcean**: VPS deployment with Docker

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:
- **Users** - User accounts and profiles with role-based permissions
- **Brokers** - Broker partnerships and submissions
- **CopyTrading** - Master trader profiles and subscriptions
- **MonthlyChallenge** - Challenge contests and participant tracking
- **Academy** - Educational classes and enrollment
- **Affiliates** - Affiliate network and commission tracking
- **Commissions** - Automated commission calculation and payouts
- **Enquiries** - Live customer support inquiries
- **Notifications** - System-wide user and admin notifications
- **Features** - Feature flags and permissions management

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Role-based access control** (SUPERADMIN, Admin, User)
- **Feature-level permissions** for granular access control
- **Input validation** with Zod schemas
- **SQL injection protection** via Prisma ORM
- **XSS protection** with React's built-in escaping
- **CSRF protection** with NextAuth.js
- **Secure commission calculations** with automated payout verification

## 📈 Performance Optimizations

- **Next.js Image Optimization** for faster loading
- **Code splitting** for smaller bundle sizes
- **Lazy loading** for non-critical components
- **Database indexing** for faster queries
- **Caching strategies** for API responses
- **Excel export optimization** for large datasets
- **Real-time notification batching** for improved performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Contact

### 📞 Get Help
- **📧 Email**: [support@xentradehub.com](mailto:support@xentradehub.com)
- **📚 Documentation**: [docs.xentradehub.com](https://docs.xentradehub.com)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Truthtechno/xen-tradehub/issues)
- **💬 Community**: [Discord Server](https://discord.gg/xentradehub)
- **📱 Live Enquiry**: Available in the application dashboard

### 🤝 Business Inquiries
- **Partnerships**: [partnerships@xentradehub.com](mailto:partnerships@xentradehub.com)
- **Enterprise**: [enterprise@xentradehub.com](mailto:enterprise@xentradehub.com)
- **Broker Integrations**: [brokers@xentradehub.com](mailto:brokers@xentradehub.com)

## 🙏 Acknowledgments

### 🏆 Core Contributors
- **Bryan Amooti** - Lead Developer & System Architect
- **XEN TradeHub Team** - Trading platform development and business expertise

### 🛠️ Technology Partners
- **Next.js Team** - Revolutionary React framework
- **TailwindCSS** - Utility-first CSS framework
- **ShadCN/UI** - Beautiful component library
- **Prisma** - Type-safe database toolkit
- **Vercel** - Deployment and hosting platform

### 💰 Payment & Integration Partners
- **Stripe** - Payment processing and subscription management
- **PayPal** - Alternative payment gateway
- **Excel/CSV Export** - Data export functionality
- **NextAuth.js** - Authentication and session management

---

<div align="center">

**🚀 Built with ❤️ by [Bryan Amooti](https://github.com/Truthtechno/)**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Truthtechno/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/brian-amooti)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/trustdigitalsol)

**XEN TradeHub - Complete Trading Business Platform**

</div>
