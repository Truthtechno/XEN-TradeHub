# CoreFX - Professional Forex Trading Platform

**CoreFX** helps you create a comprehensive forex trading ecosystem with advanced analytics, educational resources, and community engagement. Built with modern web technologies for scalability and performance.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

## 🎯 Goals

- **Professional Trading Platform** - Complete forex trading ecosystem with advanced features
- **Educational Excellence** - Comprehensive learning resources and mentorship programs
- **Community Engagement** - Active trading community with real-time collaboration
- **Scalable Architecture** - Modern tech stack for enterprise-level performance
- **User-Centric Design** - Intuitive interface optimized for traders of all levels

## ✨ Features

### 🏢 Core Trading Modules
- **📊 Dashboard** - Personalized trading hub with real-time statistics
- **📈 Signals** - Premium trading signals with detailed market analysis
- **🌍 Market Analysis** - Live currency heatmap and comprehensive market insights
- **📚 Online Courses** - Self-paced learning with interactive video content
- **🎓 Academy** - Professional training programs and workshops
- **📖 Learning Resources** - Videos, webinars, podcasts, and educational materials
- **👨‍🏫 One-on-One Coaching** - Personalized mentoring and trading guidance
- **📅 Events** - Live trading workshops and educational sessions
- **🔮 Market Forecasts** - Community and premium market predictions
- **🤝 Affiliate Programs** - Commission-based referral and partnership system (COMING SOON)
- **📊 Sentiment Voting** - Community market sentiment analysis and polls (COMING SOON)
- **💬 Live Support** - Real-time customer support and trading assistance
- **📋 Booking System** - Session scheduling and management platform (COMING SOON)
- **🤝 Collaborations** - Brand partnership and business opportunities (COMING SOON)

### 🛠️ Technical Capabilities
- **📱 Responsive Design** - Mobile-first approach for seamless cross-device experience
- **⚡ Real-time Data** - Live market data and advanced currency strength analysis
- **🔐 Secure Authentication** - JWT-based authentication with Google OAuth integration
- **💳 Payment Processing** - Stripe and PayPal integration for seamless transactions
- **🗄️ Advanced Database** - PostgreSQL with Prisma ORM for optimal performance
- **👨‍💼 Admin Dashboard** - Comprehensive content management and analytics
- **🔌 API Integration** - Exness, TradingView, and economic calendar APIs

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, ShadCN/UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with JWT
- **Payments**: Stripe, PayPal
- **Styling**: TailwindCSS with custom CoreFX theme
- **Icons**: Lucide React
- **Charts**: Recharts

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0 or later
- **PostgreSQL** 13 or later
- **npm** or **yarn** package manager

### Installation Steps

1. **📥 Clone the Repository**
   ```bash
   git clone https://github.com/Truthtechno/CoreFX
   cd CoreFX
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
   DATABASE_URL="postgresql://username:password@localhost:5432/corefx"
   
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
- **Email**: `admin@corefx.com`
- **Password**: `admin123` (or OAuth login)
- **Role**: System Administrator
- **Access**: Full platform management

### 👨‍🎓 Student Account
- **Email**: `student@corefx.com`
- **Password**: `student123` (or OAuth login)
- **Role**: Trading Student
- **Subscription**: Premium Signals Plan
- **Features**: Full access to educational content

### 💼 Affiliate Account
- **Email**: `affiliate@corefx.com`
- **Password**: `affiliate123` (or OAuth login)
- **Role**: Affiliate Partner
- **Features**: Referral tracking and commission management

## 🎨 Design System

### 🎨 CoreFX Color Palette
- **🔴 CoreFX Red**: `#DC2626` - Primary actions, highlights, and CTAs
- **🔵 CoreFX Blue**: `#2563EB` - Secondary actions, links, and navigation
- **🟠 CoreFX Orange**: `#EA580C` - Accents, warnings, and special features
- **🟢 CoreFX Green**: `#16A34A` - Success states, positive values, and profits
- **🟣 CoreFX Purple**: `#9333EA` - Premium features and exclusive content
- **🟡 CoreFX Yellow**: `#EAB308` - Alerts, highlights, and attention-grabbing elements

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
corefx/
├── app/                    # Next.js 14 App Router
│   ├── (admin)/           # Admin dashboard routes
│   ├── (authenticated)/   # Protected user routes
│   ├── api/               # API endpoints
│   ├── dashboard/         # Main dashboard
│   ├── signals/           # Trading signals module
│   ├── market-analysis/   # Market analysis tools
│   ├── courses/           # Educational content
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
- **Users** - User accounts and profiles
- **Courses** - Online courses and content
- **Signals** - Trading signals and analysis
- **Resources** - Learning materials
- **Events** - Workshops and sessions
- **Forecasts** - Market predictions
- **Bookings** - Session scheduling
- **Affiliates** - Referral tracking
- **Notifications** - User notifications

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Role-based access control** (Admin, Student, Affiliate)
- **Input validation** with Zod schemas
- **SQL injection protection** via Prisma ORM
- **XSS protection** with React's built-in escaping
- **CSRF protection** with NextAuth.js

## 📈 Performance Optimizations

- **Next.js Image Optimization** for faster loading
- **Code splitting** for smaller bundle sizes
- **Lazy loading** for non-critical components
- **Database indexing** for faster queries
- **Caching strategies** for API responses

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
- **📧 Email**: [support@corefx.com](mailto:support@corefx.com)
- **📚 Documentation**: [docs.corefx.com](https://docs.corefx.com)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-username/corefx/issues)
- **💬 Community**: [Discord Server](https://discord.gg/corefx)
- **📱 Live Chat**: Available in the application

### 🤝 Business Inquiries
- **Partnerships**: [partnerships@corefx.com](mailto:partnerships@corefx.com)
- **Enterprise**: [enterprise@corefx.com](mailto:enterprise@corefx.com)
- **Media**: [media@corefx.com](mailto:media@corefx.com)

## 🙏 Acknowledgments

### 🏆 Core Contributors
- **Bryan Amooti** - Lead Developer & System Architect
- **CoreFX Team** - Trading expertise and platform development

### 🛠️ Technology Partners
- **Next.js Team** - Revolutionary React framework
- **TailwindCSS** - Utility-first CSS framework
- **ShadCN/UI** - Beautiful component library
- **Prisma** - Type-safe database toolkit
- **Vercel** - Deployment and hosting platform

### 📈 Trading Partners
- **Exness** - Broker integration and API
- **TradingView** - Market data and charting
- **Stripe** - Payment processing

---

<div align="center">

**🚀 Built with ❤️ by [Bryan Amooti](https://github.com/Truthtechno/)**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Truthtechno/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/brian-amooti)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/trustdigitalsol)

</div>
